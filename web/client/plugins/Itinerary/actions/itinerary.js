/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SEARCH_BY_LOCATION_NAME = "ITINERARY:SEARCH_BY_LOCATION_NAME";
export const SEARCH_LOADING = "ITINERARY:SEARCH_LOADING";
export const SEARCH_RESULTS_LOADED = "ITINERARY:SEARCH_RESULTS_LOADED";
export const SEARCH_ERROR = "ITINERARY:SEARCH_ERROR";
export const SELECT_LOCATION_FROM_MAP = "ITINERARY:SELECT_LOCATION_FROM_MAP";
export const UPDATE_LOCATIONS = "ITINERARY:UPDATE_LOCATIONS";
export const TRIGGER_ITINERARY_RUN = "ITINERARY:TRIGGER_ITINERARY_RUN";
export const SET_ITINERARY_DATA = "ITINERARY:SET_ITINERARY_DATA";
export const SET_ITINERARY_LOADING = "ITINERARY:SET_ITINERARY_LOADING";
export const SET_ITINERARY_ERROR = "ITINERARY:SET_ITINERARY_ERROR";
export const ADD_AS_LAYER = "ITINERARY:ADD_AS_LAYER";
export const RESET_ITINERARY = "ITINERARY:RESET_ITINERARY";
export const INIT_PLUGIN = "ITINERARY:INIT_PLUGIN";

/**
 * Searches for a location by name
 * @param {number} index - The index of the location
 * @param {object} location - The location to search for
 * @returns {object} The action to search for a location by name
 */
export const searchByLocationNameByIndex = (location, index) => {
    return {
        type: SEARCH_BY_LOCATION_NAME,
        location,
        index
    };
};

/**
 * Sets the search loading state
 * @param {boolean} loading - The loading state
 * @param {number} index - The index of the location
 * @returns {object} The action to set the search loading state
 */
export const setSearchLoadingByIndex = (loading, index) => {
    return {
        type: SEARCH_LOADING,
        index,
        loading
    };
};

/**
 * Sets the search results
 * @param {object[]} results - The search results
 * @returns {object} The action to set the search results
 */
export const searchResultsLoaded = (results) => {
    return {
        type: SEARCH_RESULTS_LOADED,
        results
    };
};

/**
 * Sets the search error
 * @param {object} error - The error
 * @returns {object} The action to set the search error
 */
export const searchError = (error) => {
    return {
        type: SEARCH_ERROR,
        error
    };
};

/**
 * Selects a location from the map
 * @param {number} index - The index of the location
 * @returns {object} The action to select a location from the map
 */
export const selectLocationFromMap = (index) => {
    return {
        type: SELECT_LOCATION_FROM_MAP,
        index
    };
};

/**
 * Updates the locations
 * @param {object[]} locations - The locations
 * @returns {object} The action to update the locations
 */
export const updateLocations = (locations) => {
    return {
        type: UPDATE_LOCATIONS,
        locations
    };
};

/**
 * Triggers the itinerary run
 * @param {object} itinerary - The itinerary
 * @returns {object} The action to trigger the itinerary run
 */
export const triggerItineraryRun = (itinerary) => {
    return {
        type: TRIGGER_ITINERARY_RUN,
        itinerary
    };
};

/**
 * Sets the itinerary data
 * @param {object} data - The itinerary data
 * @returns {object} The action to set the itinerary data
 */
export const setItinerary = (data) => {
    return {
        type: SET_ITINERARY_DATA,
        data
    };
};

/**
 * Sets the itinerary loading state
 * @param {boolean} loading - The loading state
 * @returns {object} The action to set the itinerary loading state
 */
export const setItineraryLoading = (loading) => {
    return {
        type: SET_ITINERARY_LOADING,
        loading
    };
};

/**
 * Sets the itinerary error
 * @param {object} error - The error
 * @returns {object} The action to set the itinerary error
 */
export const setItineraryError = (error) => {
    return {
        type: SET_ITINERARY_ERROR,
        error
    };
};

/**
 * Adds the itinerary as a layer
 * @param {object} features - The features of the itinerary
 * @param {object} style - The style of the itinerary
 * @returns {object} The action to add the itinerary as a layer
 */
export const addAsLayer = ({ features, style }) => {
    return {
        type: ADD_AS_LAYER,
        features,
        style
    };
};

/**
 * Resets the itinerary
 * @returns {object} The action to reset the itinerary
 */
export const resetItinerary = () => {
    return {
        type: RESET_ITINERARY
    };
};

/**
 * Initializes the plugin
 * @param {object} config - The config
 * @returns {object} The action to initialize the plugin
 */
export const initPlugin = (config) => {
    return {
        type: INIT_PLUGIN,
        config
    };
};
