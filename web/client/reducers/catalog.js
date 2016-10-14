/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {RECORD_LIST_LOADED, RECORD_LIST_LOAD_ERROR, CHANGE_CATALOG_FORMAT, ADD_LAYER_ERROR, CATALOG_RESET} = require('../actions/catalog');
const assign = require('object-assign');

function catalog(state = null, action) {
    switch (action.type) {
        case RECORD_LIST_LOADED:
            return assign({}, state, {
                result: action.result,
                searchOptions: action.searchOptions,
                loadingError: null,
                layerError: null
            });
        case CATALOG_RESET: {
            return assign({}, state, {
                result: null,
                loadingError: null,
                format: action.format,
                layerError: null
            });
        }
        case RECORD_LIST_LOAD_ERROR:
            return assign({}, state, {
                result: null,
                searchOptions: null,
                loadingError: action.error,
                layerError: null
            });
        case CHANGE_CATALOG_FORMAT:
            return {
                result: null,
                loadingError: null,
                format: action.format,
                layerError: null
            };
        case ADD_LAYER_ERROR:
            return assign({}, state, {layerError: action.error});
        default:
            return state;
    }
}

module.exports = catalog;
