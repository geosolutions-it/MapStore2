/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
var queryform = require('../queryform');


describe('Test the queryform reducer', () => {

    it('returns the initial state on unrecognized action', () => {

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
                }
            ]
        };

        let state = queryform(initialState, {type: 'UNKNOWN'});
        expect(state).toBe(initialState);
    });

    it('Add a new filter field', () => {
        let testAction = {
            type: 'ADD_FILTER_FIELD'
        };

        let initialState = {
            filterFields: [{
                rowId: 100,
                attribute: "attributeName",
                operator: "=",
                value: "attributeValue",
                exception: null
            }]
        };

        let state = queryform(initialState, testAction);
        expect(state).toExist();

        expect(state.filterFields.length).toBe(2);

        expect(state.filterFields[0].rowId).toBe(100);
        expect(state.filterFields[0].attribute).toBe("attributeName");
        expect(state.filterFields[0].operator).toBe("=");
        expect(state.filterFields[0].value).toBe("attributeValue");
        expect(state.filterFields[0].exception).toBe(null);

        expect(state.filterFields[1].rowId).toNotEqual(state.filterFields[0].rowId);
        expect(state.filterFields[1].attribute).toBe(null);
        expect(state.filterFields[1].operator).toBe(null);
        expect(state.filterFields[1].value).toBe(null);
        expect(state.filterFields[1].exception).toBe(null);
    });

    it('Remove an existing filter field', () => {
        let testAction = {
            type: 'REMOVE_FILTER_FIELD',
            rowId: 100
        };

        let initialState = {
            filterFields: [{
                rowId: 100,
                attribute: "attributeName",
                operator: "=",
                value: "attributeValue",
                exception: null
            }, {
                rowId: 200,
                attribute: "attributeName2",
                operator: ">",
                value: "attributeValue2",
                exception: null
            }]
        };

        let state = queryform(initialState, testAction);
        expect(state).toExist();

        expect(state.filterFields.length).toBe(1);

        expect(state.filterFields[0].rowId).toBe(200);
        expect(state.filterFields[0].attribute).toBe("attributeName2");
        expect(state.filterFields[0].operator).toBe(">");
        expect(state.filterFields[0].value).toBe("attributeValue2");
        expect(state.filterFields[0].exception).toBe(null);
    });

    it('Update an existing filter field', () => {
        let testAction = {
            type: 'UPDATE_FILTER_FIELD',
            rowId: 100,
            fieldName: "attribute",
            fieldValue: "attributeName1"
        };

        let initialState = {
            filterFields: [{
                rowId: 100,
                attribute: "attributeName",
                operator: "=",
                value: "attributeValue",
                exception: null
            }, {
                rowId: 200,
                attribute: "attributeName2",
                operator: ">",
                value: "attributeValue2",
                exception: null
            }]
        };

        let state = queryform(initialState, testAction);
        expect(state).toExist();

        expect(state.filterFields.length).toBe(2);
        expect(state.filterFields[0].attribute).toBe("attributeName1");

        testAction = {
            type: 'UPDATE_FILTER_FIELD',
            rowId: 100,
            fieldName: "operator",
            fieldValue: "<"
        };

        state = queryform(state, testAction);
        expect(state).toExist();

        expect(state.filterFields.length).toBe(2);
        expect(state.filterFields[0].attribute).toBe("attributeName1");
        expect(state.filterFields[0].operator).toBe("<");

        testAction = {
            type: 'UPDATE_FILTER_FIELD',
            rowId: 100,
            fieldName: "value",
            fieldValue: "attributeValue1"
        };

        state = queryform(state, testAction);
        expect(state).toExist();

        expect(state.filterFields.length).toBe(2);
        expect(state.filterFields[0].attribute).toBe("attributeName1");
        expect(state.filterFields[0].operator).toBe("<");
        expect(state.filterFields[0].value).toBe("attributeValue1");

    });
});
