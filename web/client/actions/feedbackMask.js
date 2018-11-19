/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const FEEDBACK_MASK_LOADING = 'FEEDBACK_MASK:FEEDBACK_MASK_LOADING';
const FEEDBACK_MASK_LOADED = 'FEEDBACK_MASK:FEEDBACK_MASK_LOADED';
const FEEDBACK_MASK_ENABLED = 'FEEDBACK_MASK:FEEDBACK_MASK_ENABLED';
const DETECTED_NEW_PAGE = 'FEEDBACK_MASK:DETECTED_NEW_PAGE';

function feedbackMaskLoading(mode) {
    return {
        type: FEEDBACK_MASK_LOADING,
        mode
    };
}

function feedbackMaskLoaded() {
    return {
        type: FEEDBACK_MASK_LOADED
    };
}

function feedbackMaskEnabled(enabled, error) {
    return {
        type: FEEDBACK_MASK_ENABLED,
        enabled,
        error
    };
}

function detectedNewPage(currentPage) {
    return {
        type: DETECTED_NEW_PAGE,
        currentPage
    };
}

module.exports = {
    FEEDBACK_MASK_LOADING,
    FEEDBACK_MASK_LOADED,
    FEEDBACK_MASK_ENABLED,
    DETECTED_NEW_PAGE,
    feedbackMaskLoading,
    feedbackMaskLoaded,
    feedbackMaskEnabled,
    detectedNewPage
};
