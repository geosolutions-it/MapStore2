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
    AUTOREFRESH_PAUSE,
    AUTOREFRESH_INIT,
    AUTOREFRESH_UPDATED
} from "../actions/autorefresh";
import { MAP_CONFIG_LOADED } from '../../../actions/config';
import { DASHBOARD_LOADED, DASHBOARD_RESET, LOAD_DASHBOARD } from '../../../actions/dashboard';
import { LOCATION_CHANGE } from 'connected-react-router';
import { AUTOREFRESH_MINIMUM_REFRESH_INTERVAL } from '../constants';

const defaultState = {
    enabled: false,
    paused: false,
    lastRefresh: null,
    minimumRefreshInterval: AUTOREFRESH_MINIMUM_REFRESH_INTERVAL
};

const autorefresh = (state = {...defaultState}, action) => {

    switch (action.type) {
    case MAP_CONFIG_LOADED:
    case DASHBOARD_LOADED:
    case DASHBOARD_RESET:
    case LOAD_DASHBOARD:
    case LOCATION_CHANGE:
        return { ...defaultState, minimumRefreshInterval: state.minimumRefreshInterval };
    case AUTOREFRESH_INIT:
        return { ...state, minimumRefreshInterval: action.minimumRefreshInterval };
    case AUTOREFRESH_UPDATED:
        return { ...state, lastRefresh: action.time };
    case AUTOREFRESH_START:
        return {
            ...state,
            enabled: true
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
