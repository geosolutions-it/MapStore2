/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import assign from 'object-assign';
import { SET_ACTIVE, SET_MODE, SET_SWIPE_TOOL_DIRECTION, SET_SPY_TOOL_RADIUS } from '../actions/swipe';

export default (state = {}, action) => {
    switch (action.type) {
    case SET_ACTIVE: {
        return assign({}, state, {[action.prop]: action.active });
    }
    case SET_MODE: {
        return assign({}, state, {mode: action.mode});
    }
    case SET_SWIPE_TOOL_DIRECTION: {
        const newSwipeSetting = {
            ...state.swipe,
            direction: action.direction
        };
        return assign({}, state, {swipe: newSwipeSetting});
    }
    case SET_SPY_TOOL_RADIUS: {
        const newSpySetting = {
            ...state.spy,
            radius: action.radius
        };
        return assign({}, state, {spy: newSpySetting});
    }
    default:
        return state;
    }
};
