/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const CHANGE_DRAWING_STATUS = 'CHANGE_DRAWING_STATUS';
const END_DRAWING = 'END_DRAWING';
const SET_CURRENT_STYLE = 'SET_CURRENT_STYLE';

function changeDrawingStatus(status, method, owner, features, options) {
    return {
        type: CHANGE_DRAWING_STATUS,
        status,
        method,
        owner,
        features,
        options
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

module.exports = {
    CHANGE_DRAWING_STATUS,
    END_DRAWING,
    SET_CURRENT_STYLE,
    changeDrawingStatus,
    endDrawing,
    setCurrentStyle
};
