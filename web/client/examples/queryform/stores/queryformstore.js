var {createStore, combineReducers} = require('redux');

var queryForm = require('../../../reducers/queryform');

const initialState = {
    filterFields: [
        {
            rowId: 0,
            attribute: null,
            operator: null,
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
    queryForm
});

// export the store with the given reducers
module.exports = createStore(reducers, {queryForm: initialState});
