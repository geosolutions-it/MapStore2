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
    INCREASE_BUFFERED_COUNTER,
    INCREASE_INTERSECT_COUNTER,
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
} from '../actions/geoProcessingTools';

import { checkIfIntersectionIsPossible } from '../utils/GeoProcessingToolsUtils';

/**
 * reducer for geoProcessingTools
 * @memberof reducers
 * @param  {Object} action the action
 * @return {Object}        the new state
 *
 */
function geoProcessingTools( state = {
    selectedTool: GPT_TOOL_BUFFER || GPT_TOOL_INTERSECTION,
    buffer: {
        counter: 0
    },
    intersection: {
        counter: 0,
        intersectionMode: "INTERSECTION"
    },
    flags: {
        showHighlightLayers: true,
        isIntersectionEnabled: true,
        runningProcess: false
    }
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
    case INCREASE_BUFFERED_COUNTER: {
        return {
            ...state,
            buffer: {
                ...state.buffer,
                counter: state.buffer.counter + 1
            }
        };
    }
    case INCREASE_INTERSECT_COUNTER: {
        return {
            ...state,
            intersection: {
                ...state.intersection,
                counter: state.intersection.counter + 1
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
                quadrantSegments: action.quadrantSegments
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
        return action.data.features ? {
            ...state,
            [action.source]: {
                ...state[action.source],
                features: (state[action.source].features || []).concat(action.data.features || []),
                totalCount: action.data.totalFeatures,
                currentPage: action.nextPage
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
            selectedLayerId: action.layerId,
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
                features: find(state.source.features, ft => ft.id === action.feature.id) ? state.source.features : [action.feature]
            },
            flags: {
                ...state.flags,
                isIntersectionEnabled: checkIfIntersectionIsPossible(action?.feature, state?.intersection?.feature)
            }
        };
    }
    case SET_INTERSECTION_LAYER_ID: {
        return {
            ...state,
            selectedLayerId: action.layerId,
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
            },
            flags: {
                ...state.flags,
                isIntersectionEnabled: checkIfIntersectionIsPossible(state?.source?.feature, action?.feature)
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

export default geoProcessingTools;
