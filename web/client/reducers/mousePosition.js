/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    CHANGE_MOUSE_POSITION,
    CHANGE_MOUSE_POSITION_CRS,
    CHANGE_MOUSE_POSITION_STATE
} from '../actions/mousePosition';

import { MOUSE_MOVE, MOUSE_OUT } from '../actions/map';

function mousePosition(state = {enabled: true, position: null, crs: null}, action) {
    switch (action.type) {
    case CHANGE_MOUSE_POSITION_STATE:
        return Object.assign({}, state, {
            enabled: action.enabled
        });
    case CHANGE_MOUSE_POSITION:
        return Object.assign({}, state, {
            position: action.position
        });
    case CHANGE_MOUSE_POSITION_CRS:
        return Object.assign({}, state, {
            crs: action.crs
        });
    case MOUSE_MOVE: {
        return Object.assign({}, state, {position: action.position, mouseOut: false});
    }
    case MOUSE_OUT: {
        return Object.assign({}, state, {mouseOut: true});
    }
    default:
        return state;
    }
}

export default mousePosition;
