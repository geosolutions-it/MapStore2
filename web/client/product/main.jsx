/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {themeLoaded} = require('../actions/theme');

module.exports = (config = {}, pluginsDef, overrideConfig = cfg => cfg) => {
    const React = require('react');
    const ReactDOM = require('react-dom');
    const {connect} = require('react-redux');
    const LocaleUtils = require('../utils/LocaleUtils');

    const startApp = () => {
        const {loadVersion} = require('../actions/version');
        const {versionSelector} = require('../selectors/version');
        const {loadAfterThemeSelector} = require('../selectors/config');
        const StandardApp = require('../components/app/StandardApp');

        const {
            appEpics = {},
            baseEpics,
            appReducers = {},
            baseReducers,
            initialState,
            pages,
            printingEnabled = true,
            storeOpts,
            themeCfg = {},
            mode
        } = config;

        const StandardRouter = connect((state) => ({
            locale: state.locale || {},
            pages,
            themeCfg,
            version: versionSelector(state),
            loadAfterTheme: loadAfterThemeSelector(state),
            themeLoaded: state.theme && state.theme.loaded
        }), {
            onThemeLoaded: themeLoaded
        })(require('../components/app/StandardRouter').default);

        const {updateMapLayoutEpic} = require('../epics/maplayout');
        const {setSupportedLocales} = require('../epics/localconfig');
        const {readQueryParamsOnMapEpic} = require('../epics/queryparams');

        /**
         * appStore data needed to create the store
         * @param {object} baseReducers is used to override all the appReducers
         * @param {object} appReducers is used to extend the appReducers
         * @param {object} baseEpics is used to override all the appEpics
         * @param {object} appEpics is used to extend the appEpics
         * @param {object} initialState is used to initialize the state of the application
        */
        const appStore = require('../stores/StandardStore').bind(null,
            initialState,
            baseReducers || {
                maptype: require('../reducers/maptype'),
                maps: require('../reducers/maps'),
                maplayout: require('../reducers/maplayout'),
                version: require('../reducers/version'),
                mapPopups: require('../reducers/mapPopups').default,
                ...appReducers
            },
            baseEpics || {
                updateMapLayoutEpic,
                setSupportedLocales,
                readQueryParamsOnMapEpic,
                ...appEpics
            }
        );

        const initialActions = [
            loadVersion
        ];

        const appConfig = overrideConfig({
            storeOpts,
            appEpics,
            appStore,
            pluginsDef,
            initialActions,
            appComponent: StandardRouter,
            printingEnabled,
            themeCfg,
            mode
        });

        ReactDOM.render(
            <StandardApp enableExtensions {...appConfig}/>,
            document.getElementById('container')
        );
    };

    if (!global.Intl ) {
        // Ensure Intl is loaded, then call the given callback
        LocaleUtils.ensureIntl(startApp);
    } else {
        startApp();
    }
};
