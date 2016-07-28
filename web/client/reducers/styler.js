/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
    SET_VECTOR_LAYER
} = require('../actions/vectorstyler');
const {
    SET_RASTER_LAYER
} = require('../actions/rasterstyler');

function styler(state = {}, action) {
    switch (action.type) {
        case SET_VECTOR_LAYER: {
            return {...state, layer: action.layer};
        }
        case SET_RASTER_LAYER: {
            return {...state, layer: action.layer};
        }
        default:
            return state;
    }
}

module.exports = styler;
