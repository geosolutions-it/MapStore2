/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');

var Provider = require('react-redux').Provider;
var Viewer = require('./containers/Viewer');
var url = require('url');

var loadMapConfig = require('../../actions/config').loadMapConfig;
var loadLocale = require('../../actions/locale').loadLocale;
var ConfigUtils = require('../../utils/ConfigUtils');
var LocaleUtils = require('../../utils/LocaleUtils');

var store = require('./stores/viewerstore');

const urlQuery = url.parse(window.location.href, true).query;

const { configUrl, legacy } = ConfigUtils.getConfigurationOptions(urlQuery, 'config', 'json');

store.dispatch(loadMapConfig(configUrl, legacy));

let locale = LocaleUtils.getLocale(urlQuery);
store.dispatch(loadLocale('../../translations', locale));
if (__DEVTOOLS__ && urlQuery.debug) {
    const { DevTools, DebugPanel, LogMonitor } = require('redux-devtools/lib/react');
    React.render(
        <div className="fill">
            <div className="fill-debug">
                <Provider store={store}>
                    {() => <Viewer />}
                </Provider>
            </div>
            <DebugPanel top right bottom>
              <DevTools store={store} monitor={LogMonitor} />
            </DebugPanel>
        </div>,
        document.getElementById('container')
    );
} else {
    React.render(
        <Provider store={store}>
            {() => <Viewer />}
        </Provider>,
        document.getElementById('container')
    );
}
