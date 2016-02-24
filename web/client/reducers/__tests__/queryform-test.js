/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const queryform = require('../queryform');

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
        expect(state.filterFields[1].operator).toBe("=");
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

    it('Update the exception for a filter field', () => {
        let testAction = {
            type: 'UPDATE_EXCEPTION_FIELD',
            rowId: 100,
            fieldName: "attribute",
            fieldValue: "attributeName1",
            exceptionMessage: "exception message"
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
        expect(state.filterFields[0].exception).toBe("exception message");
    });

    it('Add a new group field', () => {
        let testAction = {
            type: 'ADD_GROUP_FIELD',
            groupId: 1,
            index: 0
        };

        let initialState = {
            groupFields: [
                {
                    id: 1,
                    logic: "OR",
                    index: 0
                }
            ]
        };

        let state = queryform(initialState, testAction);
        expect(state).toExist();

        expect(state.groupFields.length).toBe(2);
        expect(state.groupFields[1].index).toBe(1);
        expect(state.groupFields[1].groupId).toBe(1);
        expect(state.groupFields[1].logic).toBe("OR");
    });

    it('Update a logic combo box', () => {
        let testAction = {
            type: 'UPDATE_LOGIC_COMBO',
            groupId: 1,
            logic: "AND"
        };

        let initialState = {
            groupFields: [
                {
                    id: 1,
                    logic: "OR",
                    index: 0
                }
            ]
        };

        let state = queryform(initialState, testAction);
        expect(state).toExist();

        expect(state.groupFields.length).toBe(1);
        expect(state.groupFields[0].index).toBe(0);
        expect(state.groupFields[0].id).toBe(1);
        expect(state.groupFields[0].logic).toBe("AND");
    });

    it('Remove a group field', () => {
        let testAction = {
            type: 'REMOVE_GROUP_FIELD',
            groupId: 2
        };

        let initialState = {
            groupFields: [
                {
                    id: 1,
                    logic: "OR",
                    index: 0
                }, {
                    id: 2,
                    logic: "AND",
                    index: 1
                }
            ],
            filterFields: [{
                rowId: 100,
                groupId: 2,
                attribute: "attributeName",
                operator: "=",
                value: "attributeValue",
                exception: null
            }, {
                rowId: 200,
                groupId: 2,
                attribute: "attributeName2",
                operator: ">",
                value: "attributeValue2",
                exception: null
            }]
        };

        let state = queryform(initialState, testAction);
        expect(state).toExist();

        expect(state.groupFields.length).toBe(1);
        expect(state.groupFields[0].index).toBe(0);
        expect(state.groupFields[0].id).toBe(1);
        expect(state.groupFields[0].logic).toBe("OR");

        expect(state.filterFields.length).toBe(0);
    });

    it('Expand the Attribute Filter Panel', () => {
        let testAction = {
            type: 'EXPAND_ATTRIBUTE_PANEL',
            expand: false
        };

        const initialState = {
            attributePanelExpanded: true,
            spatialPanelExpanded: true
        };

        let state = queryform(initialState, testAction);
        expect(state).toExist();

        expect(state.attributePanelExpanded).toEqual(false);
    });

    it('Expand the Spatial Filter Panel', () => {
        let testAction = {
            type: 'EXPAND_SPATIAL_PANEL',
            expand: false
        };

        const initialState = {
            attributePanelExpanded: true,
            spatialPanelExpanded: true
        };

        let state = queryform(initialState, testAction);
        expect(state).toExist();

        expect(state.spatialPanelExpanded).toEqual(false);
    });

    it('Select Spatial Method', () => {
        let testAction = {
            type: "SELECT_SPATIAL_METHOD",
            fieldName: "method",
            method: "BBOX"
        };

        const initialState = {
            spatialField: {
                method: null,
                attribute: "the_geom",
                operation: "INTERSECTS",
                geometry: null
            }
        };

        let state = queryform(initialState, testAction);
        expect(state).toExist();

        expect(state.spatialField.method).toEqual("BBOX");
    });

    it('Select Spatial Operation', () => {
        let testAction = {
            type: "SELECT_SPATIAL_OPERATION",
            fieldName: "operation",
            operation: "DWITHIN"
        };

        const initialState = {
            spatialField: {
                method: null,
                attribute: "the_geom",
                operation: "INTERSECTS",
                geometry: null
            }
        };

        let state = queryform(initialState, testAction);
        expect(state).toExist();

        expect(state.spatialField.operation).toEqual("DWITHIN");
    });

    it('Remove Spatial Selection', () => {
        let testAction = {
            type: "REMOVE_SPATIAL_SELECT"
        };

        const initialState = {
            spatialField: {
                method: "BBOX",
                attribute: "the_geom",
                operation: "DWITHIN",
                geometry: '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-635956.0753326667,5466776.262955805],[-635956.0753326667,4723196.8517976105],[-29351.81886150781,4723196.8517976105],[-29351.81886150781,5466776.262955805],[-635956.0753326667,5466776.262955805]]]},"properties":null}'
            }
        };

        let state = queryform(initialState, testAction);
        expect(state).toExist();
        expect(state.spatialField).toExist();

        expect(state.spatialField.method).toEqual(null);
        expect(state.spatialField.attribute).toEqual("the_geom");
        expect(state.spatialField.operation).toEqual("INTERSECTS");
        expect(state.spatialField.geometry).toEqual(null);
    });

    it('Show Spatial Details Panel', () => {
        let testAction = {
            type: "SHOW_SPATIAL_DETAILS",
            show: true
        };

        const initialState = {
            showDetailsPanel: false
        };

        let state = queryform(initialState, testAction);
        expect(state).toExist();

        expect(state.showDetailsPanel).toEqual(true);
    });
});
