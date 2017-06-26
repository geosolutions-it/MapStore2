/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {MAP_TYPE_CHANGED} = require('../actions/maptype');
const {UPDATE_LAST_2D_MAPTYPE} = require('../actions/globeswitcher');
/**
 * state for globeswitcher tooltip. holds the last 2d mapType.
 * @memberof reducers
 * @param  {Object} [state={last2dMapType: "leaflet"}]   the state
 * @param  {action} action                 the actions (receives MAP_TYPE_CHANGED and UPDATE_LAST_2D_MAPTYPE)
 * @return {Object}                        the new state
 * @example
 * {
 *  last2dMapType: "leaflet"
 * }
 */
function globeswitcher(state = {last2dMapType: "leaflet"}, action) {
    switch (action.type) {
    case MAP_TYPE_CHANGED:
    case UPDATE_LAST_2D_MAPTYPE:
        if (action.mapType && action.mapType !== "cesium" && action.mapType !== state.last2dMapType) {
            return {last2dMapType: action.mapType};
        }
        return state;
    default:
        return state;
    }
}

module.exports = globeswitcher;
