var {createStore, combineReducers} = require('redux');

var queryForm = require('../../../reducers/queryform');

 // reducers
const reducers = combineReducers({
    queryForm
});

// export the store with the given reducers
module.exports = createStore(reducers, {});
