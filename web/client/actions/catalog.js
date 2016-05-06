/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var API = require('../api/CSW');

const RECORD_LIST_LOADED = 'RECORD_LIST_LOADED';
const RECORD_LIST_LOAD_ERROR = 'RECORD_LIST_LOAD_ERROR';

function recordsLoaded(options, result) {
    return {
        type: RECORD_LIST_LOADED,
        searchOptions: options,
        result: result
    };
}

function recordsLoadError(e) {
    return {
        type: RECORD_LIST_LOAD_ERROR,
        error: e
    };
}
function getRecords(url, startPosition = 1, maxRecords, filter, options) {
    return (dispatch /* , getState */) => {
        // TODO auth (like) let opts = GeoStoreApi.getAuthOptionsFromState(getState(), {params: {start: 0, limit: 20}, baseURL: geoStoreUrl });
        API.getRecords(url, startPosition, maxRecords, filter, options).then((result) => {
            dispatch(recordsLoaded({
                url,
                startPosition,
                maxRecords,
                filter
            }, result));
        }).catch((e) => {
            dispatch(recordsLoadError(e));
        });
    };
}
function textSearch(url, startPosition, maxRecords, text, options) {
    return (dispatch /* , getState */) => {
        // TODO auth (like) let opts = GeoStoreApi.getAuthOptionsFromState(getState(), {params: {start: 0, limit: 20}, baseURL: geoStoreUrl });
        API.textSearch(url, startPosition, maxRecords, text, options).then((result) => {
            dispatch(recordsLoaded({
                url,
                startPosition,
                maxRecords,
                text
            }, result));
        }).catch((e) => {
            dispatch(recordsLoadError(e));
        });
    };
}

module.exports = {RECORD_LIST_LOADED, RECORD_LIST_LOAD_ERROR, getRecords, textSearch};
