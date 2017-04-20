/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const TOGGLE_3D = "TOGGLE_3D";
const UPDATE_LAST_2D_MAPTYPE = "UPDATE_LAST_2D_MAPTYPE";
/**
 * Emitted when 3d map have to be toggled
 * @memberof actions.globeswitcher
 * @param  {boolean} enable          true for enable, false for disable
 * @return {action}                  the action of type `TOGGLE_FULLSCREEN` with enable flag and element selector.
 * ```
 * {
 *   type: TOGGLE_3D,
 *   enable
 * }
 * ```
 */
function toggle3d(enable, originalMapType) {
    return {
        type: TOGGLE_3D,
        enable,
        originalMapType
    };
}
/**
 * Saves the last 2d map
 * @memberof actions.globeswitcher
 * @param  {string} mapType last maptype
 * @return {object}         action
 * ```
 * {
 *   type: MAPTYPE_2D_SELECTED,
 *   mapType
 * }
 * ```
 */
function updateLast2dMapType(mapType) {
    return {
        type: UPDATE_LAST_2D_MAPTYPE,
        mapType
    };
}
/**
 * Actions for Globe Switcher Plugin.
 * @name actions.globeswitcher
 */
module.exports = {
    toggle3d,
    updateLast2dMapType,
    UPDATE_LAST_2D_MAPTYPE,
    TOGGLE_3D
};
