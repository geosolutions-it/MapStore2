/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useState, useMemo } from 'react';
import isEmpty from 'lodash/isEmpty';
import { getPlugins, createPlugin, isMapStorePlugin } from '../utils/PluginsUtils';
import { augmentStore } from '../utils/StateUtils';
import join from 'lodash/join';

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
let epicsCache = {};
const pluginsCache = {};
const reducersCache = {};

const getEpicCache = (name) => epicsCache[name];
const setEpicCache = (name) => { epicsCache[name] = true; };

function useLazyPlugins({
    pluginsEntries = {},
    pluginsConfig = [],
    removed = []
}) {

    const [plugins, setPlugins] = useState({});
    const [pending, setPending] = useState(true);

    const pluginsKeys = useMemo(() => pluginsConfig.reduce((prev, curr) => {
        const key = curr?.name ?? curr;
        if (pluginsEntries[key]) {
            return [ ...prev, key];
        } else if (pluginsEntries[key + 'Plugin']) {
            return [ ...prev, key + 'Plugin'];
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
                    return pluginsEntries[pluginName]().then((mod) => {
                        const impl = mod.default;
                        return impl;
                    });
                });
            Promise.all(loadPlugins)
                .then((impls) => {
                    const { reducers, epics } = filteredPluginsKeys.reduce((acc, pluginName, idx) => {
                        const impl = impls[idx];
                        return {
                            reducers: {
                                ...acc.reducers,
                                ...impl.reducers
                            },
                            epics: {
                                ...acc.epics,
                                ...impl.epics
                            }
                        };
                    }, {
                        reducers: {},
                        epics: {}
                    });

                    // the epics and reducers once included in the store cannot be overridden
                    // so we need to filter out the one previously added and include only new one
                    const filterOutExistingEpics = Object.keys(epics)
                        .reduce((acc, key) => {
                            if (getEpicCache(key)) {
                                return acc;
                            }
                            setEpicCache(key);
                            return {
                                ...acc,
                                [key]: epics[key]
                            };
                        }, {});


                    const filterOutExistingReducers = Object.keys(reducers)
                        .reduce((acc, key) => {
                            if (reducersCache[key]) {
                                return acc;
                            }
                            reducersCache[key] = true;
                            return {
                                ...acc,
                                [key]: reducers[key]
                            };
                        }, {});

                    if (!(isEmpty(filterOutExistingReducers) && isEmpty(filterOutExistingEpics))) {
                        augmentStore({
                            reducers: filterOutExistingReducers,
                            epics: filterOutExistingEpics
                        });
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

    return { plugins, pending };
}

export default useLazyPlugins;
