/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AUTOREFRESH_SET_ENABLED } from "../actions/autorefresh";


const defaultState = {
    enabled: false,
    layers: {}
};

const autorefresh = (state = {...defaultState}, action) => {
    switch (action.type) {
    case AUTOREFRESH_SET_ENABLED:
        return {
            ...state,
            enabled: action.enabled,
            layers: action.layers
        };
    default:
        return state;
    }
};

export default autorefresh;
