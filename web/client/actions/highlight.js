/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

export const HIGHLIGHT_STATUS = 'HIGHLIGHT_STATUS';
export const UPDATE_HIGHLIGHTED = 'UPDATE_HIGHLIGHTED';
export const SET_HIGHLIGHT_FEATURES_PATH = 'HIGHLIGHT:SET_HIGHLIGHT_FEATURES_PATH';

export function highlightStatus(status) {
    return {
        type: HIGHLIGHT_STATUS,
        status
    };
}
export function setHighlightFeaturesPath(featuresPath) {
    return {
        type: SET_HIGHLIGHT_FEATURES_PATH,
        featuresPath
    };
}
export function updateHighlighted(features, status) {
    return {
        type: UPDATE_HIGHLIGHTED,
        features,
        status
    };
}

