var React = require('react');
var ReactDOM = require('react-dom');

var Provider = require('react-redux').Provider;

// include application component
var Viewer = require('./containers/Viewer');

var {loadMapConfig} = require('../../actions/config');
var {loadLocale} = require('../../actions/locale');

var ConfigUtils = require('../../utils/ConfigUtils');
const LocaleUtils = require('../../utils/LocaleUtils');

// initializes Redux store
var store = require('./stores/store');

ConfigUtils.loadConfiguration().then(() => {
    const { configUrl, legacy } = ConfigUtils.getUserConfiguration('config', 'json');
    store.dispatch(loadMapConfig(configUrl, legacy));

    let locale = LocaleUtils.getUserLocale();
    store.dispatch(loadLocale('../../translations', locale));
});

// Renders the application, wrapped by the Redux Provider to connect the store to components
ReactDOM.render(
    <Provider store={store}>
        <Viewer />
    </Provider>,
    document.getElementById('container')
);
