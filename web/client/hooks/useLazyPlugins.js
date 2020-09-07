/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useState } from 'react';
import { getPlugins } from '../../../../web/client/utils/PluginsUtils';
import { augmentStore } from '../../../../web/client/utils/StateUtils';
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

function useLazyPlugins({
    pluginsEntries = {},
    pluginsConfig = [],
    removed = []
}) {

    const [plugins, setPlugins] = useState({});
    const [pending, setPending] = useState(false);

    const pluginsKeys = pluginsConfig.map(({ name }) => name + 'Plugin');
    const pluginsString = join(pluginsKeys, ',');

    useEffect(() => {
        setPending(true);
        Promise.all(
            pluginsKeys.map(pluginName => {
                return pluginsEntries[pluginName]().then((mod) => {
                    const impl = mod.default;
                    return impl;
                });
            })
        )
            .then((impls) => {
                const { reducers, epics } = pluginsKeys.reduce((acc, pluginName, idx) => {
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
                augmentStore({ reducers, epics });
                return pluginsKeys.map((pluginName, idx) => {
                    const impl = impls[idx];
                    const pluginDef = {
                        [pluginName]: {
                            [pluginName]: {
                                loadPlugin: (resolve) => {
                                    resolve(impl);
                                }
                            }
                        }
                    };
                    return { plugin: pluginDef };
                });
            })
            .then((loaded) => {
                setPlugins(
                    getPlugins(
                        {
                            ...filterRemoved(
                                loaded.reduce((previous, current) => ({ ...previous, ...current.plugin }), {}),
                                removed
                            )
                        }
                    )
                );
                setPending(false);
            })
            .catch(() => {
                setPlugins({});
                setPending(false);
            });
    }, [ pluginsString ]);

    return { plugins, pending };
}

export default useLazyPlugins;
