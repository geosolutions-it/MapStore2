/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {CLICK_ON_MAP} = require('../actions/map');

const {
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
    HIDE_REVERSE_GEOCODE
} = require('../actions/mapInfo');

const {RESET_CONTROLS} = require('../actions/controls');

const assign = require('object-assign');
const {head} = require('lodash');

function receiveResponse(state, action, type) {
    const request = head((state.requests || []).filter((req) => req.reqId === action.reqId));
    if (request) {
        const responses = state.responses || [];
        return assign({}, state, {
            responses: [...responses, {
                response: action[type],
                queryParams: action.requestParams,
                layerMetadata: action.layerMetadata
            }]
        });
    }
    return state;
}

function mapInfo(state = {}, action) {
    switch (action.type) {
        case CHANGE_MAPINFO_STATE:
            return assign({}, state, {
                enabled: action.enabled
            });
        case NEW_MAPINFO_REQUEST: {
            const {reqId, request} = action;
            const requests = state.requests || [];
            return assign({}, state, {
                requests: [...requests, {request, reqId}]
            });
        }
        case PURGE_MAPINFO_RESULTS:
            return assign({}, state, {
                responses: [],
                requests: []
            });
        case LOAD_FEATURE_INFO: {
            return receiveResponse(state, action, 'data');
        }
        case EXCEPTIONS_FEATURE_INFO: {
            return receiveResponse(state, action, 'exceptions');
        }
        case ERROR_FEATURE_INFO: {
            return receiveResponse(state, action, 'error');
        }
        case CLICK_ON_MAP: {
            return assign({}, state, {
                clickPoint: action.point
            });
        }
        case CHANGE_MAPINFO_FORMAT: {
            return assign({}, state, {
                infoFormat: action.infoFormat
            });
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
        default:
            return state;
    }
}

module.exports = mapInfo;
