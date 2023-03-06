/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import {
    MapLibraries,
    getVisualizationModeFromMapLibrary,
    VisualizationModes
} from '../utils/MapTypeUtils';

/**
 * selects maptype state
 * @name maptype
 * @memberof selectors
 * @static
 */

/**
 * selects maptype from state
 * @memberof selectors.maptype
 * @param  {object} state the state
 * @return {string}       the maptype in the state
 */
export const mapTypeSelector = (state) => state?.maptype?.mapType || MapLibraries.OPENLAYERS;
export const mapTypeLoadedSelector = (state) => state?.maptype?.loaded;

export const visualizationModeSelector = (state) => getVisualizationModeFromMapLibrary(mapTypeSelector(state));

/**
 * Check if the mapType is cesium
 * @function
 * @memberof selectors.maptype
 * @param  {object} state the state
 * @return {boolean}
 */
export const isCesium = state => mapTypeSelector(state) === MapLibraries.CESIUM;
export const isLeaflet = state => mapTypeSelector(state) === MapLibraries.LEAFLET;
export const isOpenlayers = state => mapTypeSelector(state) === MapLibraries.OPENLAYERS;


export const is3DMode = state => visualizationModeSelector(state) === VisualizationModes._3D;
export const is2DMode = state => visualizationModeSelector(state) === VisualizationModes._2D;
