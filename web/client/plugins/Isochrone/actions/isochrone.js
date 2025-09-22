/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import get from "lodash/get";
import { error as errorNotification } from "../../../actions/notifications";

export const SEARCH_BY_LOCATION_NAME = "ISOCHRONE:SEARCH_BY_LOCATION_NAME";
export const SEARCH_LOADING = "ISOCHRONE:SEARCH_LOADING";
export const SEARCH_RESULTS_LOADED = "ISOCHRONE:SEARCH_RESULTS_LOADED";
export const SEARCH_ERROR = "ISOCHRONE:SEARCH_ERROR";
export const SELECT_LOCATION_FROM_MAP = "ISOCHRONE:SELECT_LOCATION_FROM_MAP";
export const UPDATE_LOCATION = "ISOCHRONE:UPDATE_LOCATION";
export const TRIGGER_ISOCHRONE_RUN = "ISOCHRONE:TRIGGER_ISOCHRONE_RUN";
export const SET_ISOCHRONE_DATA = "ISOCHRONE:SET_ISOCHRONE_DATA";
export const SET_ISOCHRONE_LOADING = "ISOCHRONE:SET_ISOCHRONE_LOADING";
export const SET_ISOCHRONE_ERROR = "ISOCHRONE:SET_ISOCHRONE_ERROR";
export const ADD_AS_LAYER = "ISOCHRONE:ADD_AS_LAYER";
export const RESET_ISOCHRONE = "ISOCHRONE:RESET_ISOCHRONE";
export const INIT_PLUGIN = "ISOCHRONE:INIT_PLUGIN";
export const DELETE_ISOCHRONE_DATA = "ISOCHRONE:DELETE_ISOCHRONE_DATA";
export const SET_CURRENT_RUN_PARAMETERS = "ISOCHRONE:SET_CURRENT_RUN_PARAMETERS";

export const searchByLocationName = (location) => {
    return {
        type: SEARCH_BY_LOCATION_NAME,
        location
    };
};

export const setSearchLoading = (loading) => {
    return {
        type: SEARCH_LOADING,
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

export const selectLocationFromMap = () => {
    return {
        type: SELECT_LOCATION_FROM_MAP
    };
};

export const updateLocation = (location) => {
    return {
        type: UPDATE_LOCATION,
        location
    };
};

export const triggerIsochroneRun = (isochrone) => {
    return {
        type: TRIGGER_ISOCHRONE_RUN,
        isochrone
    };
};

export const setIsochrone = (data) => {
    return {
        type: SET_ISOCHRONE_DATA,
        data
    };
};

export const setIsochroneLoading = (loading) => {
    return {
        type: SET_ISOCHRONE_LOADING,
        loading
    };
};

export const setIsochroneError = (error) => {
    const message = get(error, 'data.message',
        "isochrone.notification.errorIsochroneError"
    );
    return errorNotification({
        title: "isochrone.notification.error",
        message,
        autoDismiss: 6,
        position: "tc"
    });
};

export const addAsLayer = (layer) => {
    return {
        type: ADD_AS_LAYER,
        layer
    };
};

export const resetIsochrone = () => {
    return {
        type: RESET_ISOCHRONE
    };
};

export const initPlugin = (config) => {
    return {
        type: INIT_PLUGIN,
        config
    };
};

export const deleteIsochroneData = (id) => {
    return {
        type: DELETE_ISOCHRONE_DATA,
        id
    };
};

export const setCurrentRunParameters = (parameters) => {
    return {
        type: SET_CURRENT_RUN_PARAMETERS,
        parameters
    };
};
