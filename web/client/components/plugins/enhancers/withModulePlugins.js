/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useMemo } from 'react';
import useModulePlugins from "../../../hooks/useModulePlugins";
import {getPlugins} from "../../../utils/ModulePluginsUtils";

const getPluginsConfig = ({pluginsConfig: config, mode = 'desktop', defaultMode}) => {
    if (config) {
        if (Array.isArray(config)) {
            return config;
        }
        if (typeof config === 'object') {
            return config[mode] || config[defaultMode] || [];
        }
    }
    return [];
};

/**
 * HOC to provide additional logic layer for module plugins loading and caching
 * @param {function(): string[]} getPluginsConfigCallback - callback to extract proper part of plugins configuration passed with `pluginsConfig` prop
 */
const withModulePlugins = (getPluginsConfigCallback = getPluginsConfig) => (Component) => ({ onLoaded = () => {
}, pluginsConfig, plugins = {}, loaderComponent = () => null, ...props }) => {
    const config = getPluginsConfigCallback({pluginsConfig, ...props});
    const { plugins: loadedPlugins, pending } = useModulePlugins({
        pluginsEntries: getPlugins(plugins, 'module'),
        pluginsConfig: config
    });
    const parsedPlugins = useMemo(() => ({ ...loadedPlugins, ...getPlugins(plugins) }), [loadedPlugins]);
    const loading = pending;

    const Loader = loaderComponent;

    useEffect(() => {
        if (!loading) onLoaded(true);
    }, [loading]);

    return loading ? <Loader /> : <Component {...props} pluginsConfig={pluginsConfig} plugins={parsedPlugins} allPlugins={plugins} />;
};


export default withModulePlugins;
