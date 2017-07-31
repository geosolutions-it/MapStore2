/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const HIGHLIGHT_STATUS = 'HIGHLIGHT_STATUS';
const UPDATE_HIGHLIGHTED = 'UPDATE_HIGHLIGHTED';
const SET_HIGHLIGHT_FEATURES_PATH = 'HIGHLIGHT:SET_HIGHLIGHT_FEATURES_PATH';

function highlightStatus(status) {
    return {
        type: HIGHLIGHT_STATUS,
        status
    };
}
function setHighlightFeaturesPath(featuresPath) {
    return {
        type: SET_HIGHLIGHT_FEATURES_PATH,
        featuresPath
    };
}
function updateHighlighted(features, status) {
    return {
        type: UPDATE_HIGHLIGHTED,
        features,
        status
    };
}

module.exports = {
    HIGHLIGHT_STATUS, highlightStatus,
    UPDATE_HIGHLIGHTED, updateHighlighted,
    SET_HIGHLIGHT_FEATURES_PATH, setHighlightFeaturesPath
};
