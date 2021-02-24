/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

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
    GET_VECTOR_INFO,
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
    SET_SHOW_IN_MAP_POPUP
} from '../actions/mapInfo';

import { MAP_CONFIG_LOADED } from '../actions/config';
import { RESET_CONTROLS } from '../actions/controls';
import assign from 'object-assign';
import { findIndex, isUndefined } from 'lodash';
import { MAP_TYPE_CHANGED } from './../actions/maptype';

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
        const isHover = (config?.trigger === "hover"); // Display info trigger

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

        let indexObj = {loaded: true, index: 0};
        // Set responses and index as first response is received
        return assign({}, state, {
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
        return assign({}, state, {
            warning: 'NO_QUERYABLE_LAYERS'
        });
    case CLEAR_WARNING:
        return assign({}, state, {
            warning: null
        });
    case CHANGE_MAPINFO_STATE:
        return assign({}, state, {
            enabled: action.enabled
        });
    case TOGGLE_MAPINFO_STATE:
        return assign({}, state, {
            enabled: !state.enabled
        });
    case CHANGE_PAGE: {
        return assign({}, state, {
            index: action.index
        });
    }
    case TOGGLE_HIGHLIGHT_FEATURE: {
        return assign({}, state, {
            highlight: action.enabled
        });
    }
    case NEW_MAPINFO_REQUEST: {
        const {reqId, request} = action;
        const requests = state.requests || [];
        return assign({}, state, {
            requests: [...requests, {request, reqId}]
        });
    }
    case PURGE_MAPINFO_RESULTS:
        const {index, loaded, ...others} = state;
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
        return assign({}, state, {
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
        return assign({}, state, {
            showMarker: true
        });
    }
    case HIDE_MAPINFO_MARKER: {
        return assign({}, state, {
            showMarker: false
        });
    }
    case SHOW_REVERSE_GEOCODE: {
        return assign({}, state, {
            showModalReverse: true,
            reverseGeocodeData: action.reverseGeocodeData
        });
    }
    case HIDE_REVERSE_GEOCODE: {
        return assign({}, state, {
            showModalReverse: false,
            reverseGeocodeData: undefined
        });
    }
    case RESET_CONTROLS: {
        return assign({}, state, {
            showMarker: false,
            responses: [],
            requests: []
        });
    }
    case GET_VECTOR_INFO: {
        const buffer = require('turf-buffer');
        const intersect = require('turf-intersect');
        const point = {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": [action.request.lng, action.request.lat]
            }
        };
        let unit = action.metadata && action.metadata.units;
        switch (unit) {
        case "m":
            unit = "meters";
            break;
        case "deg":
            unit = "degrees";
            break;
        case "mi":
            unit = "miles";
            break;
        default:
            unit = "meters";
        }
        let resolution = action.metadata && action.metadata.resolution || 1;
        let bufferedPoint = buffer(point, (action.metadata.buffer || 1) * resolution, unit);
        const intersected = (action.layer.features || []).filter(
            (feature) => {
                try {
                    // TODO: instead of create a fixed buffer, we should check the feature style to create the proper buffer.

                    if (feature.type === "FeatureCollection" && feature.features && feature.features.length) {
                        return feature.features.reduce((p, c) => {
                            // if required use the geodesic geometry
                            let ft = c.properties.useGeodesicLines && c.properties.geometryGeodesic ? {...c,
                                geometry: c.properties.geometryGeodesic
                            } : c;
                            return p || intersect(bufferedPoint, resolution && action.metadata.buffer && unit ? buffer(ft, 1, "meters") : ft);
                        }, false);
                    }
                    return intersect(bufferedPoint, resolution && action.metadata.buffer && unit ? buffer(feature, 1, "meters") : feature);

                } catch (e) {
                    return false;
                }
            }

        );
        let responses = state.responses || [];
        const isHover = state?.configuration?.trigger === 'hover' || false;
        const vectorResponse = {
            response: {
                crs: null,
                features: intersected,
                totalFeatures: "unknown",
                type: "FeatureCollection"
            },
            queryParams: action.request,
            layerMetadata: action.metadata,
            format: 'JSON'
        };
        let vectorAction;
        // Add response such that it doesn't replace other layer response's index
        if (!isHover) {
            responses[state.requests.length] = vectorResponse;
            // To identify vector request index
            vectorAction = {reqId: state.requests.length};
        } else {
            responses = [...responses, vectorResponse];
            vectorAction = {reqId: 0};
        }
        const requests = [...state.requests, {}];
        return receiveResponse(assign({}, state, {
            requests,
            queryableLayers: action.queryableLayers,
            responses: [...responses]
        }), vectorAction, "vector");
    }
    case UPDATE_CENTER_TO_MARKER: {
        return assign({}, state, {
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
    case MAP_TYPE_CHANGED: {
        if (action.mapType === "cesium") {
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
    default:
        return state;
    }
}

export default mapInfo;
