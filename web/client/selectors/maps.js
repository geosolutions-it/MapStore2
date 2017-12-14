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
const mapMetadataSelector = (state) => get(state, "maps.metadata", {});
const isMapsLastPageSelector = (state) => state && state.maps && state.maps.totalCount === state.maps.start;
const mapFromIdSelector = (state, id) => find(mapsResultsSelector(state), m => m.id === id);
const mapDetailsUriFromIdSelector = (state, id) => mapFromIdSelector(state, id).details || "";
const mapThumbnailsUriFromIdSelector = (state, id) => mapFromIdSelector(state, id).thumbnail || "";
const mapPermissionsFromIdSelector = (state, id) => mapFromIdSelector(state, id).permissions || "";
const mapNameSelector = (state, id) => mapFromIdSelector(state, id).name || "";
const mapDescriptionSelector = (state, id) => mapFromIdSelector(state, id).description || "";

module.exports = {
    isMapsLastPageSelector,
    mapMetadataSelector,
    mapNameSelector,
    mapDescriptionSelector,
    mapsResultsSelector,
    mapFromIdSelector,
    mapDetailsUriFromIdSelector,
    mapThumbnailsUriFromIdSelector,
    mapPermissionsFromIdSelector
};
