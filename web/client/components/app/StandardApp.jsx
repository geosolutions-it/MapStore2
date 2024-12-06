import React, { useState } from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { DragDropContext as dragDropContext } from 'react-dnd';
import html5Backend from 'react-dnd-html5-backend';

import { changeBrowserProperties } from '../../actions/browser';
import { loadLocale } from '../../actions/locale';
import { localConfigLoaded } from '../../actions/localConfig';
import { loadPrintCapabilities } from '../../actions/print';

import ConfigUtils from '../../utils/ConfigUtils';
import PluginsUtils from '../../utils/PluginsUtils';

import url from 'url';
const urlQuery = url.parse(window.location.href, true).query;

import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';

import './appPolyfill';

import Theme from '../theme/Theme';

const DefaultAppLoaderComponent = () => (
    <span>
        <div className="_ms2_init_spinner _ms2_init_center"><div></div></div>
        <div className="_ms2_init_text _ms2_init_center">Loading MapStore</div>
    </span>
);


const AppWithThemeToggle = ({ appComponent: AppComponent, ...props }) => {

    const [appTheme, setAppTheme] = useState('default');
    const [isToggled, setIsToggled] = useState(false);

    const toggleButtonStyle = {
        position: 'fixed',
        bottom: '36px',
        right: '2px',
        width: '37px',
        height: '23px',
        borderRadius: '15px',
        backgroundColor: isToggled ? '#4CAF50' : '#ccc',
        transition: 'background-color 0.3s',
        cursor: 'pointer',
        zIndex: 1000,
        display: 'flex',
        justifyContent: isToggled ? 'flex-end' : 'flex-start',
        alignItems: 'center',
        padding: '5px',
    };

    const sliderCircleStyle = {
        width: '17px', // Circle size
        height: '17px',
        borderRadius: '50%',
        backgroundColor: 'white',
        transition: 'transform 0.3s', // Apply smooth sliding effect to the circle
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transform: isToggled ? 'translateX(3px)' : 'translateX(-2px)', // Move circle within the toggle area
    };

    // Sun SVG (for default theme)
    const sunIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-sun" viewBox="0 0 16 16">
            <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.0 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
        </svg>
    );

    // Moon SVG (for dark theme)
    const moonIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="#333" class="bi bi-moon" viewBox="0 0 16 16">
            <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278M4.858 1.311A7.27 7.27 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.32 7.32 0 0 0 5.205-2.162q-.506.063-1.029.063c-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286"/>
        </svg>
    );

    return (
        <>
            <Theme theme={appTheme} />
            <AppComponent {...props} />
            <div
                style={toggleButtonStyle}
                onClick={() => {
                    setAppTheme(prevAppTheme => prevAppTheme === 'default' ? 'dark' : 'default');
                    setIsToggled(!isToggled);
                }}
            >
                <div style={sliderCircleStyle}>
                    {isToggled ? moonIcon : sunIcon}
                </div>
            </div>
        </>
    );
};




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
        onStoreInit: PropTypes.func,
        onInit: PropTypes.func,
        onAfterInit: PropTypes.func,
        mode: PropTypes.string,
        loaderComponent: PropTypes.func,
        errorFallbackComponent: PropTypes.func
    };

    static defaultProps = {
        pluginsDef: {plugins: {}, requires: {}},
        initialActions: [],
        appStore: () => ({dispatch: () => {}, getState: () => ({}), subscribe: () => {}}),
        appComponent: () => <span/>,
        onStoreInit: () => {},
        loaderComponent: DefaultAppLoaderComponent
    };

    state = {
        initialized: false,
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
        if (this.state.initialized !== nextState.initialized) {
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
            const opts = {
                ...this.props.storeOpts,
                onPersist: onInit.bind(null, config),
                initialState: this.parseInitialState(config.initialState, {
                    mode: this.props.mode || (ConfigUtils.getBrowserProperties().mobile ? 'mobile' : 'desktop')
                }) || { defaultState: {}, mobile: {} }
            };
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
        const App = dragDropContext(html5Backend)(AppWithThemeToggle);

        return this.state.initialized
            ? <Provider store={this.store}>
                <App
                    {...other}
                    appComponent={this.props.appComponent}
                    plugins={{ ...PluginsUtils.getPlugins(plugins), requires }}
                />
            </Provider>
            : <this.props.loaderComponent />;
    }

    afterInit = () => {
        if (this.props.printingEnabled) {
            this.store.dispatch(loadPrintCapabilities(ConfigUtils.getConfigProp('printUrl')));
        }
        if (this.props.onAfterInit) {
            this.props.onAfterInit(this.store);
        }
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
        if (this.props.onInit) {
            this.props.onInit(this.store, this.afterInit.bind(this, [config]), config);
        } else {
            const locale = ConfigUtils.getConfigProp('locale');
            this.store.dispatch(loadLocale(null, locale));
            this.afterInit(config);
        }
    };

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

export default StandardApp;
