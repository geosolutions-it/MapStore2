/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    DELETE_ISOCHRONE_DATA,
    INIT_PLUGIN,
    RESET_ISOCHRONE,
    SEARCH_ERROR,
    SEARCH_LOADING,
    SEARCH_RESULTS_LOADED,
    SET_CURRENT_RUN_PARAMETERS,
    SET_ISOCHRONE_DATA,
    SET_ISOCHRONE_LOADING,
    UPDATE_LOCATION
} from "../actions/isochrone";

const isochrone = (state = {
    searchLoading: false,
    searchResults: [],
    searchError: null,
    location: null,
    searchConfig: {}
}, action) => {
    switch (action.type) {
    case INIT_PLUGIN:
        return {
            ...state,
            ...action.config
        };
    case SEARCH_LOADING:
        return {
            ...state,
            searchLoading: action.loading,
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
    case UPDATE_LOCATION:
        return {
            ...state,
            location: action.location
        };
    case SET_ISOCHRONE_DATA:
        const data = action.data ? [...(state?.data ?? []), action.data] : [];
        return { ...state, data };
    case SET_ISOCHRONE_LOADING:
        return {
            ...state,
            loading: action.loading
        };
    case DELETE_ISOCHRONE_DATA:
        return {
            ...state,
            data: (state.data ?? []).filter((_data) => _data.id !== action.id)
        };
    case SET_CURRENT_RUN_PARAMETERS:
        return {
            ...state,
            currentRunParameters: action.parameters
        };
    case RESET_ISOCHRONE:
        return {
            ...state,
            searchError: null
        };
    default:
        return state;
    }
};

export default isochrone;
