import React, { useMemo } from 'react';
import useModulePlugins from "../../../hooks/useModulePlugins";
import {getPlugins} from "../../../utils/ModulePluginsUtils";

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

export default () => (Component) => ({ pluginsConfig, plugins, ...props }) => {
    const config = getPluginsConfig({pluginsConfig, ...props});
    const { plugins: loadedPlugins, pending } = useModulePlugins({
        pluginsEntries: getPlugins(plugins, 'module'),
        pluginsConfig: config
    });
    const parsedPlugins = useMemo(() => ({ ...loadedPlugins, ...getPlugins(plugins) }), [loadedPlugins]);
    const loading = pending;

    const Loader = props.loaderComponent;

    return loading ? <Loader /> : <Component {...props} pluginsConfig={pluginsConfig} plugins={parsedPlugins} />;
};
