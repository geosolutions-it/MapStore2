var {combineReducers} = require('redux');

var DebugUtils = require('../../../utils/DebugUtils');

var queryForm = require('../../../reducers/queryform');
var locale = require('../../../reducers/locale');

const initialState = {
    filterFields: [
        {
            rowId: 0,
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
    queryForm,
    locale
});

// export the store with the given reducers
module.exports = DebugUtils.createDebugStore(reducers, {queryForm: initialState});
