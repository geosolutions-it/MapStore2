/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    SEARCH_LOADING,
    SEARCH_RESULTS_LOADED,
    SEARCH_ERROR,
    UPDATE_LOCATIONS,
    SET_ITINERARY_DATA,
    SELECT_LOCATION_FROM_MAP,
    SET_ITINERARY_LOADING,
    INIT_PLUGIN
} from '../actions/itinerary';

/**
 * Reducer for itinerary search functionality
 * Manages loading state, search results, and error state
 */
const itinerary = (state = {
    searchLoading: [],
    searchResults: [],
    searchError: null,
    searchConfig: {}
}, action) => {
    switch (action.type) {
    case INIT_PLUGIN:
        return {
            ...state,
            ...action.config
        };
    case SEARCH_LOADING:
        const loading = [...state.searchLoading];
        loading[action.index] = action.loading;
        return {
            ...state,
            searchLoading: loading,
            // Clear error when starting a new search
            ...(action.loading && { searchError: null })
        };

    case SEARCH_RESULTS_LOADED:
        return {
            ...state,
            searchResults: action.results,
            searchError: null
        };

    case SEARCH_ERROR:
        return {
            ...state,
            searchError: action.error,
            searchResults: []
        };
    case UPDATE_LOCATIONS:
        return {
            ...state,
            locations: action.locations,
            data: null // reset itinerary data when locations are updated
        };
    case SET_ITINERARY_DATA:
        return {
            ...state,
            data: action.data
        };
    case SELECT_LOCATION_FROM_MAP:
        return {
            ...state,
            activeClickLocationIndex: action.index
        };
    case SET_ITINERARY_LOADING:
        return {
            ...state,
            itineraryLoading: action.loading
        };
    default:
        return state;
    }
};

export default itinerary;
