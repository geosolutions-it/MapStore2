/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');

const StandardApp = require('../components/app/StandardApp');
const LocaleUtils = require('../utils/LocaleUtils');
const ConfigUtils = require('../utils/ConfigUtils');
const {connect} = require('react-redux');

const {configureMap, loadMapConfig} = require('../actions/config');
const { initMap } = require('../actions/map');
const {generateActionTrigger} = require('../epics/jsapi');

const url = require('url');

const ThemeUtils = require('../utils/ThemeUtils');

const assign = require('object-assign');
const {partialRight, merge} = require('lodash');

const defaultConfig = require('../config.json');

const localConfig = require('../localConfig.json');

const defaultPlugins = {
    "mobile": localConfig.plugins.embedded,
    "desktop": localConfig.plugins.embedded
};
let triggerAction;
function mergeDefaultConfig(pluginName, cfg) {
    var propertyName;
    var i;
    var result;
    for (i = 0; i < defaultPlugins.desktop.length; i++) {
        if (defaultPlugins.desktop[i].name === pluginName) {
            result = defaultPlugins.desktop[i].cfg;
            for (propertyName in cfg) {
                if (cfg.hasOwnProperty(propertyName)) {
                    result[propertyName] = cfg[propertyName];
                }
            }
            return result;
        }
    }
    return cfg;
}

function loadConfigFromStorage(name = 'mapstore.embedded') {
    if (name) {
        const loaded = localStorage.getItem(name);
        if (loaded) {
            return JSON.parse(loaded);
        }
    }
    return null;
}

function getParamFromRequest(paramName) {
    const urlQuery = url.parse(window.location.href, true).query;
    return urlQuery[paramName] || null;
}

function buildPluginsCfg(plugins, cfg) {
    var pluginsCfg = [];
    var i;
    for (i = 0; i < plugins.length; i++) {
        if (cfg[plugins[i] + "Plugin"]) {
            pluginsCfg.push({
                name: plugins[i],
                cfg: mergeDefaultConfig(plugins[i], cfg[plugins[i] + "Plugin"])
            });
        } else {
            pluginsCfg.push({
                name: plugins[i],
                cfg: mergeDefaultConfig(plugins[i], {})
            });
        }
    }
    return {
        mobile: pluginsCfg,
        desktop: pluginsCfg
    };
}

const actionListeners = {};
let stateChangeListeners = [];

const getInitialActions = (options) => {
    if (!options.initialState || !options.initialState.defaultState.map) {
        if (options.configUrl) {
            return [initMap, loadMapConfig.bind(null, options.configUrl || defaultConfig, options.mapId)];
        }
        return [configureMap.bind(null, options.config || defaultConfig, options.mapId)];
    }
    return [];
};


/**
 * MapStore2 JavaScript API. Allows embedding MapStore2 functionalities into
 * a standard HTML page.
 *
 * ATTENTION: As of July 2020 a number of MapStore2 plugins (i.e. TOC layer settings, Identify) use react-dock for providing
 * Dock panel functionality, that assumes that we use the whole window, so the panels won't show up at all or will
 * not be constrained within the container.
 * @class
 */
const MapStore2 = {
    /**
     * Instantiates an embedded MapStore2 application in the given container.
     * MapStore2 api doesn't use StandardRouter but It relies on StandardContainer
     * @memberof MapStore2
     * @static
     * @param {string} container id of the DOM element that should contain the embedded MapStore2
     * @param {object} options set of options of the embedded app
     *  * The options object can contain the following properties, to configure the app UI and state:
     *  * **plugins**: list of plugins (and the related configuration) to be included in the app
     *    look at [Plugins documentation](https://mapstore.readthedocs.io/en/latest/developer-guide/plugins-documentation/) for further details
     *  * **config**: map configuration object for the application (look at [Map Configuration](https://mapstore.readthedocs.io/en/latest/developer-guide/maps-configuration/) for details)
     *  * **configUrl**: map configuration url for the application (look at [Map Configuration](https://mapstore.readthedocs.io/en/latest/developer-guide/maps-configuration/) for details)
     *  * **originalUrl**: url of the original instance of MapStore. If present it will be linked inside the map using the "GoFull" plugin, present by default.
     *  * **initialState**: allows setting the initial application state (look at [State Configuration](https://mapstore.readthedocs.io/en/latest/developer-guide/local-config/) for details)
     *
     * Styling can be configured either using a **theme**, or a complete custom **less stylesheet**, using the
     * following options properties:
     *  * **style**: less style to be applied
     *  * **startAction**: the actionType to wait before start triggering actions. By default CHANGE_MAP_VIEW
     *  * **theme**: theme configuration options:
     *    * path: path/url of the themes folder related to the current page
     *    * theme: theme name to be used
     *
     * ```javascript
     * {
     *      plugins: ['Map', 'ZoomIn', 'ZoomOut'],
     *      config: {
     *          map: {
     *              ...
     *          }
     *      },
     *      configUrl: '...',
     *      initialState: {
     *          defaultState: {
     *              ...
     *          }
     *      },
     *      style: '<custom style>',
     *      theme: {
     *          theme: 'mytheme',
     *          path: 'dist/themes'
     *      }
     * }
     * ```
     * @param {object} [plugins] optional plugins definition (defaults to local plugins list)
     * @param {object} [component] optional page component (defaults to MapStore2 Embedded Page)
     * @example
     * MapStore2.create('container', {
     *      plugins: ['Map']
     * });
     */
    create(container, opts, pluginsDef, component) {
        const embedded = require('../containers/Embedded');
        const options = merge({}, this.defaultOptions || {}, opts);
        const {initialState, storeOpts} = options;

        const {loadVersion} = require('../actions/version');
        const {versionSelector} = require('../selectors/version');
        const {loadAfterThemeSelector} = require('../selectors/config');
        const componentConfig = {
            component: component || embedded,
            config: {
                pluginsConfig: options.plugins || defaultPlugins
            }
        };
        const StandardContainer = connect((state) => ({
            locale: state.locale || {},
            componentConfig,
            version: versionSelector(state),
            loadAfterTheme: loadAfterThemeSelector(state)
        }))(require('../components/app/StandardContainer'));
        const actionTrigger = generateActionTrigger(options.startAction || "CHANGE_MAP_VIEW");
        triggerAction = actionTrigger.trigger;
        const appStore = require('../stores/StandardStore').bind(null, initialState || {}, {
            security: require('../reducers/security'),
            version: require('../reducers/version')
        }, {
            jsAPIEpic: actionTrigger.epic,
            ...(options.epics || {})
        });
        const initialActions = [...getInitialActions(options), loadVersion.bind(null, options.versionURL)];
        const appConfig = {
            storeOpts: assign({}, storeOpts, {notify: true, noRouter: true}),
            appStore,
            pluginsDef,
            initialActions,
            appComponent: StandardContainer,
            printingEnabled: options.printingEnabled || false
        };
        if (options.style) {
            let dom = document.getElementById('custom_theme');
            if (!dom) {
                dom = document.createElement('style');
                dom.id = 'custom_theme';
                document.head.appendChild(dom);
            }
            ThemeUtils.renderFromLess(options.style, 'custom_theme', 'themes/default/');
        }
        const defaultThemeCfg = {
            prefixContainer: '#' + container
        };

        const themeCfg = options.theme && assign({}, defaultThemeCfg, options.theme) || defaultThemeCfg;
        const onStoreInit = (store) => {
            store.addActionListener((action) => {
                const act = action.type === "PERFORM_ACTION" && action.action || action; // Needed to works also in debug
                (actionListeners[act.type] || []).concat(actionListeners['*'] || []).forEach((listener) => {
                    listener.call(null, act);
                });
            });
            store.subscribe(() => {
                stateChangeListeners.forEach(({listener, selector}) => {
                    listener.call(null, selector(store.getState()));
                });
            });
        };
        if (options.noLocalConfig) {
            ConfigUtils.setLocalConfigurationFile('');
            ConfigUtils.setConfigProp('proxyUrl', options.proxy || null);
        }

        if (options.translations) {
            ConfigUtils.setConfigProp('translationsPath', options.translations);
        }
        if (options.originalUrl) {
            ConfigUtils.setConfigProp('originalUrl', options.originalUrl);
        }
        ReactDOM.render(<StandardApp onStoreInit={onStoreInit} themeCfg={themeCfg} className="fill" {...appConfig}/>, document.getElementById(container));
    },
    buildPluginsCfg,
    getParamFromRequest,
    loadConfigFromStorage,
    /**
     * Adds a listener that will be notified of all the MapStore2 events (**actions**), or only some of them.
     *
     * @memberof MapStore2
     * @static
     * @param {string} type type of actions to be captured (* for all)
     * @param {function} listener function to be called for each launched action; it will receive
     *  the action as the only argument
     * @example
     * MapStore2.onAction('CHANGE_MAP_VIEW', function(action) {
     *      console.log(action.zoom);
     * });
     */
    onAction: (type, listener) => {
        const listeners = actionListeners[type] || [];
        listeners.push(listener);
        actionListeners[type] = listeners;
    },
    /**
     * Removes an action listener.
     *
     * @memberof MapStore2
     * @static
     * @param {string} type type of actions that is captured by the listener (* for all)
     * @param {function} listener listener to be removed
     * @example
     * MapStore2.offAction('CHANGE_MAP_VIEW', listener);
     */
    offAction: (type, listener) => {
        const listeners = (actionListeners[type] || []).filter((l) => l !== listener);
        actionListeners[type] = listeners;
    },
    /**
     * Adds a listener that will be notified of each state update.
     *
     * @memberof MapStore2
     * @static
     * @param {function} listener function to be called for each state udpate; it will receive
     *  the new state as the only argument
     * @param {function} [selector] optional function that will produce a partial/derived state
     * from the global state before calling the listeners
     * @example
     * MapStore2.onStateChange(function(map) {
     *      console.log(map.zoom);
     * }, function(state) {
     *      return (state.map && state.map.present) || state.map || {};
     * });
     */
    onStateChange: (listener, selector = (state) => state) => {
        stateChangeListeners.push({listener, selector});
    },
    /**
     * Removes a state listener.
     *
     * @memberof MapStore2
     * @static
     * @param {function} listener listener to be removed
     * @example
     * MapStore2.offStateChange(listener);
     */
    offStateChange: (listener) => {
        stateChangeListeners = stateChangeListeners.filter((l) => l !== listener);
    },
    /**
     * Returns a new custom API object using the given plugins list.
     *
     * @memberof MapStore2
     * @static
     * @param {object} plugins list of included plugins
     * @param {object} [options] default options (to be overridden on create)
     * @example
     * MapStore2.withPlugins({...});
     */
    withPlugins: (plugins, options) => {
        return assign({}, MapStore2, {create: partialRight(MapStore2.create, partialRight.placeholder, partialRight.placeholder, plugins), defaultOptions: options || {}});
    },
    /**
     * Triggers an action
     * @param  {object} action The action to trigger.
     * @example
     * triggerAction({
     *       type: 'ZOOM_TO_EXTENT',
     *       extent: {
     *         minx: '-124.731422',
     *         miny: '24.955967',
     *         maxx: '-66.969849',
     *         maxy: '49.371735'
     *       },
     *       crs: 'EPSG:4326'
     *   })
     */
    triggerAction: (action) => triggerAction(action)
};

if (!global.Intl ) {
    // Ensure Intl is loaded, then call the given callback
    LocaleUtils.ensureIntl();
}

module.exports = MapStore2;
