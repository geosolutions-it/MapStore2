
/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import LocaleUtils from '../../utils/LocaleUtils';
import StandardStore from '../../stores/StandardStore';
import StandardApp from './StandardApp';

const main = (config = {}, Component) => {

    const startApp = () => {

        const {
            initialState = {
                defaultState: {},
                mobile: {}
            },
            appReducers = {},
            appEpics = {},
            rootReducerFunc
        } = config;

        const appStore = StandardStore.bind(null, {
            initialState,
            appReducers,
            appEpics,
            rootReducerFunc
        });

        const App = Component ? Component : StandardApp;

        ReactDOM.render(
            <App { ...config } appStore={appStore}/>,
            document.getElementById('container')
        );
    };

    if (!global.Intl ) {
        // Ensure Intl is loaded, then call the given callback
        LocaleUtils.ensureIntl(startApp);
    } else {
        startApp();
    }
};

export default main;
