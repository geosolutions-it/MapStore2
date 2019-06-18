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

import map from '../../reducers/map';
import layers from '../../reducers/layers';
import controls from '../../reducers/controls';

// StandardStore add by default current reducers
const rootReducers = {
    map,
    layers,
    controls
};

const createRegisterActionsMiddleware = (actions) => {
    return () => next => action => {
        actions.push(action);
        return next(action);
    };
};

/**
 * Helper to get a plugin configured for testing.
 *
 * @param  {object}   pluginDef plugin definition as loaded from require / import
 * @param  {object}   storeState      optional initial state for redux store (overrides default store built using plugin's reducers)
 * @param  {object}   plugins     optional plugins definition list ({MyPlugin: <definition>, ...}), used to filter available containers
 * @returns {object} an object with the following properties:
 *   - Plugin: plugin propertly connected to a mocked store
 *   - store: the mocked store
 *   - actions: list of dispatched actions (can be read at any time to test actions launched)
 *   - containers: list of plugins supported containers
 *
 * @example
 * import MyPlugin from './MyPlugin';
 * const { Plugin, store, actions, containers } = getPluginForTest(MyPlugin, {}, {ContainerPlugin: {}});
 */
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
    const reducer = combineReducers({ ...(pluginDef.reducers || {}), ...rootReducers });

    const rootEpic = combineEpics.apply(null, Object.keys(pluginDef.epics || {}).map(key => pluginDef.epics[key]) || []);
    const epicMiddleware = createEpicMiddleware(rootEpic);
    const actions = [];
    const store = applyMiddleware(epicMiddleware, createRegisterActionsMiddleware(actions))(createStore)(reducer, storeState);
    return {
        Plugin: (props) => <Provider store={store}><PluginImpl {...props} /></Provider>,
        store,
        actions,
        containers
    };
};

