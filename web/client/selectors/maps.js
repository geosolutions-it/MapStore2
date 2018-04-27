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
const totalCountSelector = state => get(state, "maps.totalCount");
const mapFromIdSelector = (state, id) => find(mapsResultsSelector(state), m => m.id === id);
const mapNameSelector = (state, id) => mapFromIdSelector(state, id) && mapFromIdSelector(state, id).name || "";
const mapMetadataSelector = (state) => get(state, "maps.metadata", {});
const isMapsLastPageSelector = (state) => state && state.maps && state.maps.totalCount === state.maps.start;
const mapDescriptionSelector = (state, id) => mapFromIdSelector(state, id) && mapFromIdSelector(state, id).description || "";
const mapDetailsUriFromIdSelector = (state, id) => mapFromIdSelector(state, id) && mapFromIdSelector(state, id).details || "";
const mapPermissionsFromIdSelector = (state, id) => mapFromIdSelector(state, id) && mapFromIdSelector(state, id).permissions || "";
const mapThumbnailsUriFromIdSelector = (state, id) => mapFromIdSelector(state, id) && mapFromIdSelector(state, id).thumbnail || "";

module.exports = {
    mapNameSelector,
    mapFromIdSelector,
    mapsResultsSelector,
    totalCountSelector,
    mapMetadataSelector,
    isMapsLastPageSelector,
    mapDescriptionSelector,
    mapDetailsUriFromIdSelector,
    mapPermissionsFromIdSelector,
    mapThumbnailsUriFromIdSelector
};
