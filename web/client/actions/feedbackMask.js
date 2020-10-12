/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const FEEDBACK_MASK_LOADING = 'FEEDBACK_MASK:FEEDBACK_MASK_LOADING';
export const FEEDBACK_MASK_LOADED = 'FEEDBACK_MASK:FEEDBACK_MASK_LOADED';
export const FEEDBACK_MASK_ENABLED = 'FEEDBACK_MASK:FEEDBACK_MASK_ENABLED';
export const DETECTED_NEW_PAGE = 'FEEDBACK_MASK:DETECTED_NEW_PAGE';

export function feedbackMaskLoading(mode) {
    return {
        type: FEEDBACK_MASK_LOADING,
        mode
    };
}

export function feedbackMaskLoaded() {
    return {
        type: FEEDBACK_MASK_LOADED
    };
}

export function feedbackMaskEnabled(enabled, error) {
    return {
        type: FEEDBACK_MASK_ENABLED,
        enabled,
        error
    };
}

export function detectedNewPage(currentPage) {
    return {
        type: DETECTED_NEW_PAGE,
        currentPage
    };
}
