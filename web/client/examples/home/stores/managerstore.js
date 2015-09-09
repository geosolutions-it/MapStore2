/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var {createStore, compose, combineReducers, applyMiddleware} = require('redux');

var thunkMiddleware = require('redux-thunk');
var maps = require('../../../reducers/maps');
var locale = require('../../../reducers/locale');
var url = require('url');

const urlQuery = url.parse(window.location.href, true).query;

 // reducers
const reducers = combineReducers({
    maps,
    locale
});

let finalCreateStore;
if (__DEVTOOLS__ && urlQuery.debug) {
    const { devTools, persistState } = require('redux-devtools');
    finalCreateStore = compose(
      applyMiddleware(thunkMiddleware),
      devTools(),
      persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
  )(createStore);
} else {
    finalCreateStore = applyMiddleware(thunkMiddleware)(createStore);
}

module.exports = finalCreateStore(reducers, {});
