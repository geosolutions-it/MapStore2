/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    CHANGE_CAMERA_POSITION_CRS,
    CHANGE_CAMERA_POSITION_HEIGHT_TYPE,
    SHOW_CAMERA_POSITION,
    HIDE_CAMERA_POSITION
} from '../actions/cameraPosition';

function cameraPosition(state = {
    showCameraPosition: false,
    crs: 'EPSG:4326',
    heightType: 'Ellipsoidal'
}, action) {
    switch (action.type) {
    case SHOW_CAMERA_POSITION:
        return {
            ...state,
            showCameraPosition: true
        };
    case HIDE_CAMERA_POSITION:
        return {
            ...state,
            showCameraPosition: false
        };
    case CHANGE_CAMERA_POSITION_CRS:
        return {
            ...state,
            crs: action.crs
        };
    case CHANGE_CAMERA_POSITION_HEIGHT_TYPE:
        return {
            ...state,
            heightType: action.heightType
        };
    default:
        return state;
    }
}

export default cameraPosition;
