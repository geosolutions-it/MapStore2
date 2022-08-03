import React, { useMemo, useEffect } from 'react';
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

export default () => (Component) => ({ pluginsConfig, plugins, onInit, ...props }) => {
    const config = getPluginsConfig({pluginsConfig, ...props});
    const { plugins: loadedPlugins, pending } = useModulePlugins({
        pluginsEntries: getPlugins(plugins, 'module'),
        pluginsConfig: config
    });
    const parsedPlugins = useMemo(() => ({ ...loadedPlugins, ...getPlugins(plugins) }), [loadedPlugins]);
    const loading = pending;

    const Loader = props.loaderComponent;

    useEffect(() => {
        if (onInit && !loading) onInit();
    }, [onInit]);
    return loading ? <Loader /> : <Component {...props} pluginsConfig={pluginsConfig} plugins={parsedPlugins} />;
};
