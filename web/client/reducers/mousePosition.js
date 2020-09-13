/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {
    CHANGE_MOUSE_POSITION,
    CHANGE_MOUSE_POSITION_CRS,
    CHANGE_MOUSE_POSITION_STATE
} = require('../actions/mousePosition');

const {
    MOUSE_MOVE,
    MOUSE_OUT
} = require('../actions/map');

const assign = require('object-assign');

function mousePosition(state = {enabled: true, position: null, crs: null}, action) {
    switch (action.type) {
    case CHANGE_MOUSE_POSITION_STATE:
        return assign({}, state, {
            enabled: action.enabled
        });
    case CHANGE_MOUSE_POSITION:
        return assign({}, state, {
            position: action.position
        });
    case CHANGE_MOUSE_POSITION_CRS:
        return assign({}, state, {
            crs: action.crs
        });
    case MOUSE_MOVE: {
        return assign({}, state, {position: action.position, mouseOut: false});
    }
    case MOUSE_OUT: {
        return assign({}, state, {mouseOut: true});
    }
    default:
        return state;
    }
}

module.exports = mousePosition;
