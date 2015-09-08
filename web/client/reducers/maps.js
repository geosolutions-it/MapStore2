/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {MAPS_LIST_LOADED, MAPS_LIST_LOAD_ERROR} = require('../actions/maps');

function maps(state = null, action) {
    switch (action.type) {
        case MAPS_LIST_LOADED:
            return action.maps;
        case MAPS_LIST_LOAD_ERROR:
            return {
                loadingError: action.error
            };
        default:
            return state;
    }
}

module.exports = maps;
