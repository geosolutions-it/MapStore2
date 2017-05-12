/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

/**
 * selects maptype from state
 * @memberof selectors.maptype
 * @param  {object} state the state
 * @return {string}       the maptype in the state
 */
const mapTypeSelector = (state) => state && state.maptype && state.maptype.mapType;

/**
 * Check if the mapType is cesium
 * @function
 * @memberof selectors.maptype
 * @param  {object} state the state
 * @return {boolean}
 */
const isCesium = state => mapTypeSelector(state) === "cesium";

module.exports = {
    mapTypeSelector,
    isCesium
};
