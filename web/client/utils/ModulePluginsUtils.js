import omit from "lodash/omit";
import isFunction from "lodash/isFunction";
import merge from "lodash/merge";
import {normalizeName} from "./PluginsUtils";

function cleanEpics(epics, excludedNames = []) {
    const containsExcludedEpic = !!excludedNames.find((epicName) => epics[epicName]);
    if (containsExcludedEpic) {
        return omit(epics, excludedNames);
    }
    return epics;
}

/**
 * Utility to convert static plugin into module plugin loaded dynamically on demand
 * @param {string} name - plugin name
 * @param {function(): Promise} implementationFunction - implementation function performing import of the plugin component
 * @param {{}|{overrides: {}, exportedName: string}} options
 */
export function toModulePlugin(name, implementationFunction, options = {overrides: {}, exportedName: 'default'}) {
    const getModulePlugin = () => {
        return implementationFunction().then((mod) => {
            const impl = options.exportedName && mod[options.exportedName] ? mod[options.exportedName] : mod.default;
            const pluginName = normalizeName(name);

            // This is needed for compatibility with syntax used by extensions
            // createPlugin utility is not used there, but exported object has no property called PluginNamePlugin
            // instead of it, it looks exactly just like object built by createPlugin
            if (!impl[pluginName] && impl.component) {
                return {
                    'default': impl
                };
            }

            if (!isFunction(impl[pluginName])) {
                const {
                    enabler,
                    loadPlugin,
                    disablePluginIf,
                    ...containers
                } = impl[pluginName];
                return {
                    'default': merge({
                        name,
                        component: impl[pluginName],
                        reducers: impl.reducers || {},
                        epics: cleanEpics(impl.epics || {}),
                        containers,
                        disablePluginIf,
                        enabler,
                        loadPlugin
                    }, (options?.overrides ?? {}))
                };
            }
            return {
                'default': merge({
                    name,
                    component: impl[pluginName],
                    reducers: impl.reducers || {},
                    epics: cleanEpics(impl.epics || {}),
                    containers: impl.containers || {}
                }, (options?.overrides ?? {}))
            };
        });
    };
    getModulePlugin.isModulePlugin = true;
    return getModulePlugin;
}

/**
 * Utility to get specific type of plugins from the complete list of app plugins
 * @param {{}} plugins - app plugins
 * @param {'static'|'module'} type - type of the plugins to select
 */
export function getPlugins(plugins, type = 'static') {
    return Object.keys(plugins)
        .filter((name) => type === 'static' ? !plugins[name].isModulePlugin : plugins[name].isModulePlugin)
        .reduce((acc, name) => ({
            ...acc,
            [name]: plugins[name]
        }), {});
}
