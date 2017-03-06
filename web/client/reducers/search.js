/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {TEXT_SEARCH_RESULTS_LOADED, TEXT_SEARCH_RESULTS_PURGE, TEXT_SEARCH_RESET, TEXT_SEARCH_ADD_MARKER, TEXT_SEARCH_TEXT_CHANGE, TEXT_SEARCH_LOADING, TEXT_SEARCH_ERROR,
    TEXT_SEARCH_NESTED_SERVICES_SELECTED, TEXT_SEARCH_CANCEL_ITEM} = require('../actions/search');

const assign = require('object-assign');

function search(state = null, action) {
    switch (action.type) {
        case TEXT_SEARCH_LOADING: {
            return assign({}, state, {loading: action.loading});
        }
        case TEXT_SEARCH_ERROR: {
            return assign({}, state, {error: action.error});
        }
        case TEXT_SEARCH_TEXT_CHANGE:
            return assign({}, state, { searchText: action.searchText, error: null });
        case TEXT_SEARCH_RESULTS_LOADED:
            let results = action.results;
            if (action.append === true && state && state.results) {
                results = [...state.results, ...action.results];
            }
            return assign({}, state, { results: results, error: null });
        case TEXT_SEARCH_RESULTS_PURGE:
            return assign({}, state, { results: null, error: null});
        case TEXT_SEARCH_ADD_MARKER:
            return assign({}, state, { markerPosition: action.markerPosition });
        case TEXT_SEARCH_RESET:
            return null;
        case TEXT_SEARCH_NESTED_SERVICES_SELECTED:
            return assign({}, state, {
                selectedServices: action.services,
                searchText: action.searchText,
                selectedItems: (state.selectedItems || []).concat(action.items)
             });
        case TEXT_SEARCH_CANCEL_ITEM:
            return assign({}, {
                selectedItems: state.selectedItems && state.selectedItems.filter(item => item !== action.item),
                searchText: state.searchText === "" && action.item && action.item.text ? action.item.text.substring(0, action.item.text.length) : state.searchText
            });
        default:
            return state;
    }
}

module.exports = search;
