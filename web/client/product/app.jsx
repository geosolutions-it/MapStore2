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
const ConfigUtils = require('../utils/ConfigUtils');

const {loadMaps} = require('../actions/maps');

const StandardApp = require('../components/app/StandardApp');

const {pages, pluginsDef, initialState} = require('./appConfig');

const StandardRouter = connect((state) => ({
    locale: state.locale || {},
    pages
}))(require('../components/app/StandardRouter'));

const appStore = require('../stores/StandardStore').bind(null, initialState, {
    home: require('./reducers/home'),
    maps: require('../reducers/maps')
});

const initialActions = [
    () => loadMaps(ConfigUtils.getDefaults().geoStoreUrl, ConfigUtils.getDefaults().initialMapFilter || "*")
];

const appConfig = {
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
