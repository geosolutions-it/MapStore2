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
    SET_ITINERARY_LOADING
} from '../actions/itinerary';

/**
 * Reducer for itinerary search functionality
 * Manages loading state, search results, and error state
 */
const itinerary = (state = {
    loading: [],
    results: [],
    error: null
}, action) => {
    switch (action.type) {
    case SEARCH_LOADING:
        const loading = [...state.loading];
        loading[action.index] = action.loading;
        return {
            ...state,
            loading,
            // Clear error when starting a new search
            ...(action.loading && { error: null })
        };

    case SEARCH_RESULTS_LOADED:
        return {
            ...state,
            results: action.results,
            error: null
        };

    case SEARCH_ERROR:
        return {
            ...state,
            error: action.error,
            results: []
        };
    case UPDATE_LOCATIONS:
        return {
            ...state,
            locations: action.locations
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
