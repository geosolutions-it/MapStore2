/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const CHANGE_DRAWING_STATUS = 'CHANGE_DRAWING_STATUS';
const END_DRAWING = 'DRAW:END_DRAWING';
const SET_CURRENT_STYLE = 'DRAW:SET_CURRENT_STYLE';
const GEOMETRY_CHANGED = 'DRAW:GEOMETRY_CHANGED';
const DRAW_SUPPORT_STOPPED = 'DRAW:DRAW_SUPPORT_STOPPED';
const FEATURES_SELECTED = 'DRAW:FEATURES_SELECTED';
const DRAWING_FEATURE = 'DRAW:DRAWING_FEATURES';

function geometryChanged(features, owner, enableEdit, textChanged, circleChanged) {
    return {
        type: GEOMETRY_CHANGED,
        features,
        owner,
        enableEdit,
        textChanged,
        circleChanged
    };
}
/** used to manage the selected features
 * @param {object[]} features geojson
*/
function selectFeatures(features = []) {
    return {
        type: FEATURES_SELECTED,
        features
    };
}
function drawingFeatures(features = []) {
    return {
        type: DRAWING_FEATURE,
        features
    };
}
function drawStopped() {
    return {
        type: DRAW_SUPPORT_STOPPED
    };
}

function changeDrawingStatus(status, method, owner, features, options, style) {
    return {
        type: CHANGE_DRAWING_STATUS,
        status,
        method,
        owner,
        features,
        options,
        style
    };
}


function endDrawing(geometry, owner) {
    return {
        type: END_DRAWING,
        geometry,
        owner
    };
}

function setCurrentStyle(style) {
    return {
        type: SET_CURRENT_STYLE,
        currentStyle: style
    };
}

const drawSupportReset = (owner) => changeDrawingStatus("clean", "", owner, [], {});

module.exports = {
    CHANGE_DRAWING_STATUS, changeDrawingStatus, drawSupportReset,
    END_DRAWING, endDrawing,
    SET_CURRENT_STYLE, setCurrentStyle,
    FEATURES_SELECTED, selectFeatures,
    DRAWING_FEATURE, drawingFeatures,
    DRAW_SUPPORT_STOPPED, drawStopped,
    GEOMETRY_CHANGED, geometryChanged
};
