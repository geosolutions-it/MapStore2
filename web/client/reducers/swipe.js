/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import assign from 'object-assign';
import { SET_ACTIVE } from '../actions/swipe';

export default (state = {}, action) => {
    switch (action.type) {
    case SET_ACTIVE: {
        return assign({}, state, {active: action.active });
    }
    default:
        return state;

    }
};
