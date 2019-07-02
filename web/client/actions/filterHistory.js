/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const INIT_FILTER_HISTORY = 'FILTER_HISTORY:INIT_FILTER_HISTORY';
const APPLIED_FILTER = 'FILTER_HISTORY:APPLIED_FILTER';
const STORE_CURRENT_APPLIED_FILTER = 'FILTER_HISTORY:STORE_CURRENT_APPLIED_FILTER';
const RESTORE_CURRENT_SAVED_FILTER = 'FILTER_HISTORY:RESTORE_CURRENT_SAVED_FILTER';
const APPLY_FILTER = 'FILTER_HISTORY:APPLY_FILTER';
const OPEN_QUERY_BUILDER = 'LAYER_FILTER:OPEN_QUERY_BUILDER';

function storeCurrentFilter() {
    return {
        type: STORE_CURRENT_APPLIED_FILTER
    };
}
function restoreCurrentSavedFilter() {
    return {
        type: RESTORE_CURRENT_SAVED_FILTER
    };
}
function openQueryBuilder() {
    return {
        type: OPEN_QUERY_BUILDER
    };
}
function storeAppliedFilter(filter) {
    return {
        type: APPLIED_FILTER,
        filter
    };
}
function applyFilter() {
    return {
        type: APPLY_FILTER
    };
}

function initFilterHistory(filter) {
    return {
        type: INIT_FILTER_HISTORY,
        filter
    };
}
module.exports = {
    OPEN_QUERY_BUILDER,
    openQueryBuilder,
    INIT_FILTER_HISTORY,
    initFilterHistory,
    APPLIED_FILTER,
    storeAppliedFilter,
    STORE_CURRENT_APPLIED_FILTER,
    storeCurrentFilter,
    RESTORE_CURRENT_SAVED_FILTER,
    restoreCurrentSavedFilter,
    applyFilter,
    APPLY_FILTER
};
