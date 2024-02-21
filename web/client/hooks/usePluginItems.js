/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useMemo } from 'react';
import join from 'lodash/join';
import { getConfiguredPlugin } from '../utils/PluginsUtils';

/**
 * hook to load and configure items in plugins container
 * @param {array} items list of items received by a plugin as prop
 * @param {object} loadedPlugins context loaded plugins
 * @param {component} loaderComponent a loader component to present as placeholder while waiting async plugins
 * @returns the configured items
 * @example
 * function MyContainerPlugin({ items }, context) {
 *  const { loadedPlugins } = context;
 *  const configuredItems = usePluginItems({ items, loadedPlugins });
 *  const toolbarItems = configuredItems.filter(({ target }) => target === 'toolbar');
 *  return (<div>{toolbarItems.map(({ Component, name }) => <Component key={name} />)}</div>)
 * }
 */
const usePluginItems = ({
    items,
    loadedPlugins,
    loaderComponent
}, dependencies = []) => {
    function configurePluginItems(props) {
        return [...props.items]
            .sort((a, b) => a.position > b.position ? 1 : -1)
            .map(plg => ({
                ...plg,
                Component: plg.Component
                    ? (pluginProps) => {
                        const Plugin = plg.Component;
                        return (
                            <Plugin
                                key={plg.id}
                                {...pluginProps}
                                {...plg.cfg}
                                pluginCfg={plg.cfg}
                                items={plg.items || []}
                            />
                        );
                    }
                    : getConfiguredPlugin(plg, props.loadedPlugins, props.loaderComponent || <div />)
            })) || [];
    }
    const props = useRef({});
    props.current = {
        items,
        loadedPlugins,
        loaderComponent
    };
    const loadedPluginsKeys = join(Object.keys(loadedPlugins || {}), ',');
    const configuredItems = useMemo(() => configurePluginItems(props.current), [loadedPluginsKeys, ...dependencies]);
    return configuredItems;
};

export default usePluginItems;
