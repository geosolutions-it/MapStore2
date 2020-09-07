
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
import store from '../../stores/store';
import App from './App';

const main = (config = {}) => {

    const startApp = () => {

        const {
            initialState = {
                defaultState: {},
                mobile: {}
            },
            appReducers = {},
            appEpics = {},
            plugins = {},
            storeOpts = {},
            rootReducerFunc
        } = config;

        const appStore = store.bind(null,
            initialState,
            appReducers,
            appEpics,
            plugins,
            storeOpts,
            rootReducerFunc
        );

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
