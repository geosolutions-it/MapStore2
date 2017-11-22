/*
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const CoordinatesUtils = require('../utils/CoordinatesUtils');
const MapUtils = require('../utils/MapUtils');
const {createSelector} = require('reselect');
const {get} = require('lodash');

/**
 * selects map state
 * @name map
 * @memberof selectors
 * @static
 */

/**
 * get the current map configuration from state
 * @function
 * @memberof selectors.map
 * @param  {object} state the state
 * @return {object} the map configruation
 */
const mapSelector = (state) => state.map && state.map.present || state.map || state.config && state.config.map || null;
const projectionDefsSelector = (state) => state.localConfig && state.localConfig.projectionDefs || [];

const projectionSelector = createSelector([mapSelector], (map) => map && map.projection);
const mapIdSelector = (state) => get(state, "mapInitialConfig.mapId");

/**
 * Get the scales of the current map
 * @function
 * @memberof selectors.map
 * @param  {object} state the state
 * @return {number[]} the scales of the map
 */
const scalesSelector = createSelector(
    [projectionSelector],
    (projection) => {
        if (projection) {
            const resolutions = MapUtils.getResolutions();
            const units = CoordinatesUtils.getUnits(projection);
            const dpm = 96 * (100 / 2.54);
            return resolutions.map((resolution) => resolution * dpm * (units === 'degrees' ? 111194.87428468118 : 1));
        }
        return [];
    }
);
/**
 * Get version of the map
 * @function
 * @memberof selectors.map
 * @param  {object} state the state
 * @return {number} version of the map
 */
const mapVersionSelector = (state) => state.map && state.map.present && state.map.present.version || 1;
/**
 * Get name/titlet of the map
 * @function
 * @memberof selectors.map
 * @param  {object} state the state
 * @return {string} name/title of the map
 */
const mapNameSelector = (state) => state.map && state.map.present && state.map.present.info && state.map.present.info.name || '';

module.exports = {
    mapSelector,
    scalesSelector,
    projectionSelector,
    mapIdSelector,
    projectionDefsSelector,
    mapVersionSelector,
    mapNameSelector
};
