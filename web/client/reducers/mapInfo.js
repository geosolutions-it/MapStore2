/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { findIndex, isUndefined, isEmpty } from 'lodash';

import { MAP_CONFIG_LOADED } from '../actions/config';
import { RESET_CONTROLS } from '../actions/controls';
import {
    ERROR_FEATURE_INFO,
    EXCEPTIONS_FEATURE_INFO,
    LOAD_FEATURE_INFO,
    CHANGE_MAPINFO_STATE,
    NEW_MAPINFO_REQUEST,
    PURGE_MAPINFO_RESULTS,
    CHANGE_MAPINFO_FORMAT,
    SHOW_MAPINFO_MARKER,
    HIDE_MAPINFO_MARKER,
    SHOW_REVERSE_GEOCODE,
    HIDE_REVERSE_GEOCODE,
    NO_QUERYABLE_LAYERS,
    CLEAR_WARNING,
    FEATURE_INFO_CLICK,
    TOGGLE_HIGHLIGHT_FEATURE,
    CHANGE_PAGE,
    TOGGLE_MAPINFO_STATE,
    UPDATE_CENTER_TO_MARKER,
    TOGGLE_EMPTY_MESSAGE_GFI,
    CHANGE_FORMAT,
    TOGGLE_SHOW_COORD_EDITOR,
    SET_CURRENT_EDIT_FEATURE_QUERY,
    SET_MAP_TRIGGER,
    SET_SHOW_IN_MAP_POPUP,
    INIT_PLUGIN
} from '../actions/mapInfo';
import { VISUALIZATION_MODE_CHANGED } from '../actions/maptype';

import { getValidator } from '../utils/MapInfoUtils';
import { VisualizationModes } from '../utils/MapTypeUtils';

/**
 * Identifies when to update a index when the display information trigger is click (GFI panel)
 * @param {object} state current state of the reducer
 * @param {array} responses the responses received so far
 * @param {number} requestIndex index position of the current request
 * @param {boolean} isVector type of the response received is vector or not
 */
const isIndexValid = (state, responses, requestIndex, isVector) => {
    const {configuration, requests, queryableLayers = [], index} = state;
    const {infoFormat} = configuration || {};
    const { layer = {} } = responses[requestIndex] || {};
    // these layers do not perform requests to a backend
    const isVectorLayer = !!(isVector || layer.type === '3dtiles');
    // Index when first response received is valid
    const validResponse = getValidator(infoFormat)?.getValidResponses([responses[requestIndex]]);
    const inValidResponse = getValidator(infoFormat)?.getNoValidResponses(responses);
    const cond1 = isUndefined(index) && !!validResponse.length;
    const cond2 = !isVectorLayer && requests.length === inValidResponse.filter(res => res).length;
    const cond3 = isUndefined(index) && isVector && requests.filter(r => isEmpty(r)).length === queryableLayers.length;
    return (cond1 || cond2 || cond3);
    // Check if all requested layers are vector
};
/**
 * Handles responses based on the type ["data"|"exceptions","error","vector"] of the responses received
 * @param {object} state current state of the reducer
 * @param {object} action object of the current response
 * @param {string} type type of the response received
 */
function receiveResponse(state, action, type) {
    const isVector = type === "vector";
    const requestIndex = !isVector ? findIndex((state.requests || []), (req) => req.reqId === action.reqId) : action.reqId;

    if (requestIndex !== -1) {
        // Filter un-queryable layer
        if (["exceptions", "error"].includes(type)) {
            const fltRequests = state.requests.filter((_, index)=> index !== requestIndex);
            const fltResponses = state.responses.filter((_, index)=> index !== requestIndex);
            return {
                ...state, responses: fltResponses, requests: fltRequests
            };
        }

        // Handle data and vector responses
        const {configuration: config, requests} = state;
        let responses = state.responses || [];
        const isHover = (config?.trigger === "hover") || state?.showInMapPopup; // Display feature info in popup

        if (!isVector) {
            const updateResponse = {
                response: action[type],
                queryParams: action.requestParams,
                layerMetadata: action.layerMetadata,
                layer: action.layer
            };
            if (isHover) {
                // Add response upon it is received
                responses = [...responses, updateResponse];
            } else {
                // Add response in same order it was requested
                responses[requestIndex] = updateResponse;
            }
        }

        let indexObj;
        if (isHover || state.showAllResponses) {
            indexObj = {loaded: true, index: state.index || 0};
        } else if (!isHover && isIndexValid(state, responses, requestIndex, isVector)) {
            if (state.index) {
                indexObj = {loaded: true, index: state.index};
            } else {
                indexObj = {loaded: true, index: requestIndex};
            }
        } else if (responses.length === requests.length && !indexObj?.loaded) {
            // if all responses are empty hence valid but with no valid index
            // then set loaded to true
            indexObj = {loaded: true};
        }

        if (state.loaded) {
            if (state.index !== null) {
                const validator = getValidator(config.infoFormat);
                const checkIfStateIndexValid = validator?.getValidResponses([responses[state.index]]);
                if (!checkIfStateIndexValid || checkIfStateIndexValid?.length === 0) {
                    // If state.index is not valid, find the first valid response
                    indexObj = {...indexObj, index: findIndex((responses || []), res => validator?.getValidResponses([res]).length > 0)};
                }
            }
        }

        // Set responses and index as first response is received
        return Object.assign({}, state, {
            ...(isVector && {requests}),
            ...(!isUndefined(indexObj) && indexObj),
            responses: [...responses]}
        );
    }
    return state;
}
const initState = {
    enabled: true,
    configuration: {}
};

/**
 * Manages the map info tool state. Contains configurations and responses.
 * @prop {boolean} [enabled=true] if true, the info tool is enabled by default
 * @prop {object} [highlightStyle] customize style for highlight. Can be customized this way
 * ```
 * {
 *     color: '#3388ff',
 *     weight: 4,
 *     radius: 4,
 *     dashArray: '',
 *     fillColor: '#3388ff',
 *     fillOpacity: 0.2
 * }
 * ```
 * @prop {object} configuration contains the configuration for getFeatureInfo tool.
 * @prop {boolean} showInMapPopup if true, the results are always shown in a popup (if configuration.hover = true, they are by default)
 * @prop {array} requests the requests performed. Here a sample:
 * ```javascript
 * {
 *     request: {
 *         service: 'WMS',
 *         version: '1.1.1',
 *         request: 'GetFeatureInfo',
 *         exceptions: 'application/json',
 *         id: 'tiger:poi__7',
 *         layers: 'tiger:poi',
 *         query_layers: 'tiger:poi',
 *         x: 51,
 *         y: 51,
 *         height: 101,
 *         width: 101,
 *         srs: 'EPSG:3857',
 *         bbox: '-8238713.7375893425,4969819.729231167,-8238472.483218817,4970060.983601692',
 *         feature_count: 10,
 *         info_format: 'text/plain',
 *         ENV: 'locale:it'
 *     },
 *     reqId: '4e030000-514a-11e9-90f1-3db233bf30bf'
 * }
 * ```
 * @prop {array} responses the responses to the requests performed. This is a sample response
 * ```javascript
 * {
 *     response: 'Results for FeatureType', // text
 *     queryParams: {
 *         service: 'WMS',
 *         version: '1.1.1',
 *         request: 'GetFeatureInfo',
 *         exceptions: 'application/json',
 *         id: 'tiger:poi__7',
 *         layers: 'tiger:poi',
 *         query_layers: 'tiger:poi',
 *         x: 51,
 *         y: 51,
 *         height: 101,
 *         width: 101,
 *         srs: 'EPSG:3857',
 *         bbox: '-8238713.7375893425,4969819.729231167,-8238472.483218817,4970060.983601692',
 *         feature_count: 10,
 *         info_format: 'text/plain',
 *         ENV: 'locale:it'
 *     },
 *     layerMetadata: {
 *         title: 'Manhattan (NY) points of interest',
 *         viewer: {},
 *         featureInfo: {}
 *     }
 * }
 * ```
 * @prop {object} clickPoint the clicked point. Contains the `pixel` clicked (x,y), the coordinates of the clicked point `latlng` (latlng) and `modifiers` (buttons pressed when clicked)
 * @prop {object} clickLayer used to query vector layers
 * @example
 * {
 *       enabled: true,
 *       highlightStyle: {
 *           color: '#3388ff',
 *           weight: 4,
 *           radius: 4,
 *           dashArray: '',
 *           fillColor: '#3388ff',
 *           fillOpacity: 0.2
 *       },
 *       configuration: {},
 *       showMarker: true,
 *       responses: [
 *           // ...array of responses
 *       ],
 *       requests: [
 *           // ...requests
 *       ],
 *       centerToMarker: 'disabled',
 *       clickPoint: {
 *           pixel: {
 *               x: 873,
 *               y: 576
 *           },
 *           latlng: {
 *               lat: 40.71190648169588,
 *               lng: -74.00854110717773
 *           },
 *           modifiers: {
 *               alt: false,
 *               ctrl: false,
 *               shift: false
 *           }
 *       },
 *       clickLayer: null,
 *       index: 0
 *   }
 *
 * @memberof reducers
 */
function mapInfo(state = initState, action) {
    switch (action.type) {
    case NO_QUERYABLE_LAYERS:
        return Object.assign({}, state, {
            warning: 'NO_QUERYABLE_LAYERS'
        });
    case CLEAR_WARNING:
        return Object.assign({}, state, {
            warning: null
        });
    case CHANGE_MAPINFO_STATE:
        return Object.assign({}, state, {
            enabled: action.enabled
        });
    case TOGGLE_MAPINFO_STATE:
        return Object.assign({}, state, {
            enabled: !state.enabled
        });
    case CHANGE_PAGE: {
        return Object.assign({}, state, {
            index: action.index
        });
    }
    case TOGGLE_HIGHLIGHT_FEATURE: {
        return Object.assign({}, state, {
            highlight: action.enabled
        });
    }
    case NEW_MAPINFO_REQUEST: {
        const {reqId, request} = action;
        const requests = state.requests || [];
        return Object.assign({}, state, {
            requests: [...requests, {request, reqId}]
        });
    }
    case PURGE_MAPINFO_RESULTS:
        const {loaded, ...others} = state;
        return {...others, queryableLayers: [], responses: [], requests: [] };
    case LOAD_FEATURE_INFO: {
        return receiveResponse(state, action, 'data');
    }
    case EXCEPTIONS_FEATURE_INFO: {
        return receiveResponse(state, action, 'exceptions');
    }
    case ERROR_FEATURE_INFO: {
        return receiveResponse(state, action, 'error');
    }
    case FEATURE_INFO_CLICK: {
        return Object.assign({}, state, {
            clickPoint: action.point,
            clickLayer: action.layer || null,
            itemId: action.itemId || null,
            overrideParams: action.overrideParams || null,
            filterNameList: action.filterNameList || null
        });
    }
    case CHANGE_MAPINFO_FORMAT: {
        return {...state,
            configuration: {
                ...state.configuration,
                infoFormat: action.infoFormat
            }
        };
    }
    case SHOW_MAPINFO_MARKER: {
        return Object.assign({}, state, {
            showMarker: true
        });
    }
    case HIDE_MAPINFO_MARKER: {
        return Object.assign({}, state, {
            showMarker: false
        });
    }
    case SHOW_REVERSE_GEOCODE: {
        return Object.assign({}, state, {
            showModalReverse: true,
            reverseGeocodeData: action.reverseGeocodeData
        });
    }
    case HIDE_REVERSE_GEOCODE: {
        return Object.assign({}, state, {
            showModalReverse: false,
            reverseGeocodeData: undefined
        });
    }
    case RESET_CONTROLS: {
        return Object.assign({}, state, {
            showMarker: false,
            responses: [],
            requests: [],
            configuration: {
                ...state.configuration,
                trigger: "click"
            }
        });
    }
    case UPDATE_CENTER_TO_MARKER: {
        return Object.assign({}, state, {
            centerToMarker: action.status
        });
    }
    case TOGGLE_EMPTY_MESSAGE_GFI: {
        return {...state, configuration: {
            ...state.configuration, showEmptyMessageGFI: !state.configuration.showEmptyMessageGFI
        }
        };
    }
    case MAP_CONFIG_LOADED: {
        return {
            ...state,
            configuration: action.config.mapInfoConfiguration || state.configuration || {}
        };
    }
    case CHANGE_FORMAT: {
        return {
            ...state,
            formatCoord: action.format
        };
    }
    case TOGGLE_SHOW_COORD_EDITOR: {
        return {
            ...state,
            showCoordinateEditor: !action.showCoordinateEditor
        };
    }
    case SET_CURRENT_EDIT_FEATURE_QUERY: {
        return {
            ...state,
            currentEditFeatureQuery: action.query
        };
    }
    case SET_MAP_TRIGGER: {
        return {
            ...state,
            configuration: {
                ...state.configuration,
                trigger: action.trigger
            }
        };
    }
    case SET_SHOW_IN_MAP_POPUP: {
        return {
            ...state,
            showInMapPopup: action.value // this is global, actually not saved in map configuration (configuration part)
        };
    }
    case VISUALIZATION_MODE_CHANGED: {
        if (action.visualizationMode === VisualizationModes._3D) {
            return {
                ...state,
                configuration: {
                    ...state.configuration,
                    trigger: "click"
                }
            };
        }
        return state;
    }
    case INIT_PLUGIN: {
        return {
            ...state,
            ...action.cfg,
            configuration: {
                ...state.configuration,
                ...(action.cfg?.configuration)
            }
        };
    }
    default:
        return state;
    }
}

export default mapInfo;
