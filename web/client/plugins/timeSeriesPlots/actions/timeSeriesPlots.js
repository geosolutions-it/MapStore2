/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { timeSeriesPlots } from "../../../actions/layers";

export const TEAR_DOWN = "TIME_SERIES_PLOTS:TEAR_DOWN";
export const SETUP = "TIME_SERIES_PLOTS:SETUP";
export const STORE_TIME_SERIES_FEATURES = "TIME_SERIES_PLOTS:STORE_TIME_SERIES_FEATURES";
export const TOGGLE_SELECTION = "TIME_SERIES_PLOTS:TOGGLE_SELECTION";


export const tearDown = () => {
    return {
        type: TEAR_DOWN
    }
};

export const setUp = (cfg) => {
    return {
        type: SETUP,
        cfg
    }
}

export const showTimeSeriesPlotsPlugin = () => {
    return (dispatch) => {
        dispatch(timeSeriesPlots());
    }
};

/**
 * Toggles map selection in one of the modes available
 * @param {string} selectionType type of selection (constants.SELECTION_TYPES)
 */
 export const toggleSelectionTool = (selectionType) => ({
    type: TOGGLE_SELECTION,
    selectionType
});

export const storeTimeSeriesFeatures = (selectionType, layerName, features) => ({
    type: STORE_TIME_SERIES_FEATURES,
    selectionType,
    layerName,
    features,
});