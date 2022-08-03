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

export function toLazyPlugin(name, implementationFunction, overrides, exportedName) {
    const getLazyPlugin = () => {
        return implementationFunction().then((mod) => {
            const impl = exportedName && mod[exportedName] ? mod[exportedName] : mod.default;
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
                    }, overrides)
                };
            }
            return {
                'default': merge({
                    name,
                    component: impl[pluginName],
                    reducers: impl.reducers || {},
                    epics: cleanEpics(impl.epics || {}),
                    containers: impl.containers || {}
                }, overrides)
            };
        });
    };
    getLazyPlugin.isModulePlugin = true;
    return getLazyPlugin;
}

export function getPlugins(plugins, type = 'static') {
    return Object.keys(plugins)
        .filter((name) => type === 'static' ? !plugins[name].isModulePlugin : plugins[name].isModulePlugin)
        .reduce((acc, name) => ({
            ...acc,
            [name]: plugins[name]
        }), {});
}
