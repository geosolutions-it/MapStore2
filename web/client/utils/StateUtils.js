import { createStore as createReduxStore, applyMiddleware }  from 'redux';
import thunkMiddleware from 'redux-thunk';
import { combineReducers } from './PluginsUtils';


export const createStore = ({plugins = [], reducers = [], state = {}, middlewares = []} = {}) => {
    const reducer = combineReducers(plugins, reducers);
    const middleware = applyMiddleware.apply([thunkMiddleware, ...middlewares]);
    return middleware(createReduxStore)(reducer, state);
};

export const updateStore = (store, { plugins = [], reducers = []} = {}) => {
    const reducer = combineReducers(plugins, reducers);
    store.replaceReducer(reducer);
};
