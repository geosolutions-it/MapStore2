/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {createStore} from "./StateUtils";

import url from 'url';

const urlQuery = url.parse(window.location.href, true).query;

var DebugUtils = {
    createDebugStore: function(reducer, initialState, userMiddlewares, enhancer) {
        return createStore({
            rootReducer: reducer,
            state: initialState,
            middlewares: userMiddlewares,
            enhancer,
            debug: urlQuery && urlQuery.debug && __DEVTOOLS__
        });
    }
};

export default DebugUtils;
