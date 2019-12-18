import { createStore as createReduxStore, applyMiddleware, compose, combineReducers as originalCombineReducers }  from 'redux';
import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';
import { createEpicMiddleware, combineEpics as originalCombineEpics } from 'redux-observable';
import curry from 'lodash/curry';
import ConfigUtils from './ConfigUtils';

export const getFromPlugins = curry((selector, plugins) => Object.keys(plugins).map((name) => plugins[name][selector])
    .reduce((previous, current) => ({ ...previous, ...current }), {}));

export const getReducers = getFromPlugins('reducers');

export const getEpics = getFromPlugins('epics');

/**
* Produces the reducers from the plugins, combined with other plugins
* @param {array} plugins the plugins
* @param {object} [reducers] other reducers
* @returns {function} a reducer made from the plugins' reducers and the reducers passed as 2nd parameter
*/
export const combineReducers = (plugins, reducers) => {
    const pluginsReducers = getReducers(plugins);
    return originalCombineReducers({...reducers, ...pluginsReducers});
};

/**
 * default wrapper for the epics.
 * @memberof utils.PluginsUtils
 * @param {epic} epic the epic to wrap
 * @return {epic} epic wrapped with error catch and re-subscribe functionalities.S
 */
const defaultEpicWrapper = epic => (...args) =>
    epic(...args).catch((error, source) => {
        setTimeout(() => { throw error; }, 0);
        return source;
    });

/**
 * Produces the rootEpic for the plugins, combined with other epics passed as 2nd argument
 * @param {array} plugins the plugins
 * @param {function[]} [epics] the epics to add to the plugins' ones
 * @param {function} [epicWrapper] returns a function that wraps the epic
 * @return {function} the rootEpic, obtained combining plugins' epics and the other epics passed as argument.
 */
export const combineEpics = (plugins, epics = {}, epicWrapper = defaultEpicWrapper) => {
    const pluginEpics = {...getEpics(plugins), ...epics};
    return originalCombineEpics(...Object.keys(pluginEpics).map(k => pluginEpics[k]).map(epicWrapper));
};

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
 * @param {function} options.rootReducer optional root (combined) reducer for the store, if not specified it is built using the reducers and plugins arrays.
 * @param {function} options.rootEpic optional root (combined) epic for the store, if not specified it is built using the epics and plugins arrays.
 * @param {array} options.plugins list of plugins from which reducers and epics will be extracted to build the store.
 * @param {object} options.reducers list of reducers to add to those extracted from plugins list.
 * @param {object} options.epics list of epics to add to those extracted from plugins list.
 * @param {object} options.state initial state of the store.
 * @param {array} options.middlewares custom middlewares to be added to the store.
 * @param {boolean} options.debug enables debug mode (console logger and redux dev tools enabled).
 * @param {function} enhancer optional store enhancer to be configured.
 */
export const createStore = ({
    rootReducer,
    rootEpic,
    plugins = [],
    reducers = {},
    epics = {},
    state = {},
    middlewares = [],
    debug = false,
    enhancer
} = {}) => {
    const reducer = rootReducer || combineReducers(plugins, reducers);
    const epic = rootEpic || combineEpics(plugins, epics);
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
 * @param {function} options.rootReducer optional root (combined) reducer for the store, if not specified it is built using the reducers and plugins arrays.
 * @param {function} options.rootEpic optional root (combined) epic for the store, if not specified it is built using the epics and plugins arrays.
 * @param {array} options.plugins list of plugins from which reducers and epics will be extracted to build the store.
 * @param {object} options.reducers list of reducers to add to those extracted from plugins list.
 * @param {object} options.epics list of epics to add to those extracted from plugins list.
 * @param {object} store the store to update, if not specified, the persisted one will be used
 * @param {object} epicMiddleware the epic middleware to update, if not specified the persisted one will be used
 */
export const updateStore = ({ rootReducer, rootEpic, plugins = [], reducers = {}, epics = {} } = {}, store, epicMiddleware) => {
    const reducer = rootReducer || combineReducers(plugins, reducers);
    (store || getStore()).replaceReducer(reducer);
    const epic = rootEpic || combineEpics(plugins, epics);
    (epicMiddleware || fetchMiddleware()).replaceEpic(epic);
};

export default {
    createStore,
    updateStore,
    setStore,
    getState
};
