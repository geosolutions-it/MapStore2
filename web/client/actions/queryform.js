/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const ADD_FILTER_FIELD = 'ADD_FILTER_FIELD';
const REMOVE_FILTER_FIELD = 'REMOVE_FILTER_FIELD';
const UPDATE_FILTER_FIELD = 'UPDATE_FILTER_FIELD';
const UPDATE_EXCEPTION_FIELD = 'UPDATE_EXCEPTION_FIELD';

function addFilterField() {
    return {
        type: ADD_FILTER_FIELD
    };
}

function removeFilterField(rowId) {
    return {
        type: REMOVE_FILTER_FIELD,
        rowId: rowId
    };
}

function updateFilterField(rowId, fieldName, fieldValue) {
    return {
        type: UPDATE_FILTER_FIELD,
        rowId: rowId,
        fieldName: fieldName,
        fieldValue: fieldValue
    };
}

function updateExceptionField(rowId, message) {
    return {
        type: UPDATE_EXCEPTION_FIELD,
        rowId: rowId,
        exceptionMessage: message
    };
}

module.exports = {
    ADD_FILTER_FIELD,
    REMOVE_FILTER_FIELD,
    UPDATE_FILTER_FIELD,
    UPDATE_EXCEPTION_FIELD,
    addFilterField,
    removeFilterField,
    updateFilterField,
    updateExceptionField
};
