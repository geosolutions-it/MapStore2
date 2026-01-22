/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SET_ENABLED, SET_INTERVAL, SET_LAYERIDS } from "../actions/autorefresh";
import { AUTOREFRESH_DEFAULT_INTERVAL_IN_SEC } from "../constants";


const defaultState = {
    enabled: false,
    layerIds: [],
    interval: AUTOREFRESH_DEFAULT_INTERVAL_IN_SEC
};

const autorefresh = (state = {...defaultState}, action) => {
    switch (action.type) {
    case SET_LAYERIDS:
        return {
            ...state,
            layerIds: Array.from(new Set(action.layerIds))
        };
    case SET_ENABLED:
        return {
            ...state,
            enabled: action.enabled
        };
    case SET_INTERVAL:
        return {
            ...state,
            interval: action.interval
        };
    default:
        return state;
    }
};

export default autorefresh;
