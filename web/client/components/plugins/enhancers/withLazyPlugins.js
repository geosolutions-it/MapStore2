// import React, { useEffect, useState, useMemo } from 'react';
// import {createPluginManager} from "../../../utils/PluginsUtils";
// import isArray from "lodash/isArray";
// import isObject from "lodash/isObject";
// import {getStore} from "../../../utils/StateUtils";

import React, { useMemo } from 'react';
import useLazyPlugins from "../../../hooks/useLazyPlugins";

// export default () => (Component) => ({ lazyPlugins, pluginsConfig: config, plugins, ...props }) => {
//     const pluginManager = useMemo(() => createPluginManager(), []);
//     const [loadedPlugins, setLoadedPlugins] = useState(pluginManager.getRegistry());
//     const updatePluginReducersEpics = (p) => {
//         setLoadedPlugins({...p});
//         // store.storeManager.addReducer();
//         // store.storeManager.addEpics();
//     };
//     const parsedPlugins = useMemo(() => ({ ...loadedPlugins, ...plugins }), [loadedPlugins]);
//     const getPluginsConfig = ({pluginsConfig, mode, defaultMode}) => {
//         if (pluginsConfig) {
//             if (Array.isArray(pluginsConfig)) {
//                 return pluginsConfig;
//             }
//             if (typeof pluginsConfig === 'object') {
//                 return pluginsConfig[mode] || pluginsConfig[defaultMode] || [];
//             }
//         }
//         return [];
//     };
//
//     const pluginsConfig = getPluginsConfig({ pluginsConfig: config, ...props});
//     useEffect(() => {
//         pluginManager.onPluginsLoaded(updatePluginReducersEpics);
//         pluginManager.loadPlugins(pluginsConfig);
//     }, [lazyPlugins, pluginsConfig]);
//
//     const Loader = props.loaderComponent;
//
//     return pluginManager.isPending() ? <Loader /> : <Component {...props} pluginsConfig={pluginsConfig} plugins={parsedPlugins} />;
// };

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
