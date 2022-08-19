/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {applyMiddleware, combineReducers, compose, createStore as createReduxStore} from 'redux';
import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';
import {combineEpics, createEpicMiddleware} from 'redux-observable';
import {semaphore, wrapEpics} from "./EpicsUtils";
import ConfigUtils from './ConfigUtils';
import isEmpty from 'lodash/isEmpty';
import {BehaviorSubject, Subject} from 'rxjs';

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
export const getStore = (name = 'persisted.reduxStore') => {
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
 * Returns state from a persisted store.
 *
 * @param {string} name optional name (if you want to persist more than one store)
 */
export const getState = (name) => {
    return !isEmpty(getStore(name)) && getStore(name)?.getState() || {};
};

const isolateEpics = (epics, muteState) => {
    const isolateEpic = (epic, name) => (action$, store, options) => {
        const modifiedOptions = options ?? {};
        muteState[name] = new Subject();
        const pluginRenderStream$ = muteState[name].asObservable();

        modifiedOptions.pluginRenderStream$ = pluginRenderStream$;
        return epic(action$.let(semaphore(pluginRenderStream$.startWith(true))), store, modifiedOptions).let(semaphore(
            pluginRenderStream$.startWith(true)
        ));
    };
    return Object.entries(epics).reduce((out, [k, epic]) => ({ ...out, [k]: isolateEpic(epic) }), {});
};


export const createStoreManager = (initialReducers, initialEpics) => {
    // Create an object which maps keys to reducers
    const reducers = {...initialReducers};
    const epics = {...initialEpics};
    const addedEpics = {};
    const epicsListenedBy = {};
    const epicRegistrations = {};
    const groupedByModule = {};

    // Create the initial combinedReducer
    let combinedReducer = combineReducers(reducers);

    const subject = new Subject();
    subject.next(true);
    const isolated = isolateEpics(epics, subject.asObservable());
    const epic$ = new BehaviorSubject(combineEpics(...wrapEpics(isolated)));

    // An array which is used to delete state keys when reducers are removed
    let keysToRemove = [];

    let muteState = {};

    const addToRegistry = (module, epicName) => {
        epicRegistrations[epicName] = [...(epicRegistrations[epicName] ?? []), module];
        groupedByModule[module] = [...(groupedByModule[module] ?? []), epicName];
        epicsListenedBy[epicName] = [...(epicsListenedBy[epicName] ?? []), module];
    };

    return {
        getReducerMap: () => reducers,

        // The root reducer function exposed by this object
        // This will be passed to the store
        reduce: (state, action) => {
            // If any reducers have been removed, clean up their state first
            if (keysToRemove.length > 0) {
                // eslint-disable-next-line no-param-reassign
                state = {...state};
                for (let key of keysToRemove) {
                    delete state[key];
                }
                keysToRemove = [];
            }

            // Delegate to the combined reducer
            return combinedReducer(state, action);
        },

        // Adds a new reducer with the specified key
        addReducer: (key, reducer) => {
            if (!key || reducers[key]) {
                return;
            }

            // Add the reducer to the reducer mapping
            reducers[key] = reducer;

            // Generate a new combined reducer
            combinedReducer = combineReducers(reducers);
        },

        // Removes a reducer with the specified key
        removeReducer: key => {
            if (!key || !reducers[key]) {
                return;
            }

            // Remove it from the reducer mapping
            delete reducers[key];

            // Add the key to the list of keys to clean up
            keysToRemove.push(key);

            // Generate a new combined reducer
            combinedReducer = combineReducers(reducers);
        },
        // Adds a new epics set, mutable by the specified key
        addEpics: (key, epicsList) => {
            if (Object.keys(epicsList).length) {
                const epicsToAdd = Object.keys(epicsList).reduce((prev, current) => {
                    if (!addedEpics[current]) {
                        addedEpics[current] = key;
                        addToRegistry(key, current);
                        return ({...prev, [current]: epicsList[current]});
                    }
                    addToRegistry(key, current);
                    return prev;
                }, {});
                const isolatedEpics = isolateEpics(epicsToAdd, muteState);
                wrapEpics(isolatedEpics).forEach(epic => epic$.next(epic));
            }
        },
        // Mute epics set with a specified key
        muteEpics: (key) => {
            const moduleEpicRegistrations = groupedByModule[key];
            // try to mute everything registered by module. If epic is shared, remove current module from epicsListenedBy
            moduleEpicRegistrations && moduleEpicRegistrations.forEach(epicName => {
                const indexOf = epicsListenedBy[epicName].indexOf(key);
                if (indexOf >= 0) {
                    delete epicsListenedBy[epicName][indexOf];
                }
                // check if epic is still listened by anything. If not - mute it
                if (!epicsListenedBy[epicName].length) {
                    muteState[epicName].next(false);
                }
            });
        },
        unmuteEpics: (key) => {
            const moduleEpicRegistrations = groupedByModule[key];
            // unmute epics if exactly one plugin wants to register specific epic
            moduleEpicRegistrations && moduleEpicRegistrations.forEach(epicName => {
                const indexOf = epicsListenedBy[epicName].indexOf(key);
                if (indexOf === -1) {
                    epicsListenedBy[epicName].push(key);
                }
                // now if epic intended to be registered by first listener plugin - unmute it
                if (epicsListenedBy[epicName].length === 1) {
                    muteState[epicName].next(true);
                }
            });
        },
        rootEpic: (...args) => epic$.mergeMap(e => e(...args))
    };
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
    const finalCreateStore = (window.__REDUX_DEVTOOLS_EXTENSION__ && debug ? compose(
        middleware,
        window.__REDUX_DEVTOOLS_EXTENSION__()
    ) : middleware)(createReduxStore);
    return setStore(finalCreateStore(reducer, state, enhancer));
};

/**
 * Updates a Redux store with new reducers and epics.
 *
 * This method needs a new COMPLETE set of reducers / epics. If you want to add reducers / epics to existing ones, use storeManager methods instead.
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
 * @deprecated in favor of store.storeManager.addReducer & store.storeManager.addEpics
 */
export const augmentStore = ({ reducers = {}, epics = {} } = {}, store) => {
    const persistedStore = store || getStore();
    Object.keys(reducers).forEach((key) => {
        persistedStore.storeManager.addReducer(key, reducers[key]);
    });
    persistedStore.dispatch({type: 'REDUCERS_LOADED'});
    persistedStore.storeManager.addEpics('notMutable', wrapEpics(epics));
};
