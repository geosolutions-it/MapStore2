/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const assign = require('object-assign');
const {omit, isObject, head, isArray} = require('lodash');
const {combineReducers} = require('redux');
const {combineEpics} = require('redux-observable');
const isPluginConfigured = (pluginsConfig, plugin) => {
    const cfg = pluginsConfig;
    const pluginName = plugin.substring(0, plugin.length - 6);
    return head(cfg.filter((cfgObj) => cfgObj.name === pluginName || cfgObj === pluginName));
};

const showIn = (cfg, name, id, isDefault) => {
    return ((id && cfg.showIn && cfg.showIn.indexOf(id) !== -1) ||
            (cfg.showIn && cfg.showIn.indexOf(name) !== -1) ||
            (!cfg.showIn && isDefault)) &&
            !((cfg.hideFrom && cfg.hideFrom.indexOf(name) !== -1) || (id && cfg.hideFrom && cfg.hideFrom.indexOf(id) !== -1));
};

const includeLoaded = (name, loadedPlugins, plugin) => {
    if (loadedPlugins[name]) {
        return assign(loadedPlugins[name], plugin, {loadPlugin: undefined});
    }
    return plugin;
};

const includeLoadedItem = (name, loadedPlugins, plugin) => {
    if (loadedPlugins[name]) {
        return assign(loadedPlugins[name], plugin, {loadPlugin: undefined});
    }
    return plugin;
};

const getMorePrioritizedContainer = (pluginImpl, plugins, priority) => {
    return plugins.reduce((previous, current) => {
        const pluginName = current.name || current;
        return pluginImpl[pluginName] && pluginImpl[pluginName].priority > previous.priority ? {plugin: {name: pluginName, impl: pluginImpl[pluginName]}, priority: pluginImpl[pluginName].priority} : previous;
    }, {plugin: null, priority: priority});
};

const getPluginItems = (plugins, pluginsConfig, name, id, isDefault, loadedPlugins) => {
    return Object.keys(plugins)
            .filter((plugin) => plugins[plugin][name])
            .filter((plugin) => {
                const cfgObj = isPluginConfigured(pluginsConfig, plugin);
                return cfgObj && showIn(cfgObj, name, id, isDefault);
            })
            .filter((plugin) => getMorePrioritizedContainer(plugins[plugin], pluginsConfig, plugins[plugin][name].priority || 0).plugin === null)
            .map((plugin) => {
                const pluginName = plugin.substring(0, plugin.length - 6);
                const pluginImpl = includeLoadedItem(pluginName, loadedPlugins, plugins[plugin]);
                const pluginCfg = isPluginConfigured(pluginsConfig, plugin);
                const item = pluginImpl[name].impl || pluginImpl[name];
                return assign({},
                    item,
                    pluginCfg.override && pluginCfg.override[name] || {},
                    {
                        cfg: pluginCfg && pluginCfg.cfg || undefined
                    },
                    {
                        plugin: pluginImpl,
                        items: getPluginItems(plugins, pluginsConfig, pluginName, null, true, loadedPlugins)
                    });
            });
};

/*eslint-disable */
const parseExpression = (requires, value) => {
    const searchExpression = /^\{(.*?)\}$/;
    const context = requires || {};
    const expression = searchExpression.exec(value);
    if (expression !== null) {
        return eval(expression[1]);
    }
    return value;
};
/*eslint-enable */


const parsePluginConfig = (requires, cfg) => {
    if (isArray(cfg)) {
        return cfg.map((value) => parsePluginConfig(requires, value));
    }
    if (isObject(cfg)) {
        return Object.keys(cfg).reduce((previous, current) => {
            const value = cfg[current];
            return assign(previous, {[current]: parsePluginConfig(requires, value)});
        }, {});
    }
    return parseExpression(requires, cfg);
};
const getReducers = (plugins) => Object.keys(plugins).map((name) => plugins[name].reducers)
                            .reduce((previous, current) => assign({}, previous, current), {});

const getEpics = (plugins) => Object.keys(plugins).map((name) => plugins[name].epics)
    .reduce((previous, current) => assign({}, previous, current), {});

    /**
     * default wrapper for the epics.
     * @memberof utils.PluginsUtils
     * @param {epic} epic the epic to wrap
     * @return {epic} epic wrapped with error catch and re-subscribe functionalities.S
     */
const defaultEpicWrapper = epic => (...args) =>
    epic(...args).catch((error, source) => {
        setTimeout(() => { throw error; }, 0);
        return source;
    });
const PluginsUtils = {
    combineReducers: (plugins, reducers) => {
        const pluginsReducers = getReducers(plugins);
        return combineReducers(assign({}, reducers, pluginsReducers));
    },
    /**
     * Produces the rootEpic for the plugins, combined with other epics passed as 2nd argument
     * @param {array} plugins the plugins
     * @param {function[]} [epics] the epics to add to the plugins' ones
     * @param {function} [epicWrapper] returns a function that wraps the epic
     * @return {function} the rootEpic, obtained combining plugins' epics and the other epics passed as argument.
     */
    combineEpics: (plugins, epics = {}, epicWrapper = defaultEpicWrapper) => {
        const pluginEpics = assign({}, getEpics(plugins), epics);
        return combineEpics( ...Object.keys(pluginEpics).map(k => pluginEpics[k]).map(epicWrapper));
    },
    getReducers,
    getPlugins: (plugins) => Object.keys(plugins).map((name) => plugins[name])
                                .reduce((previous, current) => assign({}, previous, omit(current, 'reducers')), {}),
    getPluginDescriptor: (plugins, pluginsConfig, pluginDef, loadedPlugins = {}) => {
        const name = isObject(pluginDef) ? pluginDef.name : pluginDef;
        const id = isObject(pluginDef) ? pluginDef.id : null;
        const stateSelector = isObject(pluginDef) ? pluginDef.stateSelector : id || undefined;
        const isDefault = isObject(pluginDef) ? ((typeof pluginDef.isDefault === 'undefined') && true || pluginDef.isDefault) : true;
        const pluginKey = (isObject(pluginDef) ? pluginDef.name : pluginDef) + 'Plugin';
        const impl = plugins[pluginKey];
        if (!impl) {
            throw "the plugin \"" + pluginKey + " \"is undefinded";
        }
        return {
            id: id || name,
            name,
            impl: includeLoaded(name, loadedPlugins, (impl.loadPlugin || impl.displayName) ? impl : impl(stateSelector)),
            cfg: isObject(pluginDef) ? parsePluginConfig(plugins.requires, pluginDef.cfg) : {},
            items: getPluginItems(plugins, pluginsConfig, name, id, isDefault, loadedPlugins)
        };
    },
    getMorePrioritizedContainer
};
module.exports = PluginsUtils;
