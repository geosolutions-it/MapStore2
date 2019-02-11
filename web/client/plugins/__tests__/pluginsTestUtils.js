/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import endsWith from 'lodash/endsWith';
import {Provider} from 'react-redux';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import { combineEpics, createEpicMiddleware } from 'redux-observable';

const createRegisterActionsMiddleware = (actions) => {
    return () => next => action => {
        actions.push(action);
        return next(action);
    };
};

export const getPluginForTest = (pluginDef, storeState, plugins) => {
    const PluginImpl = Object.keys(pluginDef).reduce((previous, key) => {
        if (endsWith(key, 'Plugin')) {
            return pluginDef[key];
        }
        return previous;
    }, null);
    const containers = Object.keys(PluginImpl)
        .filter(prop => !plugins || Object.keys(plugins).indexOf(prop + 'Plugin') !== -1)
        .reduce((previous, key) => {
            return { ...previous, [key]: PluginImpl[key]};
        }, {});
    const reducer = combineReducers(pluginDef.reducers || {});

    const rootEpic = combineEpics.apply(null, Object.keys(pluginDef.epics || {}).map(key => pluginDef.epics[key]) || []);
    const epicMiddleware = createEpicMiddleware(rootEpic);
    const actions = [];
    const store = applyMiddleware(epicMiddleware, createRegisterActionsMiddleware(actions))(createStore)(reducer, storeState);
    return {
        plugin: (props) => <Provider store={store}><PluginImpl {...props} /></Provider>,
        store,
        actions,
        containers
    };
};

