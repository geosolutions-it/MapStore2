/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SET_VECTOR_LAYER } from '../actions/vectorstyler';

import { SET_RASTER_LAYER } from '../actions/rasterstyler';
import { SET_STYLER_LAYER, STYLER_RESET } from '../actions/styler';
function styler(state = {}, action) {
    switch (action.type) {
    case SET_VECTOR_LAYER: {
        return {...state, layer: action.layer, type: "vector"};
    }
    case SET_RASTER_LAYER: {
        return {...state, layer: action.layer, type: "raster"};
    }
    case STYLER_RESET: {
        return {};
    }
    case SET_STYLER_LAYER: {
        return {...state, layer: action.layer};
    }
    default:
        return state;
    }
}

export default styler;
