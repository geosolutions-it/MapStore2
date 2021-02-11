/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MAP_TYPE_CHANGED, UPDATE_LAST_2D_MAPTYPE } from '../actions/maptype';

/**
 * stores state for the mapType to use (typically one of leaflet, openlayers, cesium... )
 * @memberof reducers
 * @param  {Object} [state={mapType: "leaflet"}] the initial state
 * @param  {} action  the action gets `MAP_TYPE_CHANGED`
 * @return {Object} the new state
 * @example
 * {
 *  mapType: "leaflet"
 * }
 */
function maptype(state = { mapType: "leaflet" }, action) {
    switch (action.type) {
    case MAP_TYPE_CHANGED:
        return {
            ...state,
            mapType: action.mapType,
            last2dMapType: action.mapType && action.mapType !== "cesium"
                ? action.mapType
                : state.mapType !== 'cesium'
                    ? state.mapType
                    : state.last2dMapType
        };
    case UPDATE_LAST_2D_MAPTYPE:
        if (action.mapType && action.mapType !== "cesium" && action.mapType !== state.last2dMapType) {
            return {
                ...state,
                last2dMapType: action.mapType
            };
        }
        return state;
    default:
        return state;
    }
}

export default maptype;
