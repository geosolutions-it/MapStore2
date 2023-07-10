/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
    CHECKED_WPS_AVAILABILITY,
    CHECKING_WPS_AVAILABILITY,
    ERROR_LOADING_DFT,
    SET_FEATURES,
    SET_WPS_AVAILABILITY,
    SET_SELECTED_TOOL,
    SET_FEATURE_SOURCE_LOADING,
    SET_SOURCE_LAYER_ID,
    SET_SOURCE_FEATURE_ID,
    SET_INTERSECTION_LAYER_ID
} from '../actions/geoProcessingTools';

/**
 * reducer for geoProcessingTools
 * @memberof reducers
 * @param  {Object} action                   the action
 * @return {Object}                          the new state
 *
 */
function geoProcessingTools( state = {
    selectedTool: "buffer"
}, action) {
    switch (action.type) {
    case CHECKED_WPS_AVAILABILITY:
        return {
            ...state,
            flags: {
                ...state.flags,
                checkedWPSAvailability: action.status
            }
        };
    case CHECKING_WPS_AVAILABILITY: {
        return {
            ...state,
            flags: {
                ...state.flags,
                checkingWPSAvailability: action.status
            }
        };
    }
    case ERROR_LOADING_DFT: {
        return {
            ...state,
            errorLoadingDFT: {
                [action.layerId]: true
            }
        };
    }
    case SET_FEATURES: {
        return action.data.features ? {
            ...state,
            [action.source]: {
                ...state[action.source],
                features: action.data.features || []
            }
        } : {
            ...state,
            [action.source]: {
                ...state[action.source],
                error: action.data
            }
        };
    }
    case SET_FEATURE_SOURCE_LOADING: {
        return {
            ...state,
            flags: {
                ...state.flags,
                featuresSourceLoading: action.status
            }
        };
    }
    case SET_WPS_AVAILABILITY: {
        return {
            ...state,
            flags: {
                ...state.flags,
                wpsAvailability: {
                    ...state.flags.wpsAvailability,
                    [action.layerId]: action.status
                }
            }
        };
    }
    case SET_SELECTED_TOOL: {
        return {
            ...state,
            selectedTool: action.tool
        };
    }
    case SET_SOURCE_LAYER_ID: {
        return {
            ...state,
            source: {
                ...state.source,
                layerId: action.layerId,
                features: []
            }
        };
    }
    case SET_SOURCE_FEATURE_ID: {
        return {
            ...state,
            source: {
                ...state.source,
                featureId: action.featureId
            }
        };
    }
    case SET_INTERSECTION_LAYER_ID: {
        return {
            ...state,
            intersectionLayerId: action.layerId
        };
    }
    default:
        return state;
    }
}

export default geoProcessingTools;
