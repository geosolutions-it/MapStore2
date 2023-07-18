/**
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { UPDATE_SETTINGS, LOADING, RESET } from "../actions/permalink";

const initialState = {
    settings: {
        allowAllUser: true
    }
};
export default (state = initialState, action = {}) => {
    switch (action.type) {
    case UPDATE_SETTINGS:
        return {
            ...state,
            settings: {...state.settings, ...action.settings}
        };
    case LOADING:
        return {
            ...state,
            loading: action.loading
        };
    case RESET: {
        return initialState;
    }
    default:
        return state;
    }
};
