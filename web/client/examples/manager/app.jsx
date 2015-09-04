/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');

var Provider = require('react-redux').Provider;
var Manager = require('./containers/Manager');

var store = require('./stores/managerstore');
var url = require('url');

var loadMaps = require('../../actions/maps').loadMaps;
var loadLocale = require('../../actions/locale').loadLocale;
var LocaleUtils = require('../../utils/LocaleUtils');

store.dispatch(loadMaps());

const urlQuery = url.parse(window.location.href, true).query;

let locale = LocaleUtils.getLocale(urlQuery);
store.dispatch(loadLocale('../../translations', locale));

React.render(
    <Provider store={store}>
        {() => <Manager />}
    </Provider>
    , document.getElementById("mapList"));
