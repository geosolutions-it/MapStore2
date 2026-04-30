/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SET_ENABLED } from "../actions/autorefresh";


const defaultState = {
    enabled: false
};

const autorefresh = (state = {...defaultState}, action) => {
    switch (action.type) {
    case SET_ENABLED:
        return {
            ...state,
            enabled: action.enabled
        };
    default:
        return state;
    }
};

export default autorefresh;
