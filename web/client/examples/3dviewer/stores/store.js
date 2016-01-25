var {createStore, combineReducers, applyMiddleware} = require('redux');

var thunkMiddleware = require('redux-thunk');
var mapConfig = require('../../../reducers/config');
var map = require('../../../reducers/map');
var locale = require('../../../reducers/locale');
var {searchResults} = require('../../../reducers/search');

 // reducers
const reducers = combineReducers({
    mapConfig,
    map,
    locale,
    searchResults
});

// compose middleware(s) to createStore
let finalCreateStore = applyMiddleware(thunkMiddleware)(createStore);

// export the store with the given reducers (and middleware applied)
module.exports = finalCreateStore(reducers, {});
