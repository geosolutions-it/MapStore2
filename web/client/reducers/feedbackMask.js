/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {LOADING_MASK_LOADING, LOADING_MASK_LOADED, LOADING_MASK_ENABLED} = require('../actions/feedbackMask');

function feedbackMask(state = {}, action) {
    switch (action.type) {
    case LOADING_MASK_LOADING:
        return {...state, loading: true, enabled: false, status: null, errorMessage: null, mode: null};
    case LOADING_MASK_LOADED:
        return {...state, loading: false};
    case LOADING_MASK_ENABLED:
        return {
            ...state,
            enabled: action.enabled,
            status: action.error && action.error.status,
            errorMessage: action.error && action.error.messageId,
            mode: action.mode
        };
    default:
        return state;
    }
}

module.exports = feedbackMask;
