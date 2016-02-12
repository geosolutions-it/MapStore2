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
const ADD_GROUP_FIELD = 'ADD_GROUP_FIELD';
const UPDATE_LOGIC_COMBO = 'UPDATE_LOGIC_COMBO';
const REMOVE_GROUP_FIELD = 'REMOVE_GROUP_FIELD';

function addFilterField(groupId) {
    return {
        type: ADD_FILTER_FIELD,
        groupId: groupId
    };
}

function addGroupField(groupId, index) {
    return {
        type: ADD_GROUP_FIELD,
        groupId: groupId,
        index: index
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

function updateLogicCombo(groupId, logic) {
    return {
        type: UPDATE_LOGIC_COMBO,
        groupId: groupId,
        logic: logic
    };
}

function removeGroupField(groupId) {
    return {
        type: REMOVE_GROUP_FIELD,
        groupId: groupId
    };
}

module.exports = {
    ADD_FILTER_FIELD,
    REMOVE_FILTER_FIELD,
    UPDATE_FILTER_FIELD,
    UPDATE_EXCEPTION_FIELD,
    ADD_GROUP_FIELD,
    UPDATE_LOGIC_COMBO,
    REMOVE_GROUP_FIELD,
    addFilterField,
    removeFilterField,
    updateFilterField,
    updateExceptionField,
    addGroupField,
    updateLogicCombo,
    removeGroupField
};
