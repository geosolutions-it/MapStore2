import { createStore as createReduxStore, applyMiddleware, compose, combineReducers }  from 'redux';
import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import {wrapEpics} from "./EpicsUtils";
import ConfigUtils from './ConfigUtils';
import { BehaviorSubject } from 'rxjs';

/**
 * Returns a list of standard ReduxJS middlewares, augmented with user ones.
 *
 * @param {array} userMiddlewares user middlewares to add to standard ones
 * @param {bool} debug if true, middlewares needed to enable debug mode are returned also
 */
export const getMiddlewares = (userMiddlewares = [], debug) => {
    return debug ? [thunkMiddleware, logger, ...userMiddlewares]
        : [thunkMiddleware, ...userMiddlewares];
};

/**
 * Default persisted store name.
 */
export const PERSISTED_STORE_NAME = 'persisted.reduxStore';

/**
 * Persists the given store.
 * A Redux Store can be persisted so that it can be used outside of the Redux Provider tree.
 * For example it is used by the dynamic plugin loading mechanism to add new reducers at runtime.
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

/**
 * Persists the given middleware.
 * A Redux middleware can be persisted so that it can be modified after creation.
 * For example it is used by the dynamic plugin loading mechanism to add new epics to the redux-observable middleware
 * at runtime.
 *
 * @param {object} middleware middleware to be persisted
 * @param {string} storeName optional store name the middleware is used by
 * @param {string} name optional name (if you want to persist more than one middleware)
 */
export const persistMiddleware = (middleware, storeName = PERSISTED_STORE_NAME, name = 'epicMiddleware') => {
    ConfigUtils.setConfigProp(storeName + '.' + name, middleware);
    return middleware;
};

/**
 * Returns a stored middleware
 * @param {string} storeName optional store name the middleware is used by
 * @param {string} name optional name (if you want to persist more than one middleware)
 */
const fetchMiddleware = (storeName = PERSISTED_STORE_NAME, name = 'epicMiddleware') => {
    return ConfigUtils.getConfigProp(storeName + '.' + name) || {};
};

/**
 * Persists a Redux root reducer.
 * A Redux reducer can be persisted so that it can be modified after creation.
 * For example it is used by the dynamic plugin loading mechanism to update a store reducer
 * at runtime.
 *
 * @param {object} reducer reducer to be persisted
 * @param {string} storeName optional store name the reducer is used by
 * @param {string} name optional name (if you want to persist more than one reducer)
 */
export const persistReducer = (reducer, storeName = PERSISTED_STORE_NAME, name = 'rootReducer') => {
    ConfigUtils.setConfigProp(storeName + '.' + name, reducer);
    return reducer;
};

/**
 * Returns a stored root reducer
 * @param {string} storeName optional store name the reducer is used by
 * @param {string} name optional name (if you want to persist more than one reducer)
 */
const fetchReducer = (storeName = PERSISTED_STORE_NAME, name = 'rootReducer') => {
    return ConfigUtils.getConfigProp(storeName + '.' + name) || {};
};

/**
 * Persists a redux-observable root epic.
 * A redux-observable epic can be persisted so that it can be modified after creation.
 * For example it is used by the dynamic plugin loading mechanism to update epics
 * at runtime.
 *
 * @param {object} epic epic to be persisted
 * @param {string} storeName optional store name the epic is used by
 * @param {string} name optional name (if you want to persist more than one epic)
 */
export const persistEpic = (epic, storeName = PERSISTED_STORE_NAME, name = 'rootEpic') => {
    const epic$ = new BehaviorSubject(epic);
    ConfigUtils.setConfigProp(storeName + '.' + name, epic$);
    return (...args) =>
        epic$.mergeMap(e => e(...args));

};

/**
 * Returns a stored root epic
 * @param {string} storeName optional store name the epic is used by
 * @param {string} name optional name (if you want to persist more than one epic)
 */
const fetchEpic = (storeName = PERSISTED_STORE_NAME, name = 'rootEpic') => {
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
    const reducer = persistReducer(rootReducer || combineReducers(reducers));
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
 * This method needs a new COMPLETE set of reducers / epics. If you want to add reducers / epics to existing ones, use augmentStore instead.
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
    const reducer = persistReducer(rootReducer || combineReducers(reducers));
    (store || getStore()).replaceReducer(reducer);
    const epic = rootEpic || combineEpics(...wrapEpics(epics));
    (epicMiddleware || fetchMiddleware()).replaceEpic(epic);
};

/**
 * Updates a Redux store with new reducers and epics.
 * Needed by the dynamic plugins loading system, to update the application store with new reducers and epics exported by the plugins.
 *
 * If you want to add replace current reducers / epics with new ones, use updateStore instead.
 *
 * @param {object} options options to update
 * @param {object} options.reducers list of reducers to add.
 * @param {object} options.epics list of epics to add.
 * @param {object} store the store to update, if not specified, the persisted one will be used
 */
export const augmentStore = ({ reducers = {}, epics = {} } = {}, store) => {
    const rootReducer = fetchReducer();
    const reducer = (state, action) => {
        const newState = {...state, ...rootReducer(state, action)};
        return Object.keys(reducers).reduce((previous, current) => {
            return {
                ...previous,
                [current]: reducers[current](previous[current], action)
            };
        }, newState);
    };
    (store || getStore()).replaceReducer(reducer);
    const rootEpic = fetchEpic();

    wrapEpics(epics).forEach((epic) => {
        rootEpic.next(epic);
    });
};

export default {
    createStore,
    updateStore,
    setStore,
    getState
};
