/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import endsWith from 'lodash/endsWith';
import castArray from 'lodash/castArray';
import flatten from 'lodash/flatten';
import {Provider} from 'react-redux';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import { combineEpics, createEpicMiddleware } from 'redux-observable';
import thunkMiddleware from 'redux-thunk';

import map from '../../reducers/map';
import maptype from '../../reducers/maptype';
import layers from '../../reducers/layers';
import controls from '../../reducers/controls';
import annotations from '../../reducers/annotations';
import context from '../../reducers/context';

// StandardStore add by default current reducers
const rootReducers = {
    map,
    layers,
    controls,
    maptype,
    annotations,
    context
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
 * @param  {object}   [plugins]     optional plugins definition list ({MyPlugin: <definition>, ...}), used to filter available containers
 * @params {function|function[]} [testEpics] optional epics to intercept actions for test
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
export const getPluginForTest = (pluginDef, storeState, plugins, testEpics = [], containersReducers ) => {
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
    // TODO: The following commented code causes this error (probably for TOC plugins) in tests:  Disconnected (0 times)reconnect failed before timeout of 2000ms (ping timeout) so reducers have to be passed manually
    // const containersReducers = Object.keys(plugins || {}).map(k => plugins[k]).reduce((acc, { reducers = {} }) => ({ ...acc, ...reducers }), {});
    const reducer = combineReducers({
        ...(pluginDef.reducers || {}),
        ...containersReducers,
        ...rootReducers
    });
    const pluginEpics = Object.keys(pluginDef.epics || {}).map(key => pluginDef.epics[key]) || [];

    const pluginsEpics = flatten( // converts array of epics [[epic1, epic2..], [epic3, epic4...], ...] into a flat array [epic1, epic2, epic3, epic4]
        Object.keys(plugins || {}).map(k => plugins[k]) // transform the map in an array
            .map(p => Object.keys(p.epics || {}).map(key => p.epics[key]) || []) // get epics as array from each plugin
    );
    const rootEpic = combineEpics.apply(null, [...pluginEpics, ...pluginsEpics, ...castArray(testEpics)]);
    const epicMiddleware = createEpicMiddleware(rootEpic);
    const actions = [];

    const store = applyMiddleware(thunkMiddleware, epicMiddleware, createRegisterActionsMiddleware(actions))(createStore)(reducer, storeState);
    return {
        PluginImpl,
        Plugin: (props) => <Provider store={store}><PluginImpl {...props} /></Provider>,
        store,
        actions,
        containers
    };
};

