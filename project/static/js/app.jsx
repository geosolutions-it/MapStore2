/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');

const {Provider} = require('react-redux');

const {Router, Route, hashHistory} = require('react-router');

const Main = require('./containers/Main');
const Home = require('./containers/Home');

const store = require('./stores/store');

const {loadMapConfig} = require('../MapStore2/web/client/actions/config');
const {changeBrowserProperties} = require('../MapStore2/web/client/actions/browser');
const {loadLocale} = require('../MapStore2/web/client/actions/locale');

const ConfigUtils = require('../MapStore2/web/client/utils/ConfigUtils');
const LocaleUtils = require('../MapStore2/web/client/utils/LocaleUtils');

store.dispatch(changeBrowserProperties(ConfigUtils.getBrowserProperties()));

ConfigUtils
    .loadConfiguration()                       // localConfig.json: Global configuration
    .then(() => {                              // config.json: app configuration
        const { configUrl, legacy } = ConfigUtils.getUserConfiguration('config', 'json');
        store.dispatch(loadMapConfig(configUrl, legacy));

        let locale = LocaleUtils.getUserLocale();
        store.dispatch(loadLocale('MapStore2/web/client/translations', locale));
    });

ReactDOM.render(
    <Provider store={store}>
        <Router history={hashHistory}>
            <Route path="/" component={Home}/>
            <Route path="/main" component={Main}/>
        </Router>
    </Provider>
    , document.getElementById("container")
);
