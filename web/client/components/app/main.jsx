
/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {ensureIntl} from '../../utils/LocaleUtils';
import StandardStore from '../../stores/StandardStore';
import StandardApp from './StandardApp';
/**
 * main entry point of application.
 * This function provide basic functionality to initialize an application in the MapStore framework.
 * Note: all the configuration provided will be inherit from the application component (default component is StandardApp).
 * @memberof components.app
 * @name main
 * @class
 * @prop {object} config app configuration
 * @prop {object} config.targetId DOM node target id
 * @prop {object} config.initialState redux initial state
 * @prop {object} config.appReducers app reducers
 * @prop {object} config.appEpics app epics
 * @prop {object} config.rootReducerFunc replace the default root reducer function (it should return a new state)
 * @prop {component} Component replace the app component
 */
const main = (config = {}, Component) => {

    const startApp = () => {

        const {
            targetId = 'container',
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
            document.getElementById(targetId)
        );
    };

    if (!global.Intl ) {
        // Ensure Intl is loaded, then call the given callback
        ensureIntl(startApp);
    } else {
        startApp();
    }
};

export default main;
