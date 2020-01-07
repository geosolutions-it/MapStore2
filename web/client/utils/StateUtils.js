import { createStore as createReduxStore, applyMiddleware, compose, combineReducers }  from 'redux';
import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import {wrapEpics} from "./EpicsUtils";
import ConfigUtils from './ConfigUtils';

export const getMiddlewares = (userMiddlewares = [], debug) => {
    return debug ? [thunkMiddleware, logger, ...userMiddlewares]
        : [thunkMiddleware, ...userMiddlewares];
};

export const PERSISTED_STORE_NAME = 'persisted.reduxStore';

/**
 * Persists the given store.
 *
 * @param {object} store store to be persisted
 * @param {string} name optional name (if you want to persist more than one store)
 */
export const setStore = (store, name = PERSISTED_STORE_NAME) => {
    ConfigUtils.setConfigProp(name, store);
    return store;
};

/**
 * Returns a persisted store.
 *
 * @param {string} name optional name (if you want to restore more than one store)
 */
export const getStore = (name = PERSISTED_STORE_NAME) => {
    return ConfigUtils.getConfigProp(name) || {};
};

const persistMiddleware = (middleware, storeName = PERSISTED_STORE_NAME, name = 'epic') => {
    ConfigUtils.setConfigProp(storeName + '.' + name, middleware);
    return middleware;
};

const fetchMiddleware = (storeName = PERSISTED_STORE_NAME, name = 'epic') => {
    return ConfigUtils.getConfigProp(storeName + '.' + name) || {};
};

/**
 * Returns state from a persisted store.
 *
 * @param {string} name optional name (if you want to persist more than one store)
 */
export const getState = (name) => {
    return getStore(name) && getStore(name).getState() || {};
};

/**
 * Creates and returns a Redux store, using the given options.
 * Includes the following functionalities by default: redux-thunk, redux-observables, debug mode.
 *
 * @param {object} options key-value pairs of options for the store.
 * @param {function} options.rootReducer optional root (combined) reducer for the store, if not specified it is built using the reducers.
 * @param {function} options.rootEpic optional root (combined) epic for the store, if not specified it is built using the epics.
  * @param {object} options.reducers list of reducers.
 * @param {object} options.epics list of epics.
 * @param {object} options.state initial state of the store.
 * @param {array} options.middlewares custom middlewares to be added to the store.
 * @param {boolean} options.debug enables debug mode (console logger and redux dev tools enabled).
 * @param {function} enhancer optional store enhancer to be configured.
 */
export const createStore = ({
    rootReducer,
    rootEpic,
    reducers = {},
    epics = {},
    state = {},
    middlewares = [],
    debug = false,
    enhancer
} = {}) => {
    const reducer = rootReducer || combineReducers(reducers);
    const epic = rootEpic || combineEpics(...wrapEpics(epics));
    const allMiddlewares = epic ? [persistMiddleware(createEpicMiddleware(epic)), ...middlewares] : middlewares;
    const middleware = applyMiddleware.apply(null, getMiddlewares(allMiddlewares, debug));
    const finalCreateStore = (window.devToolsExtension && debug ? compose(
        middleware,
        window.devToolsExtension()
    ) : middleware)(createReduxStore);
    return setStore(finalCreateStore(reducer, state, enhancer));
};

/**
 * Updates a Redux store with new reducers and epics.
 *
 * @param {object} options options to update
 * @param {function} options.rootReducer optional root (combined) reducer for the store, if not specified it is built using the reducers.
 * @param {function} options.rootEpic optional root (combined) epic for the store, if not specified it is built using the epics.
 * @param {object} options.reducers list of reducers.
 * @param {object} options.epics list of epics.
 * @param {object} store the store to update, if not specified, the persisted one will be used
 * @param {object} epicMiddleware the epic middleware to update, if not specified the persisted one will be used
 */
export const updateStore = ({ rootReducer, rootEpic, reducers = {}, epics = {} } = {}, store, epicMiddleware) => {
    const reducer = rootReducer || combineReducers(reducers);
    (store || getStore()).replaceReducer(reducer);
    const epic = rootEpic || combineEpics(...wrapEpics(epics));
    (epicMiddleware || fetchMiddleware()).replaceEpic(epic);
};

export default {
    createStore,
    updateStore,
    setStore,
    getState
};
