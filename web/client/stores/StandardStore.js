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

const DebugUtils = require('../utils/DebugUtils').default;
const {combineEpics, combineReducers} = require('../utils/PluginsUtils');

const LayersUtils = require('../utils/LayersUtils');
const {CHANGE_BROWSER_PROPERTIES} = require('../actions/browser');
const {createEpicMiddleware} = require('redux-observable');

const ListenerEnhancer = require('@carnesen/redux-add-action-listener-enhancer').default;

const { routerMiddleware, connectRouter } = require('connected-react-router');

const layersEpics = require('../epics/layers');
const controlsEpics = require('../epics/controls');
const configEpics = require('../epics/config');
const timeManagerEpics = require('../epics/dimension');
const {persistMiddleware, persistEpic} = require('../utils/StateUtils');

const standardEpics = {
    ...layersEpics,
    ...controlsEpics,
    ...timeManagerEpics,
    ...configEpics
};

module.exports = (initialState = {defaultState: {}, mobile: {}}, appReducers = {}, appEpics = {}, plugins = {}, storeOpts = {}) => {
    const history = storeOpts.noRouter ? null : require('./History').default;
    const allReducers = combineReducers(plugins, {
        ...appReducers,
        localConfig: require('../reducers/localConfig'),
        locale: require('../reducers/locale'),
        locales: () => {return null; },
        browser: require('../reducers/browser'),
        controls: require('../reducers/controls'),
        theme: require('../reducers/theme').default,
        help: require('../reducers/help'),
        map: () => {return null; },
        mapInitialConfig: () => {return null; },
        mapConfigRawData: () => null,
        layers: () => {return null; },
        router: storeOpts.noRouter ? undefined : connectRouter(history)
    });
    const rootEpic = persistEpic(combineEpics(plugins, {...standardEpics, ...appEpics}));
    const optsState = storeOpts.initialState || {defaultState: {}, mobile: {}};
    const defaultState = assign({}, initialState.defaultState, optsState.defaultState);
    const mobileOverride = assign({}, initialState.mobile, optsState.mobile);
    const epicMiddleware = persistMiddleware(createEpicMiddleware(rootEpic));
    const rootReducer = (state, action) => {
        let mapState = createHistory(LayersUtils.splitMapAndLayers(mapConfig(state, action)));
        let newState = {
            ...allReducers(state, action),
            map: mapState && mapState.map ? map(mapState.map, action) : null,
            mapInitialConfig: mapState && mapState.mapInitialConfig || mapState && mapState.loadingError && {
                loadingError: mapState.loadingError,
                mapId: mapState.loadingError.mapId
            } || null,
            mapConfigRawData: mapState && mapState.mapConfigRawData || null,
            layers: mapState ? layers(mapState.layers, action) : null
        };
        if (action && action.type === CHANGE_BROWSER_PROPERTIES && newState.browser.mobile) {
            newState = assign(newState, mobileOverride);
        }

        return newState;
    };
    let store;
    let enhancer;
    if (storeOpts && storeOpts.notify !== false) {
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

    let middlewares = [epicMiddleware];
    if (!storeOpts.noRouter) {
        // Build the middleware for intercepting and dispatching navigation actions
        const reduxRouterMiddleware = routerMiddleware(history);
        middlewares = [...middlewares, reduxRouterMiddleware];
    }

    store = DebugUtils.createDebugStore(rootReducer, defaultState, middlewares, enhancer);
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
    return store;
};
