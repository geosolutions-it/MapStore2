/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import find from "lodash/find";
import {
    GPT_TOOL_BUFFER,
    GPT_TOOL_INTERSECTION,
    CHECKING_WPS_AVAILABILITY,
    CHECKING_WPS_AVAILABILITY_INTERSECTION,
    ERROR_LOADING_DFT,
    INIT_PLUGIN,
    RESET,
    RUNNING_PROCESS,
    SET_BUFFER_DISTANCE,
    SET_BUFFER_DISTANCE_UOM,
    SET_BUFFER_QUADRANT_SEGMENTS,
    SET_BUFFER_CAP_STYLE,
    SET_FEATURES,
    SET_FEATURE_SOURCE_LOADING,
    SET_FEATURE_INTERSECTION_LOADING,
    SET_INVALID_LAYER,
    SET_WPS_AVAILABILITY,
    SET_SELECTED_TOOL,
    SET_SOURCE_LAYER_ID,
    SET_SOURCE_FEATURE_ID,
    SET_SOURCE_FEATURE,
    SET_INTERSECTION_LAYER_ID,
    SET_INTERSECTION_FEATURE_ID,
    SET_INTERSECTION_FEATURE,
    SET_INTERSECTION_FIRST_ATTRIBUTE,
    SET_INTERSECTION_SECOND_ATTRIBUTE,
    SET_INTERSECTION_MODE,
    SET_INTERSECTION_PERCENTAGES_ENABLED,
    SET_INTERSECTION_AREAS_ENABLED,
    SET_SELECTED_LAYER_TYPE,
    TOGGLE_HIGHLIGHT_LAYERS
} from '../actions/geoProcessing';
import {
    RESET_CONTROLS
} from '../actions/controls';
import { LOCATION_CHANGE } from 'connected-react-router';

/**
 * reducer for GeoProcessing
 * @memberof reducers
 * @param  {object} action the action
 * @return {object}        the new state
 *
 */

const initialState = {
    source: {},
    buffer: {},
    selectedLayerId: "",
    selectedLayerType: "",
    intersection: {
        intersectionMode: "INTERSECTION"
    },
    flags: {
        showHighlightLayers: true,
        isIntersectionEnabled: true,
        runningProcess: false
    }
};
function geoProcessing( state = {
    selectedTool: GPT_TOOL_BUFFER || GPT_TOOL_INTERSECTION,
    ...initialState

}, action) {
    switch (action.type) {
    case CHECKING_WPS_AVAILABILITY: {
        return {
            ...state,
            flags: {
                ...state.flags,
                checkingWPSAvailability: action.status
            }
        };
    }
    case CHECKING_WPS_AVAILABILITY_INTERSECTION: {
        return {
            ...state,
            flags: {
                ...state.flags,
                checkingWPSAvailabilityIntersection: action.status
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
    case INIT_PLUGIN: {
        return {
            ...state,
            ...action.cfg,
            cfg: action.cfg,
            buffer: {
                ...state.buffer,
                ...(action.cfg.buffer || {})
            },
            intersection: {
                ...state.intersection,
                ...(action.cfg.intersection || {})
            }
        };
    }
    case RESET: case RESET_CONTROLS: case LOCATION_CHANGE: {
        return {
            ...state,
            ...initialState,
            buffer: {
                ...(state.cfg.buffer || {}),
                ...initialState.buffer
            },
            intersection: {
                ...(state.cfg.intersection || {}),
                ...initialState.intersection
            },
            source: {
                ...initialState.source
            }
        };
    }
    case RUNNING_PROCESS: {
        return {
            ...state,
            flags: {
                ...state.flags,
                runningProcess: action.status
            }
        };
    }
    case SET_BUFFER_DISTANCE: {
        return {
            ...state,
            buffer: {
                ...state.buffer,
                distance: Number(action.distance)
            }
        };
    }
    case SET_BUFFER_DISTANCE_UOM: {
        return {
            ...state,
            buffer: {
                ...state.buffer,
                distanceUom: action.uom
            }
        };
    }
    case SET_BUFFER_QUADRANT_SEGMENTS: {
        return {
            ...state,
            buffer: {
                ...state.buffer,
                quadrantSegments: Number(action.quadrantSegments)
            }
        };
    }
    case SET_BUFFER_CAP_STYLE: {
        return {
            ...state,
            buffer: {
                ...state.buffer,
                capStyle: action.capStyle
            }
        };
    }
    case SET_FEATURES: {
        // filtering out the features with measureId because they are not the measures, the LineString for length and bering or the Polygon for the area one. We do not want to do the buffer on the point where the measure text label is stored
        return action.data.features ? {
            ...state,
            [action.source]: {
                ...state[action.source],
                features: (state[action.source].features || []).concat(action.data.features || []).filter(f => !f?.properties?.measureId),
                totalCount: action.data.totalFeatures,
                currentPage: action.nextPage
            },
            flags: {
                ...state.flags,
                isIntersectionEnabled: action.source === "source" ? !action.geometryProperty?.type?.includes("Point") : state.flags.isIntersectionEnabled
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
    case SET_FEATURE_INTERSECTION_LOADING: {
        return {
            ...state,
            flags: {
                ...state.flags,
                featuresIntersectionLoading: action.status
            }
        };
    }
    case SET_INVALID_LAYER: {
        return {
            ...state,
            flags: {
                ...state.flags,
                invalid: {
                    ...state.flags.invalid,
                    [action.layerId]: action.status
                }
            }
        };
    }
    case SET_WPS_AVAILABILITY: {
        return {
            ...state,
            flags: {
                ...state.flags,
                ...(action.source === "source" ? {
                    wpsAvailability: {
                        ...state.flags.wpsAvailability,
                        [action.layerId]: action.status
                    }
                } : {
                    wpsAvailabilityIntersection: {
                        ...state.flags.wpsAvailabilityIntersection,
                        [action.layerId]: action.status
                    }
                })

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
            selectedLayerType: !action.layerId && state.selectedLayerType === "source" ? "" : state.selectedLayerType,
            selectedLayerId: state.selectedLayerType === "source" ? action.layerId : state.selectedLayerId,
            source: {
                ...state.source,
                layerId: action.layerId,
                features: action.layerId !== state.source?.layerId ? [] : state?.source?.features,
                totalCount: action.layerId !== state.source?.layerId ? 0 : state?.source?.totalCount,
                currentPage: action.layerId !== state.source?.layerId ? 0 : state?.source?.currentPage,
                feature: action.layerId !== state.source?.layerId ? undefined : state?.source?.feature,
                featureId: action.layerId !== state.source?.layerId ? "" : state?.source?.featureId
            }
        };
    }
    case SET_SOURCE_FEATURE_ID: {
        return {
            ...state,
            source: {
                ...state.source,
                featureId: action.featureId,
                currentPage: action.featureId === "" ? 0 : state?.source?.currentPage,
                features: action.featureId === "" ? [] : state?.source?.features,
                feature: action.featureId === "" ? {} : state?.source?.feature
            }
        };
    }
    case SET_SOURCE_FEATURE: {
        return {
            ...state,
            source: {
                ...state.source,
                feature: action.feature,
                features: find(state.source.features, ft => ft?.id === action.feature?.id) ? state.source.features : [action.feature]
            }
        };
    }
    case SET_INTERSECTION_LAYER_ID: {
        return {
            ...state,
            selectedLayerType: !action.layerId && state.selectedLayerType === "intersection" ? "" : state.selectedLayerType,
            selectedLayerId: state.selectedLayerType === "intersection" ? action.layerId : state.selectedLayerId,
            intersection: {
                ...state.intersection,
                layerId: action.layerId,
                features: action.layerId !== state.intersection?.layerId ? [] : state?.intersection?.features,
                totalCount: action.layerId !== state.intersection?.layerId ? 0 : state?.intersection?.totalCount,
                currentPage: action.layerId !== state.intersection?.layerId ? 0 : state?.intersection?.currentPage,
                feature: action.layerId !== state.intersection?.layerId ? undefined : state?.intersection?.feature,
                featureId: action.layerId !== state.intersection?.layerId ? "" : state?.intersection?.featureId
            }
        };
    }
    case SET_INTERSECTION_FEATURE_ID: {
        return {
            ...state,
            intersection: {
                ...state.intersection,
                featureId: action.featureId,
                currentPage: action.featureId === "" ? 0 : state?.intersection?.currentPage,
                features: action.featureId === "" ? [] : state?.intersection?.features,
                feature: action.featureId === "" ? {} : state?.intersection?.feature
            }
        };
    }
    case SET_INTERSECTION_FEATURE: {
        return {
            ...state,
            intersection: {
                ...state.intersection,
                feature: action.feature,
                features: find(state.intersection.features, ft => ft.id === action.feature.id) ? state.intersection.features : [action.feature]
            }
        };
    }
    case SET_INTERSECTION_FIRST_ATTRIBUTE: {
        return {
            ...state,
            intersection: {
                ...state.intersection,
                firstAttributeToRetain: action.firstAttributeToRetain
            }
        };
    }
    case SET_INTERSECTION_SECOND_ATTRIBUTE: {
        return {
            ...state,
            intersection: {
                ...state.intersection,
                secondAttributeToRetain: action.secondAttributeToRetain
            }
        };
    }
    case SET_INTERSECTION_MODE: {
        return {
            ...state,
            intersection: {
                ...state.intersection,
                intersectionMode: action.intersectionMode
            }
        };
    }
    case SET_INTERSECTION_PERCENTAGES_ENABLED: {
        return {
            ...state,
            intersection: {
                ...state.intersection,
                percentagesEnabled: action.percentagesEnabled
            }
        };
    }
    case SET_INTERSECTION_AREAS_ENABLED: {
        return {
            ...state,
            intersection: {
                ...state.intersection,
                areasEnabled: action.areasEnabled
            }
        };
    }
    case SET_SELECTED_LAYER_TYPE: {
        return {
            ...state,
            selectedLayerType: action.source,
            selectedLayerId: action.source === "source" ? state.source.layerId : state.intersection.layerId
        };
    }
    case TOGGLE_HIGHLIGHT_LAYERS: {
        return {
            ...state,
            flags: {
                ...state.flags,
                showHighlightLayers: !state?.flags?.showHighlightLayers
            }
        };
    }
    default:
        return state;
    }
}

export default geoProcessing;
