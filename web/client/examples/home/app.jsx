/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var {Provider} = require('react-redux');

var {loadLocale} = require('../../actions/locale');
var {loadMaps} = require('../../actions/maps');

var ConfigUtils = require('../../utils/ConfigUtils');


var Debug = require('../../components/development/Debug');

var store = require('./stores/homestore');

function startApp() {
    ConfigUtils.loadConfiguration().then(() => {
        store.dispatch(loadLocale('translations'));
        store.dispatch(loadMaps());
    });
    let Home = require('./containers/Home');

    React.render(
        <Debug store={store}>
            <Provider store={store}>
                {() => <Home />}
            </Provider>
        </Debug>,
        document.getElementById('container')
    );
}

if (!global.Intl) {
    require.ensure(['intl', 'intl/locale-data/jsonp/en.js', 'intl/locale-data/jsonp/it.js'], (require) => {
        global.Intl = require('intl');
        require('intl/locale-data/jsonp/en.js');
        require('intl/locale-data/jsonp/it.js');
        startApp();
    });
}else {
    startApp();
}
