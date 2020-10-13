/**
 * Copyright 2017, Sourcepole AG.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CHANGE_SELECTION_STATE } from '../actions/selection';

import assign from 'object-assign';

function selection(state = {
    geomType: null
}, action) {
    switch (action.type) {
    case CHANGE_SELECTION_STATE:
        return assign({}, state, {
            geomType: action.geomType,
            point: action.point,
            line: action.line,
            polygon: action.polygon
        });
    default:
        return state;
    }
}

export default selection;
