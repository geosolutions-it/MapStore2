/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const CHANGE_CAMERA_POSITION_CRS = 'CHANGE_CAMERA_POSITION_CRS';
export const CHANGE_CAMERA_POSITION_HEIGHT_TYPE = 'CHANGE_CAMERA_POSITION_HEIGHT_TYPE';
export const SHOW_CAMERA_POSITION = 'SHOW_CAMERA_POSITION';
export const HIDE_CAMERA_POSITION = 'HIDE_CAMERA_POSITION';

/**
 * Change the camera position coordinate reference system
 * @param {string} crs the coordinate reference system code (e.g. 'EPSG:4326')
 * @return {object} of type `CHANGE_CAMERA_POSITION_CRS` with crs
 */
export function changeCameraPositionCrs(crs) {
    return {
        type: CHANGE_CAMERA_POSITION_CRS,
        crs
    };
}

/**
 * Change the camera position height type
 * @param {string} heightType the height type (e.g. 'Ellipsoidal' or 'MSL')
 * @return {object} of type `CHANGE_CAMERA_POSITION_HEIGHT_TYPE` with heightType
 */
export function changeCameraPositionHeightType(heightType) {
    return {
        type: CHANGE_CAMERA_POSITION_HEIGHT_TYPE,
        heightType
    };
}

/**
 * Show the camera position component
 * @return {object} of type `SHOW_CAMERA_POSITION`
 */
export function showCameraPosition() {
    return {
        type: SHOW_CAMERA_POSITION
    };
}

/**
 * Hide the camera position component
 * @return {object} of type `HIDE_CAMERA_POSITION`
 */
export function hideCameraPosition() {
    return {
        type: HIDE_CAMERA_POSITION
    };
}
