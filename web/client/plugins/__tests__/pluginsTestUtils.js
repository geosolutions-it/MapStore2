/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from "prop-types";
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
import security from '../../reducers/security';
import localConfig from "../../reducers/localConfig";

import { getPlugins } from "../../utils/PluginsUtils";

// StandardStore add by default current reducers
const rootReducers = {
    map,
    layers,
    controls,
    maptype,
    annotations,
    context,
    security,
    localConfig
};

const createRegisterActionsMiddleware = (actions) => {
    return () => next => action => {
        actions.push(action);
        return next(action);
    };
};

function getImplementation(pluginDef) {
    return Object.keys(pluginDef).reduce((previous, key) => {
        if (endsWith(key, 'Plugin')) {
            return pluginDef[key];
        }
        return previous;
    }, null);
}

class PluginsContext extends React.Component {
    static propTypes = {
        plugins: PropTypes.object
    };
    static defaultProps = {
        plugins: {}
    };
    static childContextTypes = {
        plugins: PropTypes.object
    };
    getChildContext() {
        return {
            plugins: this.props.plugins
        };
    }
    render() {
        return <>{this.props.children}</>;
    }
}

/**
 * Helper to get a plugin configured for testing.
 *
 * @param  {object}   pluginDef plugin definition as loaded from require / import
 * @param  {object}   storeState      optional initial state for redux store (overrides default store built using plugin's reducers)
 * @param  {object}   [plugins]     optional plugins definition list ({MyPlugin: <definition>, ...}), used to filter available containers
 * @params {function|function[]} [testEpics] optional epics to intercept actions for test
 * @param {function|function[]} [containersReducers] optional additional reducers, that will be enabled, in addition to those defined by the plugin itself
 * @param {object} [additionalPlugins] optional list of plugin definitions that will be added to the Plugin context
 * @param {object[]} [items] optional list of plugin items (subplugins)
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
export const getPluginForTest = (pluginDef, storeState, plugins, testEpics = [], containersReducers, actions = [], additionalPlugins = {}, items = [] ) => {
    const PluginImpl = getImplementation(pluginDef);
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

    const store = applyMiddleware(thunkMiddleware, epicMiddleware, createRegisterActionsMiddleware(actions))(createStore)(reducer, storeState);
    const pluginProps = items?.length ? {items} : undefined;
    return {
        PluginImpl,
        Plugin: (props) => <Provider store={store}><PluginsContext plugins={getPlugins(additionalPlugins)}><PluginImpl {...props} {...pluginProps}/></PluginsContext></Provider>,
        store,
        actions,
        containers
    };
};

/**
 * Helper to get a lazy loaded plugin configured for testing.
 *
 * @param  {object}   pluginDef plugin definition as loaded from require / import
 * @param  {object}   storeState      optional initial state for redux store (overrides default store built using plugin's reducers)
 * @param  {object}   [plugins]     optional plugins definition list ({MyPlugin: <definition>, ...}), used to filter available containers
 * @params {function|function[]} [testEpics] optional epics to intercept actions for test
 * @param {function|function[]} [containersReducers] optional additional reducers, that will be enabled, in addition to those defined by the plugin itself
 * @param {object} [additionalPlugins] optional list of plugin definitions that will be added to the Plugin context
 * @param {object[]} [items] optional list of plugin items (subplugins)
 * @returns {Promise<object>} an object with the following properties:
 *   - Plugin: plugin propertly connected to a mocked store
 *   - store: the mocked store
 *   - actions: list of dispatched actions (can be read at any time to test actions launched)
 *   - containers: list of plugins supported containers
 *
 * @example
 * import MyPlugin from './MyPlugin';
 * getLazyPluginForTest(MyPlugin, {}, {ContainerPlugin: {}}).then(({ Plugin, store, actions, containers }) => {
 *      ...
 * });
 */
export const getLazyPluginForTest = ({
    plugin,
    storeState = {},
    plugins = {},
    testEpics = [],
    containersReducers,
    actions = [],
    additionalPlugins = {},
    items = []} ) => {
    const PluginImpl = getImplementation(plugin);
    if (PluginImpl.loadPlugin) {
        return new Promise((resolve) => {
            PluginImpl.loadPlugin((lazy) => {
                resolve(getPluginForTest({
                    ...plugin,
                    LazyPlugin: lazy
                }, storeState, plugins, testEpics, containersReducers, actions, additionalPlugins, items));
            });
        });
    }
    return Promise.resolve(getPluginForTest(plugin, storeState, plugins, testEpics, containersReducers, actions, additionalPlugins, items));
};

export function getByXPath(xpath) {
    return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}
