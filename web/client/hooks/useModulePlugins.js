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
import {omit, size, toInteger} from "lodash";

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

function processReducersEpics(impls) {
    const store = getStore();
    impls.forEach(impl => {
        if (size(impl.reducers)) {
            Object.keys(impl.reducers).forEach((name) => store.storeManager.addReducer(name, impl.reducers[name]));
        }
        if (size(impl.epics)) {
            store.storeManager.addEpics(impl.name, impl.epics);
        }
    });
    store.dispatch({type: 'REDUCERS_LOADED'});
}

let storedPlugins = {};
let processedPriorities = [];
const pluginsCache = {};

/**
 * hook to perform loading, caching and fetching previously loaded module plugins based on passed configuration
 * @param {object} pluginsEntries - object containing complete set of module plugins registered in app.
 * @param {array} pluginsConfig - list of the plugins should be loaded or fetched from cache
 * @param {array} removed - list of removed plugins
 * @param reorderRequestsOnly - will sort promises creators prior to making requests, prioritised requests will be created first;
 * if false - it will group promise creators by their priority, requests will be created in batches and only after previous priority
 * requests are completely fulfilled.
 * @returns {{plugins: {}, pending: boolean}}
 */
function useModulePlugins({
    pluginsEntries = {},
    pluginsConfig = [],
    removed = [],
    reorderRequestsOnly = false
}) {
    const [plugins, setPlugins] = useState(storedPlugins);
    const [pending, setPending] = useState(true);
    const [loadedPriorities, setLoadedPriorities] = useState(processedPriorities);
    const [prioritisedItems, setPrioritisedItems] = useState({});

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
    const configPriorities = useMemo(() => pluginsConfig.reduce((prev, curr) => {
        const key = curr?.name;
        if (key && curr?.loadPriority) {
            return {...prev, [normalizeName(key)]: curr?.loadPriority};
        }
        return prev;
    }, {}),
    [pluginsConfig]);
    const pluginsString = join(pluginsKeys, ',');

    useEffect(() => {
        const filteredPluginsKeys = pluginsKeys
            .filter((pluginName) => !pluginsCache[pluginName]);
        if (filteredPluginsKeys.length > 0) {
            setPending(true);
            let prioritizedItems = filteredPluginsKeys
                .reduce((prev, pluginName) => {
                    const priority = configPriorities[pluginName] ?? pluginsEntries[pluginName].priority;
                    return {...prev, [priority]: [...(prev[priority] ?? []), () => pluginsEntries[pluginName]().then((mod) => {
                        return mod.default;
                    })]};
                }, {});
            if (reorderRequestsOnly) {
                const tempItems = prioritizedItems;
                prioritizedItems = {0: []};
                Object.keys(tempItems).forEach(priority => {
                    prioritizedItems[0].push(...tempItems[priority]);
                });
                processedPriorities.length = 0;
                processedPriorities.push(0);
                setLoadedPriorities(processedPriorities);
            } else {
                processedPriorities.length = 0;
                setLoadedPriorities(processedPriorities);
            }
            setPrioritisedItems(prioritizedItems);
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

    useEffect(() => {
        const keys = Object.keys(prioritisedItems).map(el => toInteger(el));
        if (keys.length) {
            const keyToLoad = Math.min(...keys);
            // Resolve promises one by one if it should only reorder requests
            if (reorderRequestsOnly) {
                prioritisedItems[keyToLoad].forEach((promiseCreator) => {
                    promiseCreator()
                        .then(implementation => {
                            const impls = [implementation];
                            processReducersEpics(impls);
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
                            if (keys.length === 1) {
                                setPending(false);
                            }
                            processedPriorities.push(keyToLoad);
                            setLoadedPriorities(processedPriorities);
                            if (!reorderRequestsOnly) {
                                setPrioritisedItems(omit(prioritisedItems, keyToLoad));
                            }
                        })
                        .catch(() => {
                            setPlugins({});
                            setPending(false);
                        });
                });
            } else {
                Promise.all(prioritisedItems[keyToLoad].map(el => el()))
                    .then((impls) => {
                        processReducersEpics(impls);
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
                        if (keys.length === 1) {
                            setPending(false);
                        }
                        processedPriorities.push(keyToLoad);
                        setLoadedPriorities(processedPriorities);
                        if (!reorderRequestsOnly) {
                            setPrioritisedItems(omit(prioritisedItems, keyToLoad));
                        }
                    })
                    .catch(() => {
                        setPlugins({});
                        setPending(false);
                    });
            }
        }
    }, [prioritisedItems]);

    return { plugins, pending, loadedPriorities };
}

export default useModulePlugins;
