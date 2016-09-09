/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {MAPS_LIST_LOADED, MAPS_LIST_LOADING, MAPS_LIST_LOAD_ERROR, MAP_CREATED, MAP_UPDATING, MAP_UPDATED, MAP_DELETING, MAP_DELETED, ATTRIBUTE_UPDATED, SAVE_MAP, PERMISSIONS_UPDATED, THUMBNAIL_ERROR, RESET_UPDATING} = require('../actions/maps');
const MAP_TYPE_CHANGED = "MAP_TYPE_CHANGED"; // NOTE: this is from home action in product. move to maps actions when finished;
const assign = require('object-assign');
function maps(state = {
    mapType: "openlayers",
    enabled: false,
    errors: [] }, action) {
    switch (action.type) {
        case MAP_TYPE_CHANGED: {
            return assign({}, state, {
                mapType: action.type
            });
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
                return assign({}, action.maps, {
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
            let newMaps = (state.results === "" ? [] : [...state.results] );

            for (let i = 0; i < newMaps.length; i++) {
                if (newMaps[i].id && newMaps[i].id === action.resourceId ) {
                    newMaps[i] = assign({}, newMaps[i], {updating: true});
                }
            }
            return assign({}, state, {results: newMaps});
        }
        case MAP_UPDATED: {
            let newMaps = (state.results === "" ? [] : [...state.results] );

            for (let i = 0; i < newMaps.length; i++) {
                if (newMaps[i].id && newMaps[i].id === action.resourceId ) {
                    newMaps[i] = assign({}, newMaps[i], {description: action.newDescription, name: action.newName, updating: false});
                }
            }
            return assign({}, state, {results: newMaps});
        }
        case ATTRIBUTE_UPDATED: {
            let newMaps = (state.results === "" ? [] : [...state.results] );
            for (let i = 0; i < newMaps.length; i++) {
                if (newMaps[i].id && newMaps[i].id === action.resourceId) {
                    newMaps[i] = assign({}, newMaps[i], {[action.name]: decodeURIComponent(action.value), updating: false, loadingError: action.error ? action.error : null}); // TODO remove decodeURIComponent to reuse this reducer!!!
                }
            }
            return assign({}, state, {results: newMaps});
        }
        case PERMISSIONS_UPDATED: {
            let newMaps = (state.results === "" ? [] : [...state.results] );
            for (let i = 0; i < newMaps.length; i++) {
                if (newMaps[i].id && newMaps[i].id === action.resourceId) {
                    newMaps[i] = assign({}, newMaps[i], { loadingError: action.error ? action.error : null});
                }
            }
            return assign({}, state, {results: newMaps});
        }
        case MAP_DELETING: {
            let newMaps = (state.results === "" ? [] : [...state.results] );

            for (let i = 0; i < newMaps.length; i++) {
                if (newMaps[i].id && newMaps[i].id === action.resourceId ) {
                    newMaps[i] = assign({}, newMaps[i], {deleting: true});
                }
            }
            return assign({}, state, {results: newMaps});
        }
        case MAP_DELETED: {
            let newMaps = (state.results === "" ? [] : [...state.results] );
            let newMapsState = {
                results: newMaps.filter(function(el) {
                    return el.id && el.id !== action.resourceId;
                }),
                totalCount: state.totalCount - 1
            };

            return assign({}, state, newMapsState);
        }
        case MAP_CREATED: {
            let newMaps = (state.results === "" ? [] : [...state.results] );
            let newMapsState = {
                results: [...newMaps, action.metadata],
                totalCount: state.totalCount + 1
            };
            return assign({}, state, newMapsState);
        }
        case SAVE_MAP: {
            let newMaps = (state.results === "" ? [] : [...state.results] );

            for (let i = 0; i < newMaps.length; i++) {
                if (newMaps[i].id && newMaps[i].id === action.resourceId ) {
                    newMaps[i] = assign({}, newMaps[i], {files: action.map.files, errors: action.map.errors, newThumbnail: action.map.newThumbnail, thumbnailError: action.map.thumbnailError, thumbnail: action.map.thumbnail});
                }
            }
            return assign({}, state, {results: newMaps});
        }
        case THUMBNAIL_ERROR: {
            let newMaps = (state.results === "" ? [] : [...state.results] );

            for (let i = 0; i < newMaps.length; i++) {
                if (newMaps[i].id && newMaps[i].id === action.resourceId ) {
                    newMaps[i] = assign({}, newMaps[i], {updating: false});
                }
            }
            return assign({}, state, {results: newMaps});
        }
        case RESET_UPDATING: {
            let newMaps = (state.results === "" ? [] : [...state.results] );

            for (let i = 0; i < newMaps.length; i++) {
                if (newMaps[i].id && newMaps[i].id === action.resourceId ) {
                    newMaps[i] = assign({}, newMaps[i], {updating: false});
                }
            }
            return assign({}, state, {results: newMaps});
        }
        default:
            return state;
    }
}

module.exports = maps;
