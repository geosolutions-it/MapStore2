/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SET_LAST_ACTIVE_ITEM } from '../actions/sidebarmenu';

export default (state = {
    lastActiveItem: null
}, action) => {
    switch (action.type) {
    case SET_LAST_ACTIVE_ITEM: {
        return {
            ...state,
            lastActiveItem: action.value
        };
    }
    default:
        return state;
    }
};
