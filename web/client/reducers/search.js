/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {TEXT_SEARCH_RESULTS_LOADED, TEXT_SEARCH_RESULTS_PURGE} = require('../actions/search');

function search(state = null, action) {
    switch (action.type) {
        case TEXT_SEARCH_RESULTS_LOADED:
            return action.results;
        case TEXT_SEARCH_RESULTS_PURGE:
            return null;
        default:
            return state;
    }
}

module.exports = search;
