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

// initializes Redux store
var store = require('./stores/queryformstore');

const {loadLocale} = require('../../actions/locale');
const LocaleUtils = require('../../utils/LocaleUtils');

const QueryForm = require('./containers/QueryForm');

// we spread the store to the all application
// wrapping it with a Provider component
const QueryFormApp = React.createClass({
    render() {
        return (
        <Provider store={store}>
            <QueryForm/>
        </Provider>);
    }
});

let locale = LocaleUtils.getUserLocale();
store.dispatch(loadLocale('../../translations', locale));

const startApp = () => {
    // Renders the application, wrapped by the Redux Provider to connect the store to components
    ReactDOM.render(<QueryFormApp/>, document.getElementById('container'));
};

if (!global.Intl ) {
    require.ensure(['intl', 'intl/locale-data/jsonp/en.js', 'intl/locale-data/jsonp/it.js'], (require) => {
        global.Intl = require('intl');
        require('intl/locale-data/jsonp/en.js');
        require('intl/locale-data/jsonp/it.js');
        startApp();
    });
} else {
    startApp();
}
