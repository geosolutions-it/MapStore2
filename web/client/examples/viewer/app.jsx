/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');

var {Provider} = require('react-redux');
var Viewer = require('./containers/Viewer');

var {loadMapConfig} = require('../../actions/config');
var {loadLocale} = require('../../actions/locale');

var ConfigUtils = require('../../utils/ConfigUtils');
var LocaleUtils = require('../../utils/LocaleUtils');

var Debug = require('../../components/development/Debug');

var store = require('./stores/viewerstore');

ConfigUtils.loadConfiguration().then(() => {
    const { configUrl, legacy } = ConfigUtils.getUserConfiguration('config', 'json');
    store.dispatch(loadMapConfig(configUrl, legacy));

    let locale = LocaleUtils.getUserLocale();
    store.dispatch(loadLocale('../../translations', locale));
});

React.render(
    <Debug store={store}>
        <Provider store={store}>
            {() => <Viewer />}
        </Provider>
    </Debug>,
    document.getElementById('container')
);
