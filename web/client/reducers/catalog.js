/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {RECORD_LIST_LOADED, RECORD_LIST_LOAD_ERROR} = require('../actions/catalog');

function catalog(state = null, action) {
    switch (action.type) {
        case RECORD_LIST_LOADED:
            return {
                result: action.result,
                searchOptions: action.searchOptions
            };
        case RECORD_LIST_LOAD_ERROR:
            return {
                loadingError: action.error
            };
        default:
            return state;
    }
}

module.exports = catalog;
