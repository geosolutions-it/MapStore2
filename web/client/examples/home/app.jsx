/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');

var Provider = require('react-redux').Provider;
// var Viewer = require('./containers/Home');
var url = require('url');

var loadLocale = require('../../actions/locale').loadLocale;
var loadMaps = require('../../actions/maps').loadMaps;

var LocaleUtils = require('../../utils/LocaleUtils');
var Home = require('./containers/Home');
var store = require('./stores/managerstore');

const urlQuery = url.parse(window.location.href, true).query;

// store.dispatch(loadMapConfig(configUrl, legacy));
let locale = LocaleUtils.getLocale(urlQuery);
store.dispatch(loadLocale('translations', locale));
store.dispatch(loadMaps());


React.render(
    <Provider store={store}>
        {() => <Home/>}
    </Provider>,
    document.getElementById('container')
);
