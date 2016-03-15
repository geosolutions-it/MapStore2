/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');
const Debug = require('../../components/development/Debug');

const {Router, Route, hashHistory} = require('react-router');

const Home = require('../pages/Home');
const MapViewer = require('../pages/MapViewer');

const Localized = require('../../components/I18N/Localized');

const App = (props) => {
    return (
        <div className="fill">
            <Localized messages={props.messages} locale={props.current} loadingError={props.localeError}>
                <Router history={hashHistory}>
                    <Route path="/" component={Home}/>
                    <Route path="/viewer/:mapType/:mapId" component={MapViewer}/>
                </Router>
            </Localized>
            <Debug/>
        </div>
    );
};

module.exports = connect((state) => {
    return state.locale && {...state.locale} || {};
})(App);
