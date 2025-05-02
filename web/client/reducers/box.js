/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { CHANGE_BOX_SELECTION_STATUS } from '../actions/box';

const initialState = {
    status: null
};

function box(state = initialState, action) {
    switch (action.type) {
    case CHANGE_BOX_SELECTION_STATUS:
        return Object.assign({}, state, {status: action.status});
    default:
        return state;
    }
}

export default box;
