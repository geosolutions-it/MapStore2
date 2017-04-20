/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const MAP_TYPE_CHANGED = 'MAP_TYPE_CHANGED';

/**
 * changes the map type
 * @memberof actions.maptype
 * @param  {string} mapType the mapType.
 * @return {action}         the action of type `MAP_TYPE_CHANGED` with mapType
 */
function changeMapType(mapType) {
    return {
        type: MAP_TYPE_CHANGED,
        mapType
    };
}
/**
 * Actions for map type management.Allow to manage the default map type.
 * @name actions.maptype
 */
module.exports = {MAP_TYPE_CHANGED, changeMapType};
