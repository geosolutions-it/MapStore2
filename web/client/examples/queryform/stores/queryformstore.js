/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var DebugUtils = require('../../../utils/DebugUtils');

var locale = require('../../../reducers/locale');
const {combineReducers} = require('redux');

const queryform = require('../../../reducers/queryform');

const initialState = {
    groupLevels: 5,
    groupFields: [
        {
            id: 1,
            logic: "OR",
            index: 0
        }
    ],
    filterFields: [
        {
            rowId: 0,
            groupId: 1,
            attribute: null,
            operator: "=",
            value: null,
            exception: null
        }
    ],
    attributes: [
        {
            id: "ListAttribute",
            type: "list",
            values: [
                "value1",
                "value2",
                "value3",
                "value4",
                "value5"
            ]
        },
        {
            id: "DateAttribute",
            type: "date"
        }
    ]
};

 // reducers
const reducers = combineReducers({
    queryform,
    locale
});

// export the store with the given reducers
module.exports = DebugUtils.createDebugStore(reducers, {queryform: initialState});
