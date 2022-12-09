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
import {reducersLoaded} from "../actions/storemanager";
import url from "url";

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
let location = '';
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
                    const reducersList = [];
                    impls.forEach(impl => {
                        if (size(impl.reducers)) {
                            Object.keys(impl.reducers).forEach((name) => {
                                store.storeManager.addReducer(name, impl.reducers[name]);
                                reducersList.push(name);
                            });
                        }
                        if (size(impl.epics)) {
                            store.storeManager.addEpics(impl.name, impl.epics);
                            store.storeManager.unmuteEpics(impl.name);
                        }
                    });
                    if (reducersList.length) {
                        store.dispatch(reducersLoaded(reducersList));
                    }
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
        const urlQuery = url.parse(window.location.href, true).hash;
        if (store.storeManager) {
            // some plugins like ContextCreator have edge-case of this scenario:
            // there are two PluginsContainer components, whereas inner one load another list of plugins, like mapViewer
            // on second step of context creator. To make it properly work, we need to check if router.location.path has
            // changed and do not mute epics unless that's the case. Epics can be unmuted with no limitations though.
            Object.keys(pluginsCache).forEach((plugin) => {
                if (!pluginsKeys.includes(plugin) && urlQuery !== location) {
                    store.storeManager.muteEpics(plugin);
                } else {
                    store.storeManager.unmuteEpics(plugin);
                }
            });
            location = urlQuery;
        }
    }, [pluginsString]);

    return { plugins, pending };
}

export default useModulePlugins;
