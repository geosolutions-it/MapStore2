/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const assign = require('object-assign');
const { omit, isObject, head, isArray, isString, memoize, get, endsWith } = require('lodash');
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

const getPluginSimpleName = plugin => endsWith(plugin, 'Plugin') && plugin.substring(0, plugin.length - 6) || plugin;

const normalizeName = name => endsWith(name, 'Plugin') && name || (name + "Plugin");

const getPluginConfiguration = (cfg, plugin) => {
    const pluginName = getPluginSimpleName(plugin);
    return head(cfg.filter((cfgObj) => cfgObj.name === pluginName || cfgObj === pluginName).map(cfgObj => isString(cfgObj) ? {
        name: cfgObj
    } : cfgObj)) || {};
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
const filterDisabledPlugins = (item = {}, state = {}, plugins = {}) => {
    // checks for disablePluginIf first in cfg then in plugin definition (cfg overrides plugin default)
    const disablePluginIf = get(item, 'cfg.disablePluginIf') || get(item, 'plugin.disablePluginIf');
    if (disablePluginIf && !get(item, 'cfg.skipAutoDisable')) {
        return !handleExpression(state, plugins.requires, disablePluginIf);
    }
    return true;
};

const isContainedInList = (prop, list, state, requires) => {
    return prop && list && handleExpression(state, requires, list).indexOf(prop) !== -1;
};

const showIn = (state, requires, cfg = {}, name, id, isDefault) => {
    return (
            // showIn contains plugin id
            isContainedInList(id, cfg.showIn, state, requires) ||
            // showIn contains plugin name
            isContainedInList(name, cfg.showIn, state, requires) ||
            // always show in default container
            !cfg.showIn && isDefault
        ) && !(
            // dot not show if hideFrom contains id
            isContainedInList(id, cfg.hideFrom, state, requires) ||
            // dot not show if hideFrom contains name
            isContainedInList(name, cfg.hideFrom, state, requires)
        );
};

const includeLoaded = (name, loadedPlugins, plugin) => {
    if (loadedPlugins[name]) {
        return assign(loadedPlugins[name], plugin, {loadPlugin: undefined});
    }
    return plugin;
};

const getPriority = (plugin, override = {}, container) => {
    return (
        get(override, container + ".priority") ||
        get(plugin, container + ".priority") ||
        0
    );
};

const getMorePrioritizedContainer = (pluginImpl, override = {}, plugins, priority) => {
    return plugins.reduce((previous, current) => {
        const containerName = current.name || current;
        const pluginPriority = getPriority(pluginImpl, override, containerName);
        return pluginPriority > previous.priority ? {
            plugin: {
                name: containerName,
                impl: assign({}, pluginImpl[containerName], override[containerName])
            },
            priority: pluginPriority} : previous;
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

const canContain = (container, plugin, override = {}) => {
    return plugin[container] || override[container] || false;
};

const isMorePrioritizedContainer = (pluginImpl, override, plugins, priority) => {
    return getMorePrioritizedContainer(pluginImpl,
        override,
        plugins,
        priority).plugin === null;
};

const isValidConfiguration = (cfg) => {
    return cfg && isString(cfg) || (isObject(cfg) && cfg.name);
};

const getPluginItems = (state, plugins, pluginsConfig, containerName, containerId, isDefault, loadedPlugins, filter) => {
    return Object.keys(plugins)
            // extract basic info for each plugins (name, implementation and config)
            .map(pluginName => ({
                name: pluginName,
                impl: plugins[pluginName],
                config: getPluginConfiguration(pluginsConfig, pluginName)
            }))
            // include only plugins that are configured for the current mode
            .filter((plugin) => isValidConfiguration(plugin.config))
            // include only plugins that support container as a parent
            .filter((plugin) => canContain(containerName, plugin.impl, plugin.config.override))
            // include only plugins that are configured to be shown in container (use showIn and hideFrom to customize the behaviour)
            .filter((plugin) => {
                return showIn(state, plugins.requires, plugin.config, containerName, containerId, isDefault);
            })
            // include only plugins for which container is the preferred container
            .filter((plugin) => isMorePrioritizedContainer(plugin.impl, plugin.config.override, pluginsConfig,
                getPriority(plugin.impl, plugin.config.override, containerName)))
            .map((plugin) => {
                const pluginName = getPluginSimpleName(plugin.name);
                const pluginImpl = includeLoaded(pluginName, loadedPlugins, plugin.impl);
                const containerProperties = assign(
                    {},
                    get(pluginImpl, containerName + '.impl') || get(pluginImpl, containerName),
                    get(plugin.config, 'override.' + containerName)
                );
                return assign(
                    {
                        name: pluginName
                    },
                    containerProperties,
                    {
                        cfg: assign(
                            {},
                            pluginImpl.cfg || {},
                            parsePluginConfig(state, plugins.requires, plugin.config.cfg || {}) || undefined
                        )
                    },
                    {
                        plugin: pluginImpl,
                        items: getPluginItems(state, plugins, pluginsConfig, pluginName, null, true, loadedPlugins)
                    });
            })
            // filter disabled plugins
            .filter((item) => filterDisabledPlugins(item, state, plugins))
            // apply optional user filter
            .filter((item) => (!filter || filter(item)));
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

const isMapStorePlugin = (impl) => impl.loadPlugin || impl.displayName || impl.prototype.isReactComponent || impl.isMapStorePlugin;

const getPluginImplementation = (impl, stateSelector) => {
    return isMapStorePlugin(impl) ? impl : impl(stateSelector);
};

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
    /**
     * Create an object structured like following:
     * ```
     * {
     *   bodyPlugins: [...all the configs without cfg.contanerPosition attribute ]
     *   columns: [...all the configs configured with cfg.contanerPosition: "columns"]
     *   header: [...all the configs configured with cfg.contanerPosition: "header"]
     *   ... and so on, for every cfg.contanerPosition value found
     * }
     * ```
     * @param  {object[]} pluginsConfig The configurations of plugins
     * @return {object}   An object that spreads the configruations in arrays by their `cfg.containerPosition`.
     */
    mapPluginsPosition: (pluginsConfig = []) =>
        pluginsConfig.reduce( (o, p) => {
            const position = p.cfg && p.cfg.containerPosition || "bodyPlugins";
            return {
                ...o,
                [position]: o[position]
                    ? [...o[position], p]
                    : [p]
            };
        }, {}),
    getPlugins: (plugins) => Object.keys(plugins).map((name) => plugins[name])
                                .reduce((previous, current) => assign({}, previous, omit(current, 'reducers', 'epics')), {}),
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
            impl: includeLoaded(name, loadedPlugins, getPluginImplementation(impl, stateSelector)),
            cfg: assign({}, impl.cfg || {}, isObject(pluginDef) ? parsePluginConfig(state, plugins.requires, pluginDef.cfg) : {}),
            items: getPluginItems(state, plugins, pluginsConfig, name, id, isDefault, loadedPlugins)
        };
    },
    getPluginItems,
    getConfiguredPlugin: (pluginDef, loadedPlugins = {}, loaderComponent) => {
        if (pluginDef) {
            const impl = loadedPlugins[pluginDef.name] ||
                !pluginDef.plugin.loadPlugin && pluginDef.plugin;
            const id = isObject(pluginDef) ? pluginDef.id : null;
            const stateSelector = isObject(pluginDef) ? pluginDef.stateSelector : id || undefined;
            const Plugin = getPluginImplementation(impl, stateSelector);
            const result = (props) => {
                return Plugin ? (<Plugin key={pluginDef.id}
                    {...props} {...pluginDef.cfg} pluginCfg={pluginDef.cfg} items={pluginDef.items || []}/>) : loaderComponent;
            };
            result.loaded = !!impl;
            return result;
        }
        return pluginDef;
    },
    setRefToWrappedComponent: (name) => {
        return (connectedComponent) => {
            if (connectedComponent) {
                window[`${name}Plugin`] = connectedComponent.getWrappedInstance();
            }
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
    /**
     * Use this function to export a plugin from a module.
     *
     * @param {string} name name of the plugin (without the Plugin postfix)
     * @param {object} config configuration object, with the following (optional) properties:
     * @param {object|function} config.component: ReactJS component that implements the plugin functionalities, can be null if the plugin supports lazy loading
     * @param {object} config.options: generic plugins configuration options (e.g. disablePluginIf)
     * @param {object} config.containers: object with supported containers (key=container name, value=container config)
     * @param {object} config.reducers: reducers the plugin will need
     * @param {object} config.epics: epics the plugin will need to work
     * @param {boolean} config.lazy: true if the plugin implements on-demand loading,
     * @param {function} config.enabler: function used in lazy mode to decide when plugin needs to be loaded (receives redux state as the only param)
     * @param {promise} config.loader: promise that will return the loaded implementation
     *
     * @example statically loaded plugin
     * createPlugin('My', {
     *  component: MyPluginComponent,
     *  options: {...},
     *  containers: {
     *      Toolbar: {
     *          priority: 1,
     *          tool: true,
     *          ...
     *      }
     *  },
     *  reducers: {my: require('...')},
     *  epics: {myEpic: require('...')}
     * });
     *
     * @example lazy loaded plugin
     * createPlugin('My', {
     *  enabler: (state) => state.my.enabled || false,
     *  loader: () => new Promise((resolve) => {
     *    require.ensure(['...'], () => {
     *        const MyComponent = require('...');
     *        ...
     *        const MyPlugin = connect(...)(MyComponent);
     *        resolve(MyPlugin);
     *    });
     *  },
     *  options: {...},
     *  containers: {
     *      Toolbar: {
     *          priority: 1,
     *          tool: true,
     *          ...
     *      }
     *  },
     *  reducers: {my: require('...')},
     *  epics: {myEpic: require('...')}
     * });
     */
    createPlugin: (name, { component, options = {}, containers = {}, reducers = {}, epics = {}, lazy = false, enabler = () => true, loader}) => {
        const pluginName = normalizeName(name);
        const pluginImpl = lazy ? {
            loadPlugin: (resolve) => {
                loader().then(loadedImpl => {
                    resolve(assign(loadedImpl, { isMapStorePlugin: true }));
                });
            },
            enabler
        } : assign(component, {isMapStorePlugin: true});
        return {
            [pluginName]: assign(pluginImpl, containers, options),
            reducers,
            epics
        };
    },
    handleExpression,
    getMorePrioritizedContainer,
    getPluginConfiguration,
    isMapStorePlugin
};
module.exports = PluginsUtils;
