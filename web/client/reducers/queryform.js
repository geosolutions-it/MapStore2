/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {ADD_FILTER_FIELD, REMOVE_FILTER_FIELD, UPDATE_FILTER_FIELD, UPDATE_EXCEPTION_FIELD} = require('../actions/queryform');
const assign = require('object-assign');

const initialState = {
    filterFields: [
        {
            rowId: 0,
            attribute: "",
            operator: null,
            value: null,
            exception: null
        }
    ],
    attributes: [
        {
            id: "Province",
            type: "list",
            values: [
                "province1",
                "province2",
                "province3",
                "province4",
                "province5"
            ]
        },
        {
            id: "Municipality",
            type: "list",
            values: [
                "municipality1",
                "municipality2",
                "municipality3",
                "municipality4",
                "municipality5"
            ]
        },
        {
            id: "RecoveryType",
            type: "list",
            values: [
                "recoveryType1",
                "recoveryType2",
                "recoveryType3",
                "recoveryType4",
                "recoveryType5"
            ]
        },
        {
            id: "RejectType",
            type: "list",
            values: [
                "rejectType1",
                "rejectType2",
                "rejectType3",
                "rejectType4",
                "rejectType5"
            ]
        },
        {
            id: "RecoveryOp",
            type: "list",
            values: [
                "recoveryOp1",
                "recoveryOp2",
                "recoveryOp3",
                "recoveryOp4",
                "recoveryOp5"
            ]
        },
        {
            id: "ActionDate",
            type: "date"
        }
    ]
};

function queryform(state = initialState, action) {
    switch (action.type) {
        case ADD_FILTER_FIELD: {
            //
            // Calculate the key number, this should be different for each new element
            //
            const newElement = {
                rowId: new Date().getUTCMilliseconds(),
                attribute: "",
                operator: null,
                value: null,
                exception: null
            };

            return assign({}, state, {filterFields: [...state.filterFields, newElement]});
        }
        case REMOVE_FILTER_FIELD: {
            return assign({}, state, {filterFields: state.filterFields.filter((field) => {
                if (field.rowId !== action.rowId) {
                    return field;
                }
            })});
        }
        case UPDATE_FILTER_FIELD: {
            return assign({}, state, {filterFields: state.filterFields.map((field) => {
                if (field.rowId === action.rowId) {
                    switch (action.fieldName) {
                        case "attributeField": {
                            field.attribute = action.fieldValue;
                            break;
                        }
                        case "operatorField": {
                            field.operator = action.fieldValue;
                            break;
                        }
                        case "valueField": {
                            field.value = action.fieldValue;
                            break;
                        }
                        default: break;
                    }
                }
                return field;
            })});
        }
        case UPDATE_EXCEPTION_FIELD: {
            return assign({}, state, {filterFields: state.filterFields.map((field) => {
                if (field.rowId === action.rowId) {
                    field.exception = action.exceptionMessage;

                }
                return field;
            })});
        }
        default:
            return state;
    }
}

module.exports = queryform;
