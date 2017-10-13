/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const assign = require('object-assign');

const {mapConfigHistory, createHistory} = require('../utils/MapHistoryUtils');

const map = mapConfigHistory(require('../reducers/map'));

const layers = require('../reducers/layers');
const mapConfig = require('../reducers/config');

const DebugUtils = require('../utils/DebugUtils');
const {combineReducers, combineEpics} = require('../utils/PluginsUtils');

const LayersUtils = require('../utils/LayersUtils');
const {CHANGE_BROWSER_PROPERTIES} = require('../actions/browser');
const {createEpicMiddleware} = require('redux-observable');

const SecurityUtils = require('../utils/SecurityUtils');
const ListenerEnhancer = require('@carnesen/redux-add-action-listener-enhancer').default;

const {routerReducer, routerMiddleware} = require('react-router-redux');
const routerCreateHistory = require('history/createHashHistory').default;
const history = routerCreateHistory();

// Build the middleware for intercepting and dispatching navigation actions
const reduxRouterMiddleware = routerMiddleware(history);
const standardEpics = {
    ...require('../epics/controls')
};

module.exports = (initialState = {defaultState: {}, mobile: {}}, appReducers = {}, appEpics = {}, plugins, storeOpts = {}) => {
    const allReducers = combineReducers(plugins, {
        ...appReducers,
        localConfig: require('../reducers/localConfig'),
        locale: require('../reducers/locale'),
        browser: require('../reducers/browser'),
        controls: require('../reducers/controls'),
        theme: require('../reducers/theme'),
        help: require('../reducers/help'),
        map: () => {return null; },
        mapInitialConfig: () => {return null; },
        layers: () => {return null; },
        routing: routerReducer
    });
    const rootEpic = combineEpics(plugins, {...appEpics, ...standardEpics});
    const optsState = storeOpts.initialState || {defaultState: {}, mobile: {}};
    const defaultState = assign({}, initialState.defaultState, optsState.defaultState);
    const mobileOverride = assign({}, initialState.mobile, optsState.mobile);
    const epicMiddleware = createEpicMiddleware(rootEpic);
    const rootReducer = (state, action) => {
        let mapState = createHistory(LayersUtils.splitMapAndLayers(mapConfig(state, action)));
        let newState = {
            ...allReducers(state, action),
            map: mapState && mapState.map ? map(mapState.map, action) : null,
            mapInitialConfig: mapState && mapState.mapInitialConfig || mapState && mapState.loadingError && {
                loadingError: mapState.loadingError,
                mapId: mapState.loadingError.mapId
            } || null,
            layers: mapState ? layers(mapState.layers, action) : null
        };
        if (action && action.type === CHANGE_BROWSER_PROPERTIES && newState.browser.mobile) {
            newState = assign(newState, mobileOverride);
        }

        return newState;
    };
    let store;
    let enhancer;
    if (storeOpts && storeOpts.notify) {
        enhancer = ListenerEnhancer;
    }
    if (storeOpts && storeOpts.persist) {
        storeOpts.persist.whitelist.forEach((fragment) => {
            const fragmentState = localStorage.getItem('mapstore2.persist.' + fragment);
            if (fragmentState) {
                defaultState[fragment] = JSON.parse(fragmentState);
            }
        });
        if (storeOpts.onPersist) {
            setTimeout(() => {storeOpts.onPersist(); }, 0);
        }
    }
    store = DebugUtils.createDebugStore(rootReducer, defaultState, [epicMiddleware, reduxRouterMiddleware], enhancer);
    if (storeOpts && storeOpts.persist) {
        const persisted = {};
        store.subscribe(() => {
            storeOpts.persist.whitelist.forEach((fragment) => {
                const fragmentState = store.getState()[fragment];
                if (fragmentState && persisted[fragment] !== fragmentState) {
                    persisted[fragment] = fragmentState;
                    localStorage.setItem('mapstore2.persist.' + fragment, JSON.stringify(fragmentState));
                }
            });
        });
    }
    SecurityUtils.setStore(store);
    return store;
};
