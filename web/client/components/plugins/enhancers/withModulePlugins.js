import React, { useMemo } from 'react';
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

const withModulePlugins = (getPluginsConfigCallback = getPluginsConfig) => (Component) => ({ pluginsConfig, plugins = {}, loaderComponent = () => null, ...props }) => {
    const config = getPluginsConfigCallback({pluginsConfig, ...props});
    const { plugins: loadedPlugins, pending } = useModulePlugins({
        pluginsEntries: getPlugins(plugins, 'module'),
        pluginsConfig: config
    });
    const parsedPlugins = useMemo(() => ({ ...loadedPlugins, ...getPlugins(plugins) }), [loadedPlugins]);
    const loading = pending;

    const Loader = loaderComponent;

    return loading ? <Loader /> : <Component {...props} pluginsConfig={pluginsConfig} plugins={parsedPlugins} />;
};


export default withModulePlugins;
