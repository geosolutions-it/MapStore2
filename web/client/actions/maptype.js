/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const MAP_TYPE_CHANGED = 'MAP_TYPE_CHANGED';
export const VISUALIZATION_MODE_CHANGED = 'MAP_TYPE:VISUALIZATION_MODE_CHANGED';

/**
 * changes the map type
 * @deprecated
 * @memberof actions.maptype
 * @param  {string} mapType the mapType.
 * @return {action} the action of type `MAP_TYPE_CHANGED` with mapType
 */
export function changeMapType(mapType) {
    return {
        type: MAP_TYPE_CHANGED,
        mapType
    };
}
/**
 * changes the visualization mode
 * @memberof actions.maptype
 * @param  {string} visualizationMode eg: 2D or 3D.
 * @return {action} the action of type `VISUALIZATION_MODE_CHANGED` with visualizationMode
 */
export function changeVisualizationMode(visualizationMode) {
    return {
        type: VISUALIZATION_MODE_CHANGED,
        visualizationMode
    };
}
/**
 * Actions for map type management.Allow to manage the default map type.
 * @name actions.maptype
 */
