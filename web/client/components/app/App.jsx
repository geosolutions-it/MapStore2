/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { DragDropContext as dragDropContext } from 'react-dnd';
import html5Backend from 'react-dnd-html5-backend';

import { changeBrowserProperties } from '../../actions/browser';
import { loadLocale } from '../../actions/locale';
import { localConfigLoaded } from '../../actions/localConfig';

import ConfigUtils from '../../utils/ConfigUtils';
import LocaleUtils from '../../utils/LocaleUtils';
import PluginsUtils from '../../utils/PluginsUtils';

import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';

import './appPolyfill';

class App extends React.Component {
    static propTypes = {
        appStore: PropTypes.func,
        pluginsDef: PropTypes.object,
        storeOpts: PropTypes.object,
        initialActions: PropTypes.array,
        appComponent: PropTypes.oneOfType([ PropTypes.func, PropTypes.object ]),
        printingEnabled: PropTypes.bool,
        onStoreInit: PropTypes.func,
        onInit: PropTypes.func,
        mode: PropTypes.string,
        enableExtensions: PropTypes.bool,
        appLoader: PropTypes.func,
        localConfigPath: PropTypes.string
    };

    static defaultProps = {
        pluginsDef: {plugins: {}, requires: {}},
        initialActions: [],
        printingEnabled: false,
        appStore: () => ({
            dispatch: () => {},
            getState: () => ({}),
            subscribe: () => {}
        }),
        appComponent: () => <span />,
        appLoader: () => <span />,
        onStoreInit: () => {},
        enableExtensions: false,
        localConfigPath: ''
    };

    state = {
        initialized: false,
        pluginsRegistry: {},
        removedPlugins: []
    };

    addProjDefinitions(config) {
        if (config.projectionDefs && config.projectionDefs.length) {
            import('proj4').then(mod => {
                const proj4 = mod.default;
                config.projectionDefs.forEach((proj) => {
                    proj4.defs(proj.code, proj.def);
                });
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

        ConfigUtils.setLocalConfigurationFile(this.props.localConfigPath);
        ConfigUtils.loadConfiguration().then((config) => {
            const opts = {
                ...this.props.storeOpts,
                onPersist: onInit.bind(null, config),
                initialState: this.parseInitialState(config.initialState, {
                    mode: this.props.mode || (ConfigUtils.getBrowserProperties().mobile ? 'mobile' : 'desktop')
                }) || { defaultState: {}, mobile: {} }
            };
            this.store = this.props.appStore();
            this.props.onStoreInit(this.store);
            if (!opts.persist) {
                onInit(config);
            }
        });
    }

    render() {
        const { plugins, requires } = this.props.pluginsDef;
        const { appStore, initialActions, appComponent, mode, ...other } = this.props;
        const AppComponent = dragDropContext(html5Backend)(this.props.appComponent);
        const Loader = this.props.appLoader;
        return this.state.initialized ?
            <Provider store={this.store}>
                <AppComponent {...other} plugins={{ ...PluginsUtils.getPlugins({ ...plugins }), requires }} />
            </Provider>
            : (<Loader />);
    }
    afterInit = () => {
        this.props.initialActions.forEach((action) => {
            this.store.dispatch(action());
        });
        this.setState({
            initialized: true
        });
    };
    init = (config) => {
        this.store.dispatch(changeBrowserProperties(ConfigUtils.getBrowserProperties()));
        this.store.dispatch(localConfigLoaded(config));
        this.addProjDefinitions(config);
        const locale = LocaleUtils.getUserLocale();
        this.store.dispatch(loadLocale(null, locale));
        if (this.props.onInit) {
            this.props.onInit(this.store, this.afterInit.bind(this, [config]), config);
        } else {
            this.afterInit(config);
        }
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

export default App;
