/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const CHANGE_MOUSE_POSITION = 'CHANGE_MOUSE_POSITION';
const CHANGE_MOUSE_POSITION_CRS = 'CHANGE_MOUSE_POSITION_CRS';
const CHANGE_MOUSE_POSITION_STATE = 'CHANGE_MOUSE_POSITION_STATE';
const MOUSE_MOVE_MAP_EVENT = 'MOUSE_MOVE_MAP_EVENT';
const MOUSE_OUT = 'MOUSE_OUT';

function changeMousePosition(position) {
    return {
        type: CHANGE_MOUSE_POSITION,
        position: position
    };
}

function changeMousePositionCrs(crs) {
    return {
        type: CHANGE_MOUSE_POSITION_CRS,
        crs: crs
    };
}

function changeMousePositionState(enabled) {
    return {
        type: CHANGE_MOUSE_POSITION_STATE,
        enabled: enabled
    };
}

/**
 * Triggered on mouse move. (only if some tool is registered on this event. See `registerEventListener`).
 * @param {object} position the position of the mouse on the map.
 */
const mouseMoveMapEvent = (position) => ({
    type: MOUSE_MOVE_MAP_EVENT,
    position
});

/**
 * Triggered when the mouse goes out from the map
 */
const mouseOut = () => ({
    type: MOUSE_OUT
});

module.exports = {
    CHANGE_MOUSE_POSITION,
    CHANGE_MOUSE_POSITION_CRS,
    CHANGE_MOUSE_POSITION_STATE,
    MOUSE_MOVE_MAP_EVENT,
    MOUSE_OUT,
    changeMousePosition,
    changeMousePositionCrs,
    changeMousePositionState,
    mouseMoveMapEvent,
    mouseOut
};
