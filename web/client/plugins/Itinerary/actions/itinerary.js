/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import get from "lodash/get";
import { error as errorNotification } from "../../../actions/notifications";

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

export const searchByLocationNameByIndex = (index, locationName) => {
    return {
        type: SEARCH_BY_LOCATION_NAME,
        locationName,
        index
    };
};

export const setSearchLoadingByIndex = (loading, index) => {
    return {
        type: SEARCH_LOADING,
        index,
        loading
    };
};

export const searchResultsLoaded = (results) => {
    return {
        type: SEARCH_RESULTS_LOADED,
        results
    };
};

export const searchError = (error) => {
    return {
        type: SEARCH_ERROR,
        error
    };
};

export const selectLocationFromMap = (index) => {
    return {
        type: SELECT_LOCATION_FROM_MAP,
        index
    };
};

export const updateLocations = (locations) => {
    return {
        type: UPDATE_LOCATIONS,
        locations
    };
};

export const triggerItineraryRun = (itinerary) => {
    return {
        type: TRIGGER_ITINERARY_RUN,
        itinerary
    };
};

export const setItinerary = (data) => {
    return {
        type: SET_ITINERARY_DATA,
        data
    };
};

export const setItineraryLoading = (loading) => {
    return {
        type: SET_ITINERARY_LOADING,
        loading
    };
};

export const setItineraryError = (error) => {
    const message = get(error, 'data.message',
        "itinerary.notification.errorItineraryError"
    );
    return errorNotification({
        title: "itinerary.notification.error",
        message,
        autoDismiss: 6,
        position: "tc"
    });
};

export const addAsLayer = ({ features, style }) => {
    return {
        type: ADD_AS_LAYER,
        features,
        style
    };
};

export const resetItinerary = () => {
    return {
        type: RESET_ITINERARY
    };
};
