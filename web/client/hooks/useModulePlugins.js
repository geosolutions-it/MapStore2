/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useEffect, useMemo, useState} from 'react';
import {createPlugin, getPlugins, isMapStorePlugin, normalizeName} from '../utils/PluginsUtils';
import {getStore} from '../utils/StateUtils';
import join from 'lodash/join';
import {size} from "lodash";

function filterRemoved(registry, removed = []) {
    return Object.keys(registry).reduce((acc, p) => {
        if (removed.indexOf(p) !== -1) {
            return acc;
        }
        return {
            ...acc,
            [p]: registry[p]
        };
    }, {});
}

let storedPlugins = {};
const pluginsCache = {};

/**
 * hook to perform loading, caching and fetching previously loaded module plugins based on passed configuration
 * @param {object} pluginsEntries - object containing complete set of module plugins registered in app.
 * @param {array} pluginsConfig - list of the plugins should be loaded or fetched from cache
 * @param {array} removed - list of removed plugins
 * @returns {{plugins: {}, pending: boolean}}
 */
function useModulePlugins({
    pluginsEntries = {},
    pluginsConfig = [],
    removed = []
}) {
    const [plugins, setPlugins] = useState(storedPlugins);
    const [pending, setPending] = useState(true);
    const normalizedEntries = useMemo(
        () => Object.keys(pluginsEntries).reduce((prev, current) => ({...prev, [normalizeName(current)]: pluginsEntries[current]}), {}),
        [pluginsEntries]
    );
    const pluginsKeys = useMemo(() => pluginsConfig.reduce((prev, curr) => {
        const key = normalizeName(curr?.name ?? curr);
        if (normalizedEntries[key]) {
            return [ ...prev, key];
        }
        return prev;
    }, []),
    [pluginsConfig]);
    const pluginsString = join(pluginsKeys, ',');

    useEffect(() => {
        const filteredPluginsKeys = pluginsKeys
            .filter((pluginName) => !pluginsCache[pluginName]);
        if (filteredPluginsKeys.length > 0) {
            setPending(true);
            const loadPlugins = filteredPluginsKeys
                .map(pluginName => {
                    return normalizedEntries[pluginName]().then((mod) => {
                        return mod.default;
                    });
                });
            Promise.all(loadPlugins)
                .then((impls) => {
                    const store = getStore();
                    impls.forEach(impl => {
                        if (size(impl.reducers)) {
                            Object.keys(impl.reducers).forEach((name) => store.storeManager.addReducer(name, impl.reducers[name]));
                            store.dispatch({type: 'REDUCERS_LOADED'});
                        }
                        if (size(impl.epics)) {
                            store.storeManager.addEpics(impl.name, impl.epics);
                        }
                    });
                    return getPlugins({
                        ...filterRemoved(impls.map(impl => {
                            if (!isMapStorePlugin(impl?.component)) {
                                // plugin similar to Toolbar implement a selector function
                                // so need to be parsed separately
                                return {
                                    [impl.name + 'Plugin']: impl.component
                                };
                            }
                            return createPlugin(impl.name, impl);
                        }), removed)
                    });
                })
                .then((newPlugins) => {
                    Object.keys(newPlugins).forEach(pluginName => {
                        pluginsCache[pluginName] = true;
                    });
                    storedPlugins = {
                        ...storedPlugins,
                        ...newPlugins
                    };
                    setPlugins(storedPlugins);
                    setPending(false);
                })
                .catch(() => {
                    setPlugins({});
                    setPending(false);
                });
        } else {
            setPlugins(storedPlugins);
            setPending(false);
        }
    }, [ pluginsString ]);

    useEffect(() => {
        const store = getStore();
        if (store.storeManager) {
            Object.keys(pluginsCache).forEach((plugin) => {
                if (!pluginsKeys.includes(plugin)) {
                    store.storeManager.muteEpics(plugin);
                } else {
                    store.storeManager.unmuteEpics(plugin);
                }
            });
        }
    }, [pluginsString]);

    return { plugins, pending };
}

export default useModulePlugins;
