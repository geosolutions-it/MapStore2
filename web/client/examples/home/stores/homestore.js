/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var createStore = require('redux').createStore;
var combineReducers = require('redux').combineReducers;
var applyMiddleware = require('redux').applyMiddleware;
var thunkMiddleware = require('redux-thunk');
var mapConfig = require('../../../reducers/config');
var locale = require('../../../reducers/locale');
var maps = require('../../../reducers/maps');

 // reducers
const reducers = combineReducers({
    mapConfig,
    locale,
    maps
});

 // store
const createStoreWithMiddleware = applyMiddleware(
    thunkMiddleware
)(createStore);

module.exports = createStoreWithMiddleware(reducers, {});
