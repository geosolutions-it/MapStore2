/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var Provider = require('react-redux').Provider;

var {loadLocale} = require('../../actions/locale');
var {loadMaps} = require('../../actions/maps');

var ConfigUtils = require('../../utils/ConfigUtils');

var Home = require('./containers/Home');
var Debug = require('../../components/development/Debug');

var store = require('./stores/homestore');

ConfigUtils.loadConfiguration().then(() => {
    store.dispatch(loadLocale('translations'));
    store.dispatch(loadMaps());
});

React.render(
    <Debug store={store}>
        <Provider store={store}>
            {() => <Home />}
        </Provider>
    </Debug>,
    document.getElementById('container')
);
