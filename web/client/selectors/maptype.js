/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

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
const mapTypeSelector = (state) => state && state.maptype && state.maptype.mapType || 'leaflet';

/**
 * Check if the mapType is cesium
 * @function
 * @memberof selectors.maptype
 * @param  {object} state the state
 * @return {boolean}
 */
const isCesium = state => mapTypeSelector(state) === "cesium";
const isLeaflet = state => mapTypeSelector(state) === "leaflet";
const isOpenlayers = state => mapTypeSelector(state) === "openlayers";

module.exports = {
    mapTypeSelector,
    isCesium,
    isLeaflet,
    isOpenlayers
};
