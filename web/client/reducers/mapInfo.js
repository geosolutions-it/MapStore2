/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {CLICK_ON_MAP} = require('../actions/map');

var {
    ERROR_FEATURE_INFO,
    EXCEPTIONS_FEATURE_INFO,
    LOAD_FEATURE_INFO,
    CHANGE_MAPINFO_STATE,
    NEW_MAPINFO_REQUEST,
    PURGE_MAPINFO_RESULTS,
    CHANGE_MAPINFO_FORMAT,
    SHOW_MAPINFO_MARKER,
    HIDE_MAPINFO_MARKER
} = require('../actions/mapInfo');

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
        default:
            return state;
    }
}

module.exports = mapInfo;
