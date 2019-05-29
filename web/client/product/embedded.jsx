/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const {connect} = require('react-redux');
const LocaleUtils = require('../utils/LocaleUtils');

const startApp = () => {
    const StandardApp = require('../components/app/StandardApp');
    const {loadVersion} = require('../actions/version');
    const {versionSelector} = require('../selectors/version');
    const {loadAfterThemeSelector} = require('../selectors/config');
    const {pages, pluginsDef, initialState, storeOpts} = require('./appConfigEmbedded');

    const StandardRouter = connect((state) => ({
        locale: state.locale || {},
        pages,
        version: versionSelector(state),
        loadAfterTheme: loadAfterThemeSelector(state)
    }))(require('../components/app/StandardRouter'));

    const {updateMapLayoutEpic} = require('../epics/maplayout');

    const appStore = require('../stores/StandardStore').bind(null, initialState, {
        mode: (state = 'embedded') => state,
        version: require('../reducers/version'),
        maplayout: require('../reducers/maplayout'),
        searchconfig: require('../reducers/searchconfig')
    }, {updateMapLayoutEpic});

    const appConfig = {
        mode: 'embedded',
        storeOpts,
        appStore,
        pluginsDef,
        initialActions: [loadVersion],
        appComponent: StandardRouter,
        printingEnabled: true
    };

    ReactDOM.render(
        <StandardApp {...appConfig} mode="embedded"/>,
        document.getElementById('container')
    );
};

if (!global.Intl ) {
    // Ensure Intl is loaded, then call the given callback
    LocaleUtils.ensureIntl(startApp);
} else {
    startApp();
}
