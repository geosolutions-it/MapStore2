import omit from "lodash/omit";
import isFunction from "lodash/isFunction";
import merge from "lodash/merge";

function cleanEpics(epics, excludedNames = []) {
    const containsExcludedEpic = !!excludedNames.find((epicName) => epics[epicName]);
    if (containsExcludedEpic) {
        return omit(epics, excludedNames);
    }
    return epics;
}

export function toModulePlugin(name, implementationFunction, options = {overrides: {}, exportedName: 'default'}) {
    const getModulePlugin = () => {
        return implementationFunction().then((mod) => {
            const impl = options.exportedName && mod[options.exportedName] ? mod[options.exportedName] : mod.default;
            const pluginName = name + 'Plugin';
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
                    }, options.overrides)
                };
            }
            return {
                'default': merge({
                    name,
                    component: impl[pluginName],
                    reducers: impl.reducers || {},
                    epics: cleanEpics(impl.epics || {}),
                    containers: impl.containers || {}
                }, options.overrides)
            };
        });
    };
    getModulePlugin.isModulePlugin = true;
    return getModulePlugin;
}

export function getPlugins(plugins, type = 'static') {
    return Object.keys(plugins)
        .filter((name) => type === 'static' ? !plugins[name].isModulePlugin : plugins[name].isModulePlugin)
        .reduce((acc, name) => ({
            ...acc,
            [name]: plugins[name]
        }), {});
}
