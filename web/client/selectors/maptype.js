/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import { get } from 'lodash';

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
export const mapTypeSelector = (state) => state && state.maptype && state.maptype.mapType || 'leaflet';
export const mapTypeLoadedSelector = (state) => state && state.maptype && state.maptype.loaded;

/**
 * Check if the mapType is cesium
 * @function
 * @memberof selectors.maptype
 * @param  {object} state the state
 * @return {boolean}
 */
export const isCesium = state => mapTypeSelector(state) === "cesium";
export const isLeaflet = state => mapTypeSelector(state) === "leaflet";
export const isOpenlayers = state => mapTypeSelector(state) === "openlayers";

export const last2dMapTypeSelector = state => get(state, "maptype.last2dMapType") || 'openlayers';
