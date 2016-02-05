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
            attribute: null,
            operator: null,
            value: null,
            exception: null
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
                attribute: null,
                operator: null,
                value: null,
                exception: null
            };

            return assign({}, state, {filterFields: (state.filterFields ? [...state.filterFields, newElement] : [newElement])});
        }
        case REMOVE_FILTER_FIELD: {
            return assign({}, state, {filterFields: state.filterFields.filter((field) => field.rowId !== action.rowId)});
        }
        case UPDATE_FILTER_FIELD: {
            return assign({}, state, {filterFields: state.filterFields.map((field) => {
                if (field.rowId === action.rowId) {
                    return assign({}, field, {[action.fieldName]: action.fieldValue});
                }
                return field;
            })});
        }
        case UPDATE_EXCEPTION_FIELD: {
            return assign({}, state, {filterFields: state.filterFields.map((field) => {
                if (field.rowId === action.rowId) {
                    return assign({}, field, {exception: action.exceptionMessage});
                }
                return field;
            })});
        }
        default:
            return state;
    }
}

module.exports = queryform;
