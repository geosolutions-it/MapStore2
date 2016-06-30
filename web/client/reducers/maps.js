/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {MAPS_LIST_LOADED, MAPS_LIST_LOAD_ERROR} = require('../actions/maps');
const assign = require('object-assign');
function maps(state = null, action) {
    switch (action.type) {
        case MAPS_LIST_LOADED:
            if (action.maps && action.maps.results && Array.isArray(action.maps.results)) {
                return action.maps;
            }
            return assign({}, action.maps, {results: [action.maps.results]});
        case MAPS_LIST_LOAD_ERROR:
            return {
                loadingError: action.error
            };
        default:
            return state;
    }
}

module.exports = maps;
