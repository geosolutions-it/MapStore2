/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import { find, get } from 'lodash';

/**
 * selects maps state
 * @name maps
 * @memberof selectors
 * @static
*/

export const mapsResultsSelector = (state) => get(state, "maps.results", []);
export const totalCountSelector = state => get(state, "maps.totalCount");
export const mapFromIdSelector = (state, id) => find(mapsResultsSelector(state), m => m.id === id);
export const mapNameSelector = (state, id) => mapFromIdSelector(state, id) && mapFromIdSelector(state, id).name || "";
export const mapMetadataSelector = (state) => get(state, "maps.metadata", {});
export const isMapsLastPageSelector = (state) => state && state.maps && state.maps.totalCount === state.maps.start;
export const mapDescriptionSelector = (state, id) => mapFromIdSelector(state, id) && mapFromIdSelector(state, id).description || "";
export const mapDetailsUriFromIdSelector = (state, id) => mapFromIdSelector(state, id) && mapFromIdSelector(state, id).details || "";
export const mapPermissionsFromIdSelector = (state, id) => mapFromIdSelector(state, id) && mapFromIdSelector(state, id).permissions || "";
export const mapThumbnailsUriFromIdSelector = (state, id) => mapFromIdSelector(state, id) && mapFromIdSelector(state, id).thumbnail || "";
export const searchTextSelector = state => state && state.maps && state.maps.searchText;
export const searchParamsSelector = state => ({start: get(state, 'maps.start'), limit: get(state, 'maps.limit')});
export const searchFilterSelector = state => state && state.maps && state.maps.searchFilter;
export const contextsSelector = state => state && state.maps && state.maps.contexts;
export const loadingSelector = state => state && state.maps && state.maps.loading;
export const loadFlagsSelector = state => state && state.maps && state.maps.loadFlags;
/**
 * Get flag for enable/disable of the map card details
 * @function
 * @memberof selectors.map
 * @param  {object} state the state
 * @return {boolean} showMapDetails flag for the map card details
 */
export const showMapDetailsSelector = (state) => get(state, "maps.showMapDetails");
