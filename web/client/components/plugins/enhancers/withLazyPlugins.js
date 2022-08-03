import React, { useMemo } from 'react';
import useLazyPlugins from "../../../hooks/useLazyPlugins";

const getPluginsConfig = ({pluginsConfig: config, mode, defaultMode}) => {
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

export default () => (Component) => ({ lazyPlugins, pluginsConfig, plugins, ...props }) => {
    const config = getPluginsConfig({pluginsConfig, ...props});
    const { plugins: loadedPlugins, pending } = useLazyPlugins({
        pluginsEntries: lazyPlugins,
        pluginsConfig: config
    });
    const parsedPlugins = useMemo(() => ({ ...loadedPlugins, ...plugins }), [loadedPlugins]);
    const loading = pending;

    const Loader = props.loaderComponent;

    return loading ? <Loader /> : <Component {...props} pluginsConfig={pluginsConfig} plugins={parsedPlugins} />;
};
