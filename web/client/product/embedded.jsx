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

    const {pages, pluginsDef, initialState, storeOpts} = require('./appConfigEmbedded');

    const StandardRouter = connect((state) => ({
        locale: state.locale || {},
        pages
    }))(require('../components/app/StandardRouter'));

    const appStore = require('../stores/StandardStore').bind(null, initialState, {
        mode: (state = 'embedded') => state
    }, {});

    const appConfig = {
        storeOpts,
        appStore,
        pluginsDef,
        initialActions: [],
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
