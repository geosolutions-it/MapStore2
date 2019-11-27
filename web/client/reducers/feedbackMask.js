/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {FEEDBACK_MASK_LOADING, FEEDBACK_MASK_LOADED, FEEDBACK_MASK_ENABLED, DETECTED_NEW_PAGE} = require('../actions/feedbackMask');

function feedbackMask(state = {}, action) {
    switch (action.type) {
    case FEEDBACK_MASK_LOADING:
        return {...state, loading: true, enabled: false, status: null, errorMessage: null, mode: action.mode};
    case FEEDBACK_MASK_LOADED:
        return {...state, loading: false};
    case FEEDBACK_MASK_ENABLED:
        return {
            ...state,
            enabled: action.enabled,
            status: action.error && action.error.status,
            errorMessage: action.error && action.error.messageId,
            errorMessageParams: action.error && action.error.errorMessageParams
        };
    case DETECTED_NEW_PAGE:
        return {
            ...state,
            currentPage: action.currentPage
        };
    default:
        return state;
    }
}

module.exports = feedbackMask;
