/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {TEXT_SEARCH_RESULTS_LOADED, TEXT_SEARCH_RESULTS_PURGE, TEXT_SEARCH_RESET, TEXT_SEARCH_ADD_MARKER} = require('../actions/search');

function search(state = null, action) {
    switch (action.type) {
        case TEXT_SEARCH_RESULTS_LOADED:
        if (state && state.markerPosition) {
            return {
                results: action.results,
                markerPosition: state.markerPosition
            };
        }
        return {results: action.results};
        case TEXT_SEARCH_RESULTS_PURGE:
            if (state && state.markerPosition) {
                return { markerPosition: state.markerPosition };
            }
            return null;
        case TEXT_SEARCH_ADD_MARKER:
            if (state && state.results) {
                return {
                    results: state.results,
                    markerPosition: action.markerPosition
                };
            }
            return { markerPosition: action.markerPosition };
        case TEXT_SEARCH_RESET:
            return null;
        default:
            return state;
    }
}

module.exports = search;
