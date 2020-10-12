/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const CHANGE_MOUSE_POSITION = 'CHANGE_MOUSE_POSITION';
export const CHANGE_MOUSE_POSITION_CRS = 'CHANGE_MOUSE_POSITION_CRS';
export const CHANGE_MOUSE_POSITION_STATE = 'CHANGE_MOUSE_POSITION_STATE';

export function changeMousePosition(position) {
    return {
        type: CHANGE_MOUSE_POSITION,
        position: position
    };
}

export function changeMousePositionCrs(crs) {
    return {
        type: CHANGE_MOUSE_POSITION_CRS,
        crs: crs
    };
}

export function changeMousePositionState(enabled) {
    return {
        type: CHANGE_MOUSE_POSITION_STATE,
        enabled: enabled
    };
}
