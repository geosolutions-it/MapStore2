/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {
    CHANGE_MAPINFO_STATE,
    NEW_MAPINFO_REQUEST,
    LOAD_FEATURE_INFO,
    EXCEPTIONS_FEATURE_INFO,
    ERROR_FEATURE_INFO,
    PURGE_MAPINFO_RESULTS
} = require('../actions/map');

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
            if (state.responses) {
                newResponses = state.responses.slice();
                newResponses.push(action.data);
            } else {
                newResponses = [action.data];
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
            if (state.responses) {
                newResponses = state.responses.slice();
                newResponses.push(action.exceptions);
            } else {
                newResponses = [action.exceptions];
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
            if (state.responses) {
                newResponses = state.responses.slice();
                newResponses.push(action.error);
            } else {
                newResponses = [action.error];
            }
            return assign({}, state, {
                responses: newResponses
            });
        }
        default:
            return state;
    }
}

module.exports = mapInfo;
