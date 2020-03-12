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
const searchTextSelector = state => state && state.maps && state.maps.searchText;
const searchParamsSelector = state => ({start: get(state, 'maps.start'), limit: get(state, 'maps.limit')});
const searchFilterSelector = state => state && state.maps && state.maps.searchFilter;
const contextsSelector = state => state && state.maps && state.maps.contexts;
const loadingSelector = state => state && state.maps && state.maps.loading;
const loadFlagsSelector = state => state && state.maps && state.maps.loadFlags;
/**
 * Get flag for enable/disable of the map card details
 * @function
 * @memberof selectors.map
 * @param  {object} state the state
 * @return {boolean} showMapDetails flag for the map card details
 */
const showMapDetailsSelector = (state) => get(state, "maps.showMapDetails");

module.exports = {
    mapNameSelector,
    mapFromIdSelector,
    showMapDetailsSelector,
    mapsResultsSelector,
    totalCountSelector,
    mapMetadataSelector,
    isMapsLastPageSelector,
    mapDescriptionSelector,
    mapDetailsUriFromIdSelector,
    mapPermissionsFromIdSelector,
    mapThumbnailsUriFromIdSelector,
    searchTextSelector,
    searchParamsSelector,
    searchFilterSelector,
    contextsSelector,
    loadingSelector,
    loadFlagsSelector
};
