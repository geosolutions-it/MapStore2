/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var url = require('url');

var {createStore, compose, applyMiddleware} = require('redux');
var thunkMiddleware = require('redux-thunk');

const urlQuery = url.parse(window.location.href, true).query;

var DebugUtils = {
    createDebugStore: function(reducer, initialState, userMiddlewares) {
        let middlewares = userMiddlewares || [thunkMiddleware];
        let finalCreateStore;
        if (__DEVTOOLS__ && urlQuery.debug) {
            const { devTools, persistState } = require('redux-devtools');
            finalCreateStore = compose(
              applyMiddleware.apply(null, middlewares),
              devTools(),
              persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
          )(createStore);
        } else {
            finalCreateStore = applyMiddleware(thunkMiddleware)(createStore);
        }
        return finalCreateStore(reducer, initialState);
    }
};

module.exports = DebugUtils;
