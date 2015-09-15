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
    PURGE_MAPINFO_RESULTS
} = require('../actions/mapInfo');

const assign = require('object-assign');

function mapInfo(state = null, action) {
    switch (action.type) {
        case CHANGE_MAPINFO_STATE:
            return assign({}, state, {
                enabled: action.enabled
            });
        case NEW_MAPINFO_REQUEST: {
            let newRequests;
            if (state.requests) {
                newRequests = state.requests.slice();
                newRequests.push(action.request);
            } else {
                newRequests = [action.request];
            }
            return assign({}, state, {
                requests: newRequests
            });
        }
        case PURGE_MAPINFO_RESULTS:
            return assign({}, state, {
                responses: []
            });
        case LOAD_FEATURE_INFO: {
            /* action.data (if a JSON has been requested) is an object like this:
             * {
             *     crs: [object],
             *     features: [array],
             *     type: [string]
             * }
             * else is a [string] (for eg. if HTML data has been requested)
             */
            let newResponses;
            let obj = {
                response: action.data,
                queryParams: action.requestParams,
                layerMetadata: action.layerMetadata
            };
            if (state.responses) {
                newResponses = state.responses.slice();
                newResponses.push(obj);
            } else {
                newResponses = [obj];
            }
            return assign({}, state, {
                responses: newResponses
            });
        }
        case EXCEPTIONS_FEATURE_INFO: {
            /* action.exceptions, an array of exceptions like this:
             * [{
             *     code: [string],
             *     locator: [string],
             *     text: [string]
             * }, ...]
             */
            let newResponses;
            let obj = {
                response: action.exceptions,
                queryParams: action.requestParams,
                layerMetadata: action.layerMetadata
            };
            if (state.responses) {
                newResponses = state.responses.slice();
                newResponses.push(obj);
            } else {
                newResponses = [obj];
            }
            return assign({}, state, {
                responses: newResponses
            });
        }
        case ERROR_FEATURE_INFO: {
            /* action.error, an Object like this:
             * {
             *     config: [Object],
             *     data: [string],
             *     headers: [Object],
             *     status: [number],
             *     statusText: [string]
             * }
             */
            let newResponses;
            let obj = {
                response: action.error,
                queryParams: action.requestParams,
                layerMetadata: action.layerMetadata
            };
            if (state.responses) {
                newResponses = state.responses.slice();
                newResponses.push(obj);
            } else {
                newResponses = [obj];
            }
            return assign({}, state, {
                responses: newResponses
            });
        }
        case CLICK_ON_MAP: {
            return assign({}, state, {
                clickPoint: action.point
            });
        }
        default:
            return state;
    }
}

module.exports = mapInfo;
