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

function geometryChanged(features, owner, enableEdit) {
    return {
        type: GEOMETRY_CHANGED,
        features,
        owner,
        enableEdit
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
    DRAW_SUPPORT_STOPPED, drawStopped,
    GEOMETRY_CHANGED, geometryChanged
};
