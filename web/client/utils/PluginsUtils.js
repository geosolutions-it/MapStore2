/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const assign = require('object-assign');
const {omit, isObject, head, isArray, isString, memoize, get} = require('lodash');
const {combineReducers} = require('redux');
const {connect} = require('react-redux');
const url = require('url');
const defaultMonitoredState = [{name: "mapType", path: 'maptype.mapType'}, {name: "user", path: 'security.user'}];
const {combineEpics} = require('redux-observable');
/**
 * Gives a reduced version of the status to check.
 * It cached the last state to prevent re-evaluations if the input didn't change.
 * @memberof utils.PluginsUtils
 * @function
 * @param {Object} state the state
 * @param {Object[]} monitor an array of objects in the form `{name: "a", path: "b"}` used to produce the monitoredState
 * @return {Object} the state filtered using the monitor rules
 * @example
 * const monitor =[{name: "a", path: "b"}`];
 * const state = {b: "test"}
 * filterState(state, monitor); // returns {a: "test"}
 */
const filterState = memoize((state, monitor) => {
    return monitor.reduce((previous, current) => {
        return assign(previous, {
            [current.name]: get(state, current.path)
        });
    }, {});
}, (state, monitor) => {
    return monitor.reduce((previous, current) => {
        return previous + JSON.stringify(get(state, current.path));
    }, '');
});

const isPluginConfigured = (pluginsConfig, plugin) => {
    const cfg = pluginsConfig;
    const pluginName = plugin.substring(0, plugin.length - 6);
    return head(cfg.filter((cfgObj) => cfgObj.name === pluginName || cfgObj === pluginName));
};

/*eslint-disable */
const parseExpression = (state = {}, context = {}, value) => {
    const searchExpression = /^\{(.*)\}$/;
    const expression = searchExpression.exec(value);
    const request = url.parse(location.href, true);
    const dispatch = (action) => {
        return () => state("store").dispatch(action.apply(null, arguments));
    };
    if (expression !== null) {
        return eval(expression[1]);
    }
    return value;
};
/*eslint-enable */
/**
 * Parses a expression string "{some javascript}" and evaluate it.
 * The expression will be evaluated getting as parameters the state and the context and the request.
 * @memberof utils.PluginsUtils
 * @param  {object} state      the state context
 * @param  {object} context    the context element
 * @param  {string} expression the expression to parse, it's a string
 * @return {object}            the result of the expression
 * @example "{1===0 && request.query.queryParam1=paramValue1}"
 * @example "{1===0 && context.el1 === 'checked'}"
 */
const handleExpression = (state, context, expression) => {
    if (isString(expression) && expression.indexOf('{') === 0) {
        return parseExpression(state, context, expression);
    }
    return expression;
};
/**
 * filters the plugins passed evaluating the dsiablePluginIf expression with the given context
 * @memberof utils.PluginsUtils
 * @param  {Object} item         the plugins
 * @param  {function} [state={}]   The state to evaluate
 * @param  {Object} [plugins={}] the plugins object to get requires
 * @return {Boolean}             the result of the expression evaluation in the given context.
 */
const filterDisabledPlugins = (item, state = {}, plugins = {}) => {
    const disablePluginIf = item && item.plugin && item.plugin.disablePluginIf || item.cfg && item.cfg.disablePluginIf;
    if (disablePluginIf && !(item && item.cfg && item.cfg.skipAutoDisable)) {
        return !handleExpression(state, plugins.requires, disablePluginIf);
    }
    return true;
};
const showIn = (state, requires, cfg, name, id, isDefault) => {
    return (id && cfg.showIn && handleExpression(state, requires, cfg.showIn).indexOf(id) !== -1 ||
            cfg.showIn && handleExpression(state, requires, cfg.showIn).indexOf(name) !== -1 ||
            !cfg.showIn && isDefault) &&
            !(cfg.hideFrom && handleExpression(state, requires, cfg.hideFrom).indexOf(name) !== -1 || id && cfg.hideFrom && handleExpression(state, requires, cfg.hideFrom).indexOf(id) !== -1);
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

const parsePluginConfig = (state, requires, cfg) => {
    if (isArray(cfg)) {
        return cfg.map((value) => parsePluginConfig(state, requires, value));
    }
    if (isObject(cfg)) {
        return Object.keys(cfg).reduce((previous, current) => {
            const value = cfg[current];
            return assign(previous, {[current]: parsePluginConfig(state, requires, value)});
        }, {});
    }
    return parseExpression(state, requires, cfg);
};

const getPluginItems = (state, plugins, pluginsConfig, name, id, isDefault, loadedPlugins) => {
    return Object.keys(plugins)
            .filter((plugin) => plugins[plugin][name])
            .filter((plugin) => {
                const cfgObj = isPluginConfigured(pluginsConfig, plugin);
                return cfgObj && showIn(state, plugins.requires, cfgObj, name, id, isDefault);
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
                        cfg: assign({ }, pluginImpl.cfg || {}, pluginCfg && parsePluginConfig(state, plugins.requires, pluginCfg.cfg || {}) || undefined)
                    },
                    {
                        plugin: pluginImpl,
                        items: getPluginItems(state, plugins, pluginsConfig, pluginName, null, true, loadedPlugins)
                    });
            }).filter( (item) => filterDisabledPlugins(item, state, plugins) );
};

const getReducers = (plugins) => Object.keys(plugins).map((name) => plugins[name].reducers)
                            .reduce((previous, current) => assign({}, previous, current), {});
const getEpics = (plugins) => Object.keys(plugins).map((name) => plugins[name].epics)
                            .reduce((previous, current) => assign({}, previous, current), {});

const pluginsMergeProps = (stateProps, dispatchProps, ownProps) => {
    const {pluginCfg, ...otherProps} = ownProps;
    return assign({}, otherProps, stateProps, dispatchProps, pluginCfg || {});
};
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
/**
 * Utilities to manage plugins
 * @memberof utils
 */
const PluginsUtils = {
    defaultEpicWrapper,
    /**
     * Produces the reducers from the plugins, combined with other plugins
     * @param {array} plugins the plugins
     * @param {object} [reducers] other reducers
     * @returns {function} a reducer made from the plugins' reducers and the reducers passed as 2nd parameter
     */
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
    filterState,
    filterDisabledPlugins,
    getMonitoredState: (state, monitorState = []) => filterState(state, defaultMonitoredState.concat(monitorState)),
    getPlugins: (plugins) => Object.keys(plugins).map((name) => plugins[name])
                                .reduce((previous, current) => assign({}, previous, omit(current, 'reducers')), {}),
    /**
     * provide the pluginDescriptor for a given plugin, with a state and a configuration
     * @param {object} state the state. This is required to laod plugins that depend from the state itself
     * @param {object} plugins all the plugins, like this:
     * ```
     *  {
     *      P1Plugin: connectdComponent1,
     *      P2Plugin: connectdComponent2
     *  }
     * ```
     * @param {array} pluginConfig the configurations of the plugins
     * @param {object} [loadedPlugins] the plugins loaded with `require.ensure`
     * @return {object} a pluginDescriptor like this:
     * ```
     * {
     *    id: "P1",
     *    name: "P1",
     *    items: // the contained items
     *    cfg: // the configuration
     *    impl // the real implementation
     * }
     * ```
     */
    getPluginDescriptor: (state, plugins, pluginsConfig, pluginDef, loadedPlugins = {}) => {
        const name = isObject(pluginDef) ? pluginDef.name : pluginDef;
        const id = isObject(pluginDef) ? pluginDef.id : null;
        const stateSelector = isObject(pluginDef) ? pluginDef.stateSelector : id || undefined;
        const isDefault = isObject(pluginDef) ? typeof pluginDef.isDefault === 'undefined' && true || pluginDef.isDefault : true;
        const pluginKey = (isObject(pluginDef) ? pluginDef.name : pluginDef) + 'Plugin';
        const impl = plugins[pluginKey];
        if (!impl) {
            return null;
        }
        return {
            id: id || name,
            name,
            impl: includeLoaded(name, loadedPlugins, impl.loadPlugin || impl.displayName || impl.prototype.isReactComponent ? impl : impl(stateSelector)),
            cfg: assign({}, impl.cfg || {}, isObject(pluginDef) ? parsePluginConfig(state, plugins.requires, pluginDef.cfg) : {}),
            items: getPluginItems(state, plugins, pluginsConfig, name, id, isDefault, loadedPlugins)
        };
    },
    /**
     * Custom react-redux connect function that can override state property with plugin config.
     * The plugin config properties are taken from the **pluginCfg** property.

     * @param {function} [mapStateToProps] state to properties selector
     * @param {function} [mapDispatchToProps] dispatchable actions selector
     * @param {function} [mergeProps] merge function, if not defined, the internal override applies
     * @param {object} [options] connect options (look at react-redux docs for details)
     * @returns {function} funtion to be applied to the dumb object to connect it to state / dispatchers
     */
    connect: (mapStateToProps, mapDispatchToProps, mergeProps, options) => {
        return connect(mapStateToProps, mapDispatchToProps, mergeProps || pluginsMergeProps, options);
    },
    handleExpression,
    getMorePrioritizedContainer
};
module.exports = PluginsUtils;
