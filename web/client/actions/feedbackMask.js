/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const LOADING_MASK_LOADING = 'LOADING_MASK:LOADING_MASK_LOADING';
const LOADING_MASK_LOADED = 'LOADING_MASK:LOADING_MASK_LOADED';
const LOADING_MASK_ENABLED = 'LOADING_MASK:LOADING_MASK_ENABLED';

function feedbackMaskLoading() {
    return {
        type: LOADING_MASK_LOADING
    };
}

function feedbackMaskLoaded() {
    return {
        type: LOADING_MASK_LOADED
    };
}

function feedbackMaskEnabled(enabled, error, mode) {
    return {
        type: LOADING_MASK_ENABLED,
        enabled,
        error,
        mode
    };
}

module.exports = {
    LOADING_MASK_LOADING,
    LOADING_MASK_LOADED,
    LOADING_MASK_ENABLED,
    feedbackMaskLoading,
    feedbackMaskLoaded,
    feedbackMaskEnabled
};
