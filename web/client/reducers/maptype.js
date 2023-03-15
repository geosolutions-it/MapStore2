/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MAP_TYPE_CHANGED, VISUALIZATION_MODE_CHANGED } from '../actions/maptype';
import { MAP_PLUGIN_LOAD } from '../actions/map';
import { MAP_CONFIG_LOADED } from '../actions/config';

import {
    getMapLibraryFromVisualizationMode
} from '../utils/MapTypeUtils';

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
function maptype(state = {
    mapType: getMapLibraryFromVisualizationMode()
}, action) {
    switch (action.type) {
    case MAP_CONFIG_LOADED:
        const visualizationMode = action?.config?.map?.visualizationMode;
        return {
            ...state,
            mapType: getMapLibraryFromVisualizationMode(visualizationMode)
        };
    case MAP_TYPE_CHANGED:
        return {
            ...state,
            mapType: action.mapType
        };
    case VISUALIZATION_MODE_CHANGED:
        return {
            ...state,
            mapType: getMapLibraryFromVisualizationMode(action.visualizationMode)
        };
    case MAP_PLUGIN_LOAD:
        return {
            ...state,
            loaded: {
                ...state.loaded,
                [action.mapType]: action.loaded
            }
        };
    default:
        return state;
    }
}

export default maptype;
