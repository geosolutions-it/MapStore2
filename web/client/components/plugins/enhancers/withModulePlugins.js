import React, { useMemo } from 'react';
import url from 'url';
import useModulePlugins from "../../../hooks/useModulePlugins";
import {getPlugins} from "../../../utils/ModulePluginsUtils";
import {compose} from "redux";
import {connect} from "react-redux";
import {getMonitoredState} from "../../../utils/PluginsUtils";
import ConfigUtils from "../../../utils/ConfigUtils";

const urlQuery = url.parse(window.location.href, true).query;

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

const withModulePlugins = (Component) => ({ pluginsConfig, plugins = {}, loaderComponent = () => null, ...props }) => {
    const config = getPluginsConfig({pluginsConfig, ...props});
    const { plugins: loadedPlugins, pending } = useModulePlugins({
        pluginsEntries: getPlugins(plugins, 'module'),
        pluginsConfig: config
    });
    const parsedPlugins = useMemo(() => ({ ...loadedPlugins, ...getPlugins(plugins) }), [loadedPlugins]);
    const loading = pending;

    const Loader = loaderComponent;

    return loading ? <Loader /> : <Component {...props} pluginsConfig={pluginsConfig} plugins={parsedPlugins} />;
};

export default compose(
    connect((state) => ({
        mode: urlQuery.mode || (urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop'),
        monitoredState: getMonitoredState(state, ConfigUtils.getConfigProp('monitorState'))
    })),
    withModulePlugins
);
