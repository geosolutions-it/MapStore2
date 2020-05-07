/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const {get} = require('lodash');
/**
 * Checks for an error when a map is accessed
 * @function
 * @memberof selectors.mapInitialConfig
 * @param  {object} state the state
 * @return {object} error object
 */
const hasMapAccessLoadingError = (state) => get(state, "mapInitialConfig.loadingError");
const mapIdSelector = (state) => state.mapInitialConfig?.mapId;
module.exports = {
    hasMapAccessLoadingError,
    mapIdSelector
};
