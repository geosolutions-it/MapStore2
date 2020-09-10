/*
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
    MAPS_LIST_LOADED, MAPS_LIST_LOADING, MAPS_LIST_LOAD_ERROR, MAP_CREATED, MAP_ERROR, MAP_UPDATING,
    MAP_DELETING, ATTRIBUTE_UPDATED, PERMISSIONS_LIST_LOADING,
    THUMBNAIL_ERROR, UPDATE_DETAILS,
    MAPS_SEARCH_TEXT_CHANGED, SEARCH_FILTER_CHANGED, SET_SEARCH_FILTER, SET_CONTEXTS, LOADING, METADATA_CHANGED,
    SHOW_DETAILS} = require('../actions/maps');
const assign = require('object-assign');
const {isNil} = require('lodash');
/**
 * Manages the state of the maps list search with it's results
 * The properties represent the shape of the state
 * @prop {boolan} loading loading state
 * @prop {string} searchText the text used for search (or while digiting)
 * @prop {number} start index for pagination for the current request
 * @prop {number} limit number of results for the current request
 * @prop {number} totalCount the number of results that match the last search on the server
 * @prop {array}  results the results
 * @prop {boolean} success the status of the last request
 * @prop {array} errors the errors happended
 *
 * @example
 * {
 *   maps: {
 *     mapType: 'leaflet',
 *     enabled: false,
 *     errors: [],
 *     searchText: 'test',
 *     loading: false,
 *     start: 0,
 *     limit: 12,
 *     success: true,
 *     totalCount: 1,
 *     results: [
 *       {
 *         updating: true, // only when updating
 *         deleting: true, // only when deleting
 *         canDelete: true,
 *         canEdit: true,
 *         canCopy: true,
 *         creation: '2017-01-16 12:16:09.538',
 *         lastUpdate: '2017-03-17 11:51:34.428',
 *         description: 'Simple map to test WFS search capabilities',
 *         id: 1740,
 *         name: 'WFS Test Map',
 *         thumbnail: '%2Fmapstore%2Frest%2Fgeostore%2Fdata%2F1744%2Fraw%3Fdecode%3Ddatauri',
 *         owner: 'admin'
 *       }
 *     ]
 *   }
 * }
 *}
 * @memberof reducers
 */
function maps(state = {
    enabled: false,
    showMapDetails: true,
    errors: [],
    searchFilter: {},
    searchText: "",
    results: ""}, action) {
    switch (action.type) {
    case MAPS_SEARCH_TEXT_CHANGED: {
        return assign({}, state, {
            searchText: action.text
        });
    }
    case SEARCH_FILTER_CHANGED: {
        return assign({}, state, {
            searchFilter: {
                ...state.searchFilter,
                [action.filter]: action.filterData
            }
        });
    }
    case SET_SEARCH_FILTER: {
        return assign({}, state, {searchFilter: action.searchFilter});
    }
    case SET_CONTEXTS: {
        return assign({}, state, {contexts: action.contexts});
    }
    case LOADING: {
        return assign({}, state, {
            loading: action.value,
            loadFlags: {
                ...(state.loadFlags || {}),
                ...(action.name !== 'loading' ? {[action.name]: action.value} : {})
            }
        });
    }
    case METADATA_CHANGED: {
        return assign({}, state, {
            metadata: assign({}, state.metadata, {[action.prop]: action.value })
        });
    }
    case SHOW_DETAILS: {
        return assign({}, state, {showMapDetails: action.showMapDetails});
    }
    case MAPS_LIST_LOADING:
        return assign({}, state, {
            loading: true,
            start: action.params && action.params.start,
            limit: action.params && action.params.limit,
            searchText: action.searchText
        });
    case MAPS_LIST_LOADED:
        if (action.maps && action.maps.results && Array.isArray(action.maps.results)) {
            return assign({}, state, action.maps, {
                loading: false,
                start: action.params && action.params.start,
                limit: action.params && action.params.limit,
                searchText: action.searchText
            });
        }
        let results = action.maps.results !== "" ? [action.maps.results] : [];
        return assign({}, state, action.maps, {results, loading: false});
    case MAPS_LIST_LOAD_ERROR:
        return {
            loadingError: action.error
        };
    case MAP_UPDATING: {
        let newMaps = state.results === "" || isNil(state.results) ? [] : [...state.results];

        for (let i = 0; i < newMaps.length; i++) {
            if (newMaps[i].id && newMaps[i].id === action.resourceId ) {
                newMaps[i] = assign({}, newMaps[i], {updating: true});
            }
        }
        return assign({}, state, {results: newMaps});
    }
    case ATTRIBUTE_UPDATED: {
        let newMaps = state.results === "" ? [] : [...state.results];
        for (let i = 0; i < newMaps.length; i++) {
            if (newMaps[i].id && newMaps[i].id === action.resourceId) {
                // this decode is for backward compatibility with old linked resources`rest%2Fgeostore%2Fdata%2F2%2Fraw%3Fdecode%3Ddatauri` not needed for new ones `rest/geostore/data/2/raw?decode=datauri`
                newMaps[i] = assign({}, newMaps[i], {[action.name]: decodeURIComponent(action.value), updating: false, loadingError: action.error ? action.error : null});
            }
        }
        return assign({}, state, {results: newMaps});
    }
    case MAP_DELETING: {
        let newMaps = state.results === "" ? [] : [...state.results];

        for (let i = 0; i < newMaps.length; i++) {
            if (newMaps[i].id && newMaps[i].id === action.resourceId ) {
                newMaps[i] = assign({}, newMaps[i], {deleting: true});
            }
        }
        return assign({}, state, {results: newMaps});
    }

    case MAP_CREATED: {
        let newMaps = state.results === "" ? [] : [...state.results];
        let newMapsState = {
            results: [...newMaps, action.metadata],
            totalCount: state.totalCount + 1
        };
        return assign({}, state, newMapsState);
    }
    case THUMBNAIL_ERROR: case MAP_ERROR: {
        let newMaps = state.results === "" ? [] : [...state.results];

        for (let i = 0; i < newMaps.length; i++) {
            if (newMaps[i].id && newMaps[i].id === action.resourceId ) {
                newMaps[i] = assign({}, newMaps[i], {updating: false});
            }
        }
        return assign({}, state, {results: newMaps});
    }
    case PERMISSIONS_LIST_LOADING: {
        let newMaps = state.results === "" ? [] : [...state.results];
        // TODO: Add the fix for GeoStore single-item arrays
        let newState = assign({}, state, {
            results: newMaps.map(function(map) {
                if (map.id === action.mapId) {
                    return assign({}, map, {permissionLoading: true});
                }
                return map;
            })
        }
        );
        return newState;
    }
    case UPDATE_DETAILS: {
        return {...state, detailsText: action.detailsText};
    }
    default:
        return state;
    }
}

module.exports = maps;
