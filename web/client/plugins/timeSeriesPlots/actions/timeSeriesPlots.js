import { timeSeriesPlots } from "../../../actions/layers";

export const RESET = "TIME_SERIES_PLOTS:RESET";
export const TOGGLE_SELECTION = "TIME_SERIES_PLOTS:TOGGLE_SELECTION";
export const STORE_TIME_SERIES_FEATURES = "TIME_SERIES_PLOTS:STORE_TIME_SERIES_FEATURES";

export const reset = () => {
    return {
        type: RESET
    }
};

export const showTimeSeriesPlotsPlugin = () => {
    return (dispatch, getState) => {
        dispatch(timeSeriesPlots({
            // these values are teporarily hard coded to trigger the epic opening the plugin window
            url: 'http://localhost:8082/geoserver/wfs',
            name: 'ale:in_sar_dataset',
            id: 'ale:in_sar_dataset__6'
        }));
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

export const storeTimeSeriesFeatures = (selectionType, layerId, features) => ({
    type: STORE_TIME_SERIES_FEATURES,
    selectionType,
    layerId,
    features,
});