import { createStore as createReduxStore, applyMiddleware, compose, combineReducers as originalCombineReducers }  from 'redux';
import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';

export const getReducers = (plugins) => Object.keys(plugins).map((name) => plugins[name].reducers)
    .reduce((previous, current) => ({...previous, ...current}), {});

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

export const getMiddlewares = (userMiddlewares = [], debug) => {
    return debug ? [thunkMiddleware, logger, ...userMiddlewares]
        : [thunkMiddleware, ...userMiddlewares];
};

export const createStore = ({
    rootReducer,
    plugins = [],
    reducers = [],
    state = {},
    middlewares = [],
    debug = false,
    enhancer,
    shared = true
} = {}) => {
    const reducer = rootReducer || combineReducers(plugins, reducers);
    const middleware = applyMiddleware.apply(null, getMiddlewares(middlewares, debug));
    const finalCreateStore = (window.devToolsExtension ? compose(
        middleware,
        window.devToolsExtension()
    ) : middleware)(createReduxStore);
    const store = finalCreateStore(reducer, state, enhancer);
    if (shared) {
        global.reduxStore = store;
    }
    return store;
};

export const updateStore = ({ rootReducer, plugins = [], reducers = [] } = {}, store) => {
    const reducer = rootReducer || combineReducers(plugins, reducers);
    (store || global.reduxStore).replaceReducer(reducer);
};

export const setStore = (store) => {
    global.reduxStore = store;
};

export const getState = () => {
    return global.reduxStore && global.reduxStore.getState() || {};
};

export default {
    createStore,
    updateStore,
    setStore,
    getState
};
