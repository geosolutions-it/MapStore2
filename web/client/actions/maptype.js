/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const MAP_TYPE_CHANGED = 'MAP_TYPE_CHANGED';
export const UPDATE_LAST_2D_MAPTYPE = "MAP_TYPE:UPDATE_LAST_2D_MAPTYPE";

/**
 * changes the map type
 * @memberof actions.maptype
 * @param  {string} mapType the mapType.
 * @return {action}         the action of type `MAP_TYPE_CHANGED` with mapType
 */
export function changeMapType(mapType) {
    return {
        type: MAP_TYPE_CHANGED,
        mapType
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
export function updateLast2dMapType(mapType) {
    return {
        type: UPDATE_LAST_2D_MAPTYPE,
        mapType
    };
}

/**
 * Actions for map type management.Allow to manage the default map type.
 * @name actions.maptype
 */
