/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const {get} = require('lodash');

/**
 * selects mapinfo state
 * @name mapinfo
 * @memberof selectors
 * @static
 */

 /**
  * Get mapinfo requests from state
  * @function
  * @memberof selectors.mapinfo
  * @param  {object} state the state
  * @return {object} the mapinfo requests
  */
const mapInfoRequestsSelector = state => get(state, "mapInfo.requests") || [];

/**
 * selects generalInfoFormat from state
 * @memberof selectors.mapinfo
 * @param  {object} state the state
 * @return {string}       the maptype in the state
 */
const generalInfoFormatSelector = (state) => get(state, "mapInfo.infoFormat", "text/plain");

module.exports = {
    generalInfoFormatSelector,
    mapInfoRequestsSelector
};
