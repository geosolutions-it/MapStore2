/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var GeoCodingApi = require('../api/Nominatim');

const TEXT_SEARCH_RESULTS_LOADED = 'TEXT_SEARCH_RESULTS_LOADED';
const TEXT_SEARCH_PERFORMED = 'TEXT_SEARCH_PERFORMED';
const TEXT_SEARCH_RESULTS_PURGE = 'TEXT_SEARCH_RESULTS_PURGE';
function searchResultLoaded(results) {
    return {
        type: TEXT_SEARCH_RESULTS_LOADED,
        results: results.data
    };
}

function resultsPurge() {
    return {
        type: TEXT_SEARCH_RESULTS_PURGE
    };
}
function textSearch(text) {
    return (dispatch) => {
        GeoCodingApi.geocode(text).then((response) => {
            dispatch(searchResultLoaded(response));
        }).catch((e) => {
            dispatch(searchResultLoaded(e));
        });
    };
}


module.exports = { TEXT_SEARCH_RESULTS_LOADED, TEXT_SEARCH_PERFORMED, TEXT_SEARCH_RESULTS_PURGE, textSearch, resultsPurge };
