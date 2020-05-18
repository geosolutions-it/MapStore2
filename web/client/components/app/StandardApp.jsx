/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Provider} = require('react-redux');
const PropTypes = require('prop-types');
const dragDropContext = require('react-dnd').DragDropContext;
const html5Backend = require('react-dnd-html5-backend');
const proj4 = require('proj4').default;

const {changeBrowserProperties} = require('../../actions/browser');
const {loadLocale} = require('../../actions/locale');
const {localConfigLoaded} = require('../../actions/localConfig');
const {loadPrintCapabilities} = require('../../actions/print');

const ConfigUtils = require('../../utils/ConfigUtils');
const LocaleUtils = require('../../utils/LocaleUtils');
const PluginsUtils = require('../../utils/PluginsUtils');

const assign = require('object-assign');
const url = require('url');
const { isObject, isArray, castArray } = require('lodash');

const urlQuery = url.parse(window.location.href, true).query;

const axios = require('../../libs/ajax');

require('./appPolyfill');

const { augmentStore } = require('../../utils/StateUtils');

const {LOAD_EXTENSIONS, PLUGIN_UNINSTALLED} = require('../../actions/contextcreator');

/**
 * Standard MapStore2 application component
 *
 * @name  StandardApp
 * @memberof components.app
 * @prop {function} appStore store creator function
 * @prop {object} pluginsDef plugins definition object (e.g. as loaded from plugins.js)
 * @prop {object} storeOpts options for the store
 * @prop {array} initialActions list of actions to be dispatched on startup
 * @prop {function|object} appComponent root component for the application
 * @prop {bool} printingEnabled initializes printing environment based on mapfish-print
 * @prop {function} onStoreInit optional callback called just after store creation
 * @prop {function} onInit optional callback called before first rendering, can delay first rendering
 * to do custom initialization (e.g. force SSO login)
 * @prop {string} mode current application mode (e.g. desktop/mobile) drives plugins loaded from localConfig
 */
class StandardApp extends React.Component {
    static propTypes = {
        appStore: PropTypes.func,
        pluginsDef: PropTypes.object,
        storeOpts: PropTypes.object,
        initialActions: PropTypes.array,
        appComponent: PropTypes.func,
        printingEnabled: PropTypes.bool,
        onStoreInit: PropTypes.func,
        onInit: PropTypes.func,
        mode: PropTypes.string,
        enableExtensions: PropTypes.bool
    };

    static defaultProps = {
        pluginsDef: {plugins: {}, requires: {}},
        initialActions: [],
        printingEnabled: false,
        appStore: () => ({dispatch: () => {}, getState: () => ({}), subscribe: () => {}}),
        appComponent: () => <span/>,
        onStoreInit: () => {},
        enableExtensions: false
    };

    state = {
        initialized: false,
        pluginsRegistry: {},
        removedPlugins: []
    };

    addProjDefinitions(config) {
        if (config.projectionDefs && config.projectionDefs.length) {
            config.projectionDefs.forEach((proj) => {
                proj4.defs(proj.code, proj.def);
            });

        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.state.initialized !== nextState.initialized || this.state.pluginsRegistry !== nextState.pluginsRegistry) {
            return true;
        }
        if (this.props.pluginsDef !== nextProps.pluginsDef) {
            return true;
        }
        return false;
    }

    UNSAFE_componentWillMount() {
        const onInit = (config) => {
            if (!global.Intl ) {
                require.ensure(['intl', 'intl/locale-data/jsonp/en.js', 'intl/locale-data/jsonp/it.js'], (require) => {
                    global.Intl = require('intl');
                    require('intl/locale-data/jsonp/en.js');
                    require('intl/locale-data/jsonp/it.js');
                    this.init(config);
                });
            } else {
                this.init(config);
            }
        };

        if (urlQuery.localConfig) {
            ConfigUtils.setLocalConfigurationFile(urlQuery.localConfig + '.json');
        }
        ConfigUtils.loadConfiguration().then((config) => {
            const opts = assign({}, this.props.storeOpts, {
                onPersist: onInit.bind(null, config)
            }, {
                initialState: this.parseInitialState(config.initialState, {
                    mode: this.props.mode || (ConfigUtils.getBrowserProperties().mobile ? 'mobile' : 'desktop')
                }) || {defaultState: {}, mobile: {}}
            });
            this.store = this.props.appStore(this.props.pluginsDef.plugins, opts);
            this.props.onStoreInit(this.store);

            if (!opts.persist) {
                onInit(config);
            }
        });

    }

    render() {
        const {plugins, requires} = this.props.pluginsDef;
        const {appStore, initialActions, appComponent, mode, ...other} = this.props;
        const App = dragDropContext(html5Backend)(this.props.appComponent);

        return this.state.initialized ?
            <Provider store={this.store}>
                <App {...other} plugins={assign(PluginsUtils.getPlugins({...plugins, ...this.filterRemoved(this.state.pluginsRegistry, this.state.removedPlugins)}), { requires })} />
            </Provider>
            : (<span><div className="_ms2_init_spinner _ms2_init_center"><div></div></div>
                <div className="_ms2_init_text _ms2_init_center">Loading MapStore</div></span>);
    }
    afterInit = () => {
        if (this.props.printingEnabled) {
            this.store.dispatch(loadPrintCapabilities(ConfigUtils.getConfigProp('printUrl')));
        }
        this.props.initialActions.forEach((action) => {
            this.store.dispatch(action());
        });
        this.setState({
            initialized: true
        });
    };
    getAssetPath = (asset) => {
        return ConfigUtils.getConfigProp("extensionsFolder") + asset;
    };
    removeExtension = (plugin) => {
        this.setState({
            removedPlugins: [...this.state.removedPlugins, plugin + "Plugin"]
        });
    };
    filterRemoved = (registry, removed) => {
        return Object.keys(registry).reduce((acc, p) => {
            if (removed.indexOf(p) !== -1) {
                return acc;
            }
            return {
                ...acc,
                [p]: registry[p]
            };
        }, {});
    };
    loadExtensions = (path, callback) => {
        if (this.props.enableExtensions) {
            return axios.get(path).then((response) => {
                const plugins = response.data;
                Promise.all(Object.keys(plugins).map((pluginName) => {
                    const bundlePath = this.getAssetPath(plugins[pluginName].bundle);
                    return PluginsUtils.loadPlugin(bundlePath).then((loaded) => {
                        return loaded.plugin.loadPlugin().then((impl) => {
                            augmentStore({ reducers: impl.reducers || {}, epics: impl.epics || {} });
                            const pluginDef = {
                                [pluginName]: {
                                    [pluginName]: {
                                        loadPlugin: (resolve) => {
                                            resolve(impl);
                                        }
                                    }
                                }
                            };
                            return { plugin: pluginDef, translations: plugins[pluginName].translations || "" };
                        });
                    });
                })).then((loaded) => {
                    callback(loaded.reduce((previous, current) => {
                        return { ...previous, ...current.plugin };
                    }, {}), loaded.map(p => p.translations).filter(p => p !== ""));
                }).catch(() => {
                    callback({}, []);
                });
            }).catch(() => {
                callback({}, []);
            });
        }
        return callback({}, []);
    };
    onPluginsLoaded = (plugins, translations) => {
        this.setState({
            pluginsRegistry: plugins
        });
        if (translations.length > 0) {
            ConfigUtils.setConfigProp("translationsPath", [...castArray(ConfigUtils.getConfigProp("translationsPath")), ...translations.map(this.getAssetPath)]);
        }
        const locale = LocaleUtils.getUserLocale();
        this.store.dispatch(loadLocale(null, locale));
    };
    init = (config) => {
        this.store.dispatch(changeBrowserProperties(ConfigUtils.getBrowserProperties()));
        this.store.dispatch(localConfigLoaded(config));
        if (this.store.addActionListener) {
            this.store.addActionListener((action) => {
                if (action.type === LOAD_EXTENSIONS) {
                    this.loadExtensions(ConfigUtils.getConfigProp('extensionsRegistry'), this.onPluginsLoaded);
                }
                if (action.type === PLUGIN_UNINSTALLED) {
                    this.removeExtension(action.plugin);
                }
            });
        }
        this.addProjDefinitions(config);
        this.loadExtensions(ConfigUtils.getConfigProp('extensionsRegistry'), (plugins, translations) => {
            this.onPluginsLoaded(plugins, translations);
            if (this.props.onInit) {
                this.props.onInit(this.store, this.afterInit.bind(this, [config]), config);
            } else {
                this.afterInit(config);
            }
        });
    };
    /**
     * It returns an object of the same structure of the initialState but replacing strings like "{someExpression}" with the result of the expression between brackets.
     * @param {object} state the object to parse
     * @param {object} context context for expression
     * @return {object} the modified object
    */
    parseInitialState = (state, context) => {
        return Object.keys(state || {}).reduce((previous, key) => {
            return { ...previous, ...{ [key]: isObject(state[key]) ?
                (isArray(state[key]) ? state[key].map(s => {
                    return isObject(s) ? this.parseInitialState(s, context) : s;
                }) : this.parseInitialState(state[key], context)) :
                PluginsUtils.handleExpression({}, context, state[key])}};
        }, {});
    };
}

module.exports = StandardApp;
