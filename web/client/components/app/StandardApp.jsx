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

const urlQuery = url.parse(window.location.href, true).query;

class StandardApp extends React.Component {
    static propTypes = {
        appStore: PropTypes.func,
        pluginsDef: PropTypes.object,
        storeOpts: PropTypes.object,
        initialActions: PropTypes.array,
        appComponent: PropTypes.func,
        printingEnabled: PropTypes.bool,
        onStoreInit: PropTypes.func
    };

    static defaultProps = {
        pluginsDef: {plugins: {}, requires: {}},
        initialActions: [],
        printingEnabled: false,
        appStore: () => ({dispatch: () => {}}),
        appComponent: () => <span/>,
        onStoreInit: () => {}
    };

    state = {
        store: null
    };

    addProjDefinitions(config) {
        if (config.projectionDefs && config.projectionDefs.length) {
            config.projectionDefs.forEach((proj) => {
                proj4.defs(proj.code, proj.def);
            });

        }
    }

    componentWillMount() {
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
                initialState: config.initialState || {defaultState: {}, mobile: {}}
            });
            this.store = this.props.appStore(this.props.pluginsDef.plugins, opts);
            this.props.onStoreInit(this.store);
            this.setState({
                store: this.store
            });

            if (!opts.persist) {
                onInit(config);
            }
        });

    }

    render() {
        const {plugins, requires} = this.props.pluginsDef;
        const {pluginsDef, appStore, initialActions, appComponent, ...other} = this.props;
        const App = this.props.appComponent;
        return this.state.store ?
            <Provider store={this.state.store}>
                <App {...other} plugins={assign(PluginsUtils.getPlugins(plugins), {requires})}/>
            </Provider>
         : null;
    }
    init = (config) => {
        this.store.dispatch(changeBrowserProperties(ConfigUtils.getBrowserProperties()));
        this.store.dispatch(localConfigLoaded(config));
        this.addProjDefinitions(config);
        const locale = LocaleUtils.getUserLocale();
        this.store.dispatch(loadLocale(null, locale));
        if (this.props.printingEnabled) {
            this.store.dispatch(loadPrintCapabilities(ConfigUtils.getConfigProp('printUrl')));
        }
        this.props.initialActions.forEach((action) => {
            this.store.dispatch(action());
        });
    };
}

module.exports = StandardApp;
