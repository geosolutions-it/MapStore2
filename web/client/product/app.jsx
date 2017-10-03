/**
 * Copyright 2016, GeoSolutions Sas.
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
    const ConfigUtils = require('../utils/ConfigUtils');
    const {loadMaps} = require('../actions/maps');
    const {loadVersion} = require('../actions/version');
    const StandardApp = require('../components/app/StandardApp');

    const {pages, pluginsDef, initialState, storeOpts, appEpics = {}} = require('./appConfig');

    const StandardRouter = connect((state) => ({
        locale: state.locale || {},
        pages
    }))(require('../components/app/StandardRouter'));

    const appStore = require('../stores/StandardStore').bind(null, initialState, {
        maptype: require('../reducers/maptype'),
        maps: require('../reducers/maps')
    }, appEpics);

    const initialActions = [
        () => loadMaps(ConfigUtils.getDefaults().geoStoreUrl, ConfigUtils.getDefaults().initialMapFilter || "*"),
        loadVersion
    ];

    const appConfig = {
        storeOpts,
        appEpics,
        appStore,
        pluginsDef,
        initialActions,
        appComponent: StandardRouter,
        printingEnabled: true
    };

    ReactDOM.render(
        <StandardApp {...appConfig}/>,
        document.getElementById('container')
    );
};

if (!global.Intl ) {
    // Ensure Intl is loaded, then call the given callback
    LocaleUtils.ensureIntl(startApp);
} else {
    startApp();
}
