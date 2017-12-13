/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const {find, get} = require('lodash');

/**
 * selects maps state
 * @name maps
 * @memberof selectors
 * @static
 */

const mapsResultsSelector = (state) => get(state, "maps.results", []);
const mapFromIdSelector = (state, id) => find(mapsResultsSelector(state), m => m.id === id);
const mapDetailsTextFromIdSelector = (state, id) => mapFromIdSelector(state, id).detailsText || "";
const mapDetailsUriFromIdSelector = (state, id) => mapFromIdSelector(state, id).details || "";
const mapThumbnailsUriFromIdSelector = (state, id) => mapFromIdSelector(state, id).thumbnail || "";
const mapPermissionsFromIdSelector = (state, id) => mapFromIdSelector(state, id).permissions || "";

module.exports = {
    mapsResultsSelector,
    mapFromIdSelector,
    mapDetailsUriFromIdSelector,
    mapDetailsTextFromIdSelector,
    mapThumbnailsUriFromIdSelector,
    mapPermissionsFromIdSelector
};
