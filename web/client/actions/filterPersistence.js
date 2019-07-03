/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const INIT_FILTER_PERSISTENCE = 'FILTER_PERSISTENCE:INIT_FILTER_PERSISTENCE';
/**
 * It saves current applied filter in the state
 */
const APPLIED_FILTER = 'FILTER_PERSISTENCE:APPLIED_FILTER';
/**
 * It saves the current applied filter
 */
const STORE_CURRENT_APPLIED_FILTER = 'FILTER_PERSISTENCE:STORE_CURRENT_APPLIED_FILTER';
/**
 * It discard current applied filter restoring the last saved one
 */
const DISCARD_CURRENT_FILTER = 'FILTER_PERSISTENCE:DISCARD_CURRENT_FILTER';

const APPLY_FILTER = 'FILTER_PERSISTENCE:APPLY_FILTER';
/**
 * It opens the queary panel to be used as layer filter query builder
 */
const OPEN_QUERY_BUILDER = 'LAYER_FILTER:OPEN_QUERY_BUILDER';


function storeCurrentFilter() {
    return {
        type: STORE_CURRENT_APPLIED_FILTER
    };
}

function discardCurrentFilter() {
    return {
        type: DISCARD_CURRENT_FILTER
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

function initFilterPersistence(filter) {
    return {
        type: INIT_FILTER_PERSISTENCE,
        filter
    };
}
module.exports = {
    OPEN_QUERY_BUILDER,
    openQueryBuilder,
    INIT_FILTER_PERSISTENCE,
    initFilterPersistence,
    APPLIED_FILTER,
    storeAppliedFilter,
    STORE_CURRENT_APPLIED_FILTER,
    storeCurrentFilter,
    DISCARD_CURRENT_FILTER,
    discardCurrentFilter,
    applyFilter,
    APPLY_FILTER
};
