/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { timeSeriesPlots } from "../../../actions/layers";

export const CHANGE_TRACE_COLOR = "TIME_SERIES_PLOTS:CHANGE_TRACE_COLOR";
export const CHANGE_AGGREGATE_FUNCTION = "TIME_SERIES_PLOTS:CHANGE_AGGREGATE_FUNCTION";
export const CHANGE_SELECTION_NAME = "TIME_SERIES_PLOTS:CHANGE_SELECTION_NAME";
export const CLEAR_ALL_SELECTIONS = "TIME_SERIES_PLOTS:CLEAR_ALL_SELECTIONS";
export const TEAR_DOWN = "TIME_SERIES_PLOTS:TEAR_DOWN";
export const SETUP = "TIME_SERIES_PLOTS:SETUP";
export const SET_CURRENT_SELECTION = "TIME_SERIES_PLOTS:SET_CURRENT_SELECTION";
export const STORE_TIME_SERIES_FEATURES_IDS = "TIME_SERIES_PLOTS:STORE_TIME_SERIES_FEATURES_IDS";
export const STORE_TIME_SERIES_CHART_DATA = "TIME_SERIES_PLOTS:STORE_TIME_SERIES_CHART_DATA";
export const UPDATE_TIME_SERIES_CHART_DATA = "TIME_SERIES_PLOTS:UPDATE_TIME_SERIES_CHART_DATA";
export const TOGGLE_SELECTION = "TIME_SERIES_PLOTS:TOGGLE_SELECTION";
export const REMOVE_TABLE_SELECTION_ROW = "TIME_SERIES_PLOTS:REMOVE_TABLE_SELECTION_ROW";

export const changeAggregateFunction = (selectionId, aggregateFunction) => {
    return {
        type: CHANGE_AGGREGATE_FUNCTION,
        selectionId,
        aggregateFunction
    }
}

export const clearAllSelections = () => {
    return {
        type: CLEAR_ALL_SELECTIONS
    }
}

export const changeSelectionName = (selectionId, selectionName) => {
    return {
        type: CHANGE_SELECTION_NAME,
        selectionId,
        selectionName
    }
}

export const changeTraceColor = (selectionId, color) => {
    return {
        type: CHANGE_TRACE_COLOR,
        selectionId,
        color
    }
}

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

export const storeTimeSeriesFeaturesIds = (selectionId, selectionGeometry = {}, selectionName, selectionType, layerName, featuresIds) => ({
    type: STORE_TIME_SERIES_FEATURES_IDS,
    selectionId,
    selectionGeometry,
    selectionName,
    selectionType,
    layerName,
    featuresIds,
});

export const storeTimeSeriesChartData = (
    selectionId,
    selectionGeometry,
    selectionName,
    selectionType,
    aggregateFunctionLabel,
    aggregateFunctionOption,
    aggregationAttribute,
    groupByAttributes,
    layerName,
    featuresIds,
    chartData, 
    traceColor
) => ({
    type: STORE_TIME_SERIES_CHART_DATA,
    selectionId,
    selectionGeometry,
    selectionName,
    selectionType,
    aggregateFunctionLabel,
    aggregateFunctionOption,
    aggregationAttribute,
    groupByAttributes,
    layerName,
    featuresIds,
    chartData,
    traceColor
});

export const updateTimeSeriesChartData = (selectionId, chartData) => ({
    type: UPDATE_TIME_SERIES_CHART_DATA,
    selectionId,
    chartData
});

export const setCurrentFeaturesSelectionIndex = (index) => ({
    type: SET_CURRENT_SELECTION,
    index
});

export const removeTableSelectionRow = (selectionId) => ({
    type: REMOVE_TABLE_SELECTION_ROW,
    selectionId
});