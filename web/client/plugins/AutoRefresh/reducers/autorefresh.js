/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    AUTOREFRESH_START,
    AUTOREFRESH_STOP,
    AUTOREFRESH_PAUSE
} from "../actions/autorefresh";

const defaultState = {
    enabled: false,
    paused: false
};

const autorefresh = (state = {...defaultState}, action) => {

    switch (action.type) {
    case AUTOREFRESH_START:
        return {
            ...state,
            enabled: true,
            paused: false
        };
    case AUTOREFRESH_STOP:
        return {
            ...state,
            enabled: false,
            paused: false
        };
    case AUTOREFRESH_PAUSE:
        return {
            ...state,
            paused: action.paused
        };
    default:
        return state;
    }
};

export default autorefresh;
