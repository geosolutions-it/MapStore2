/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const queryform = require('../queryform');

const {featureCollection} = require('../../test-resources/featureCollectionZone.js');
const {
    UPDATE_FILTER_FIELD_OPTIONS, SET_AUTOCOMPLETE_MODE, TOGGLE_AUTOCOMPLETE_MENU,
    loadFilter,
    expandCrossLayerFilterPanel, setCrossLayerFilterParameter, resetCrossLayerFilter,
    addCrossLayerFilterField, updateCrossLayerFilterField, removeCrossLayerFilterField,
    changeSpatialFilterValue
} = require('../../actions/queryform');
const {END_DRAWING, CHANGE_DRAWING_STATUS} = require('../../actions/draw');

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

    it('Update an existing filter field', () => {
        let initialState = {
            filterFields: [{
                rowId: 100,
                attribute: "attributeName",
                operator: "=",
                value: "attributeValue",
                exception: null,
                fieldOptions: {
                    currentPage: 0
                }
            }, {
                rowId: 200,
                attribute: "attributeName2",
                operator: ">",
                value: "attributeValue2",
                exception: null,
                fieldOptions: {
                    currentPage: 1
                }
            }]
        };

        let testAction = {
            type: 'UPDATE_FILTER_FIELD',
            rowId: 100,
            fieldName: "attribute",
            fieldValue: "attributeName1",
            fieldOptions: {currentPage: 1}
        };

        let state = queryform(initialState, testAction);
        expect(state).toExist();

        expect(state.filterFields.length).toBe(2);
        expect(state.filterFields[0].attribute).toBe("attributeName1");

        testAction = {
            type: 'UPDATE_FILTER_FIELD',
            rowId: 100,
            fieldName: "operator",
            fieldValue: "<",
            fieldOptions: {currentPage: 1}
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
            fieldValue: "attributeValue1",
            fieldOptions: {currentPage: 1}
        };

        state = queryform(state, testAction);
        expect(state).toExist();

        expect(state.filterFields.length).toBe(2);
        expect(state.filterFields[0].attribute).toBe("attributeName1");
        expect(state.filterFields[0].operator).toBe("<");
        expect(state.filterFields[0].value).toBe("attributeValue1");
    });

    it('Update an existing filter field', () => {
        let testAction = {
            type: UPDATE_FILTER_FIELD_OPTIONS,
            filterField: {
                rowId: 100,
                fieldName: "attributeName"
            },
            options: ["val1", "val2"],
            valuesCount: 2
        };
        let initialState = {
            filterFields: [{
                rowId: 100,
                attribute: "attributeName",
                operator: "=",
                fieldType: "string",
                fieldName: "value",
                exception: null,
                fieldOptions: {
                    currentPage: 0
                }
            }, {
                rowId: 200,
                attribute: "attributeName2",
                operator: ">",
                value: "attributeValue2",
                exception: null,
                fieldOptions: {
                    currentPage: 1
                }
            }]
        };
        let state = queryform(initialState, testAction);
        expect(state).toExist();
        expect(state.filterFields.length).toBe(2);
        expect(state.filterFields[0].attribute).toBe("attributeName");
        expect(state.filterFields[0].options.attributeName.length).toBe(2);

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

    it('test UPDATE_GEOMETRY', () => {
        const geometry = {center: [0, 1], coordinates: []};
        let testAction = {
            type: "UPDATE_GEOMETRY",
            geometry
        };
        const initialState = { spatialField: {geometry: {}} };
        let state = queryform(initialState, testAction);
        expect(state).toExist();
        expect(state.spatialField.geometry).toEqual(geometry);
    });

    it('test CHANGE_SPATIAL_ATTRIBUTE', () => {
        const attribute = "some value";
        let testAction = {
            type: "CHANGE_SPATIAL_ATTRIBUTE",
            attribute
        };
        const initialState = { spatialField: {attribute: {}} };
        let state = queryform(initialState, testAction);
        expect(state).toExist();
        expect(state.spatialField.attribute).toEqual(attribute);
    });

    it('test CHANGE_SPATIAL_FILTER_VALUE', () => {
        const initialState = { spatialField: {geometry: {}} };
        const args = {
            collectGeometries: {},
            value: "SELECTED_VALUE",
            feature: {
                geometry: {
                    type: "Point",
                    coordinates: [1, 1]
                }
            }
        };
        const action = changeSpatialFilterValue(args);
        const newState = queryform(initialState, action);
        expect(newState.spatialField).toExist();
        expect(newState.spatialField.geometry).toBe(args.feature.geometry);
        expect(newState.spatialField.collectGeometries).toBe(args.collectGeometries);
        expect(newState.spatialField.value).toBe(args.value);
    });

    it('test CHANGE_SPATIAL_FILTER_VALUE with srsName', () => {
        const initialState = { spatialField: {geometry: {}} };
        const args = {
            collectGeometries: {},
            value: "SELECTED_VALUE",
            srsName: 'EPSG:4326',
            feature: {
                geometry: {
                    type: "Point",
                    coordinates: [1, 1]
                }
            }
        };
        const action = changeSpatialFilterValue(args);
        const newState = queryform(initialState, action);
        expect(newState.spatialField.geometry).toEqual({...args.feature.geometry, projection: 'EPSG:4326'});
    });

    it('test CHANGE_DRAWING_STATUS', () => {
        const initialState = { toolbarEnabled: true };
        const testAction1 = {
            type: CHANGE_DRAWING_STATUS,
            owner: "queryform",
            status: "start"
        };
        const state = queryform(initialState, testAction1);
        expect(state).toExist();
        expect(state.toolbarEnabled).toBeFalsy();
        const testAction2 = {
            type: CHANGE_DRAWING_STATUS,
            owner: "measure",
            status: "start"
        };
        const state2 = queryform(initialState, testAction2);
        expect(state2).toExist();
        expect(state2.toolbarEnabled).toBeTruthy();
    });

    it('test END_DRAWING', () => {
        const geometry = {center: [0, 1], coordinates: []};
        const initialState = { toolbarEnabled: false, spatialField: {geometry: {}} };
        const testAction1 = {
            type: END_DRAWING,
            owner: "queryform",
            geometry
        };
        const state = queryform(initialState, testAction1);
        expect(state).toExist();
        expect(state.toolbarEnabled).toBeTruthy();
        expect(state.spatialField.geometry).toBe(geometry);
        const testAction2 = {
            type: END_DRAWING,
            owner: "measure",
            status: "start"
        };
        const state2 = queryform(initialState, testAction2);
        expect(state2).toExist();
        expect(state2.toolbarEnabled).toBeFalsy();
        expect(state2.spatialField.geometry).toEqual({});
    });

    it('test CHANGE_DWITHIN_VALUE', () => {
        const initialState = { spatialField: {geometry: { distance: {}}} };
        const distance = 123;
        const testAction1 = {
            type: "CHANGE_DWITHIN_VALUE",
            distance
        };
        const state = queryform(initialState, testAction1);
        expect(state).toExist();
        expect(state.spatialField.geometry.distance).toBe(distance);
    });

    it('Query Form Reset', () => {
        let testAction = {
            type: "QUERY_FORM_RESET"
        };

        const initialState = {
            test: true,
            spatialField: {
                attribute: "GEOMETRY"
            }
        };

        let state = queryform(initialState, testAction);
        expect(state).toExist();

        expect(state.test).toEqual(true);
        expect(state.spatialField.attribute).toEqual("GEOMETRY");
    });

    it('Show Generated Filter', () => {
        let testAction = {
            type: "SHOW_GENERATED_FILTER",
            data: "data"
        };

        const initialState = {
            showGeneratedFilter: "test"
        };

        let state = queryform(initialState, testAction);
        expect(state).toExist();

        expect(state.showGeneratedFilter).toEqual("data");
    });

    it('Zone Filter', () => {
        let testAction = {
            type: "ZONE_FILTER",
            data: {features: [{
                id: 1,
                name: "value1"
            }, {
                id: 2,
                name: "value2"
            }]},
            id: 1
        };

        const initialState = {
            spatialField: {
                method: "ZONE",
                attribute: "geom3857",
                operation: "INTERSECTS",
                geometry: null,
                zoneFields: [{
                    id: 1,
                    url: "http://localhost:8080/",
                    typeName: "typeName1",
                    values: [],
                    value: null,
                    valueField: "properties.attr1",
                    textField: "properties.attr2",
                    searchText: "*",
                    searchMethod: "ilike",
                    searchAttribute: "att2",
                    label: "Attribute"
                }, {
                    id: 2,
                    url: "http://localhost:8080/",
                    typeName: "typeName1",
                    values: [],
                    value: null,
                    valueField: "properties.attr1",
                    textField: "properties.attr2",
                    searchText: "*",
                    searchMethod: "ilike",
                    searchAttribute: "att2",
                    label: "Attribute",
                    disabled: true,
                    dependson: {
                        id: 1,
                        field: "att3",
                        value: null
                    }
                }]
            }
        };

        let state = queryform(initialState, testAction);
        expect(state).toExist();
        expect(state.spatialField).toExist();
        expect(state.spatialField.zoneFields[0].values.length).toBe(2);

        expect(state.spatialField.zoneFields[0].open).toBe(true);
    });

    it('Zone Search', () => {
        let testAction = {
            type: "ZONE_SEARCH",
            active: true,
            id: 1
        };

        const initialState = {
            spatialField: {
                method: "ZONE",
                attribute: "geom3857",
                operation: "INTERSECTS",
                geometry: null,
                zoneFields: [{
                    id: 1,
                    url: "http://localhost:8080/",
                    typeName: "typeName1",
                    values: [],
                    value: null,
                    valueField: "properties.attr1",
                    textField: "properties.attr2",
                    searchText: "*",
                    searchMethod: "ilike",
                    searchAttribute: "att2",
                    label: "Attribute"
                }, {
                    id: 2,
                    url: "http://localhost:8080/",
                    typeName: "typeName1",
                    values: [],
                    value: null,
                    valueField: "properties.attr1",
                    textField: "properties.attr2",
                    searchText: "*",
                    searchMethod: "ilike",
                    searchAttribute: "att2",
                    label: "Attribute",
                    disabled: true,
                    dependson: {
                        id: 1,
                        field: "att3",
                        value: null
                    }
                }]
            }
        };

        let state = queryform(initialState, testAction);
        expect(state).toExist();
        expect(state.spatialField).toExist();
        expect(state.spatialField.zoneFields[0].busy).toBe(true);
    });

    it('Zone Change', () => {
        let testAction = {
            type: "ZONE_CHANGE",
            id: 1,
            value: {
                value: ["Five"],
                feature: [
                    {
                        "type": "Feature",
                        "id": "zones.5",
                        "geometry": {
                            "type": "MultiPolygon",
                            "coordinates": [
                                [
                                    [
                                        [
                                            -112.52004032,
                                            43.54002689
                                        ],
                                        [
                                            -112.52008024,
                                            43.42515586
                                        ],
                                        [
                                            -112.2234772,
                                            43.42473004
                                        ],
                                        [
                                            -112.1032533,
                                            43.42498078
                                        ],
                                        [
                                            -112.52004032,
                                            43.54002689
                                        ]
                                    ]
                                ]
                            ]
                        },
                        "geometry_name": "the_geom",
                        "properties": {
                            "Shape_Leng": 732018.056416,
                            "Shape_Area": 2.44128352236E10,
                            "District_N": "5",
                            "SUM_Counti": 7,
                            "Orient": 0,
                            "OrientPg": 0,
                            "ITD_Dist_n": 5,
                            "DistNum": "Five",
                            "Area_sqmi": 9425.848
                        }
                    }
                ]
            }
        };

        const initialState = {
            spatialField: {
                method: "ZONE",
                attribute: "the_geom",
                operation: "INTERSECTS",
                geometry: null,
                zoneFields: [{
                    id: 1,
                    url: "http://localhost:8080/",
                    typeName: "typeName1",
                    values: featureCollection.features,
                    value: null,
                    multivalue: false,
                    valueField: "properties.attr1",
                    textField: "properties.attr2",
                    searchText: "*",
                    searchMethod: "ilike",
                    searchAttribute: "att2",
                    label: "Attribute"
                }, {
                    id: 2,
                    url: "http://localhost:8080/",
                    typeName: "typeName1",
                    values: [],
                    value: null,
                    valueField: "properties.attr1",
                    textField: "properties.attr2",
                    searchText: "*",
                    searchMethod: "ilike",
                    searchAttribute: "att2",
                    label: "Attribute",
                    disabled: true,
                    dependson: {
                        id: 1,
                        field: "att3",
                        value: null
                    }
                }]
            }
        };

        let state = queryform(initialState, testAction);
        expect(state).toExist();
        expect(state.spatialField).toExist();

        expect(state.spatialField.zoneFields[0].value).toEqual("Five");
        expect(state.spatialField.zoneFields[0].geometryName).toEqual("the_geom");
    });

    it('Zone Reset', () => {
        let testAction = {
            type: "ZONES_RESET"
        };

        const initialState = {
            spatialField: {
                method: "ZONE",
                attribute: "the_geom",
                operation: "INTERSECTS",
                geometry: null,
                zoneFields: [{
                    id: 1,
                    url: "http://localhost:8080/",
                    typeName: "typeName1",
                    values: featureCollection.features,
                    value: null,
                    valueField: "properties.attr1",
                    textField: "properties.attr2",
                    searchText: "*",
                    searchMethod: "ilike",
                    searchAttribute: "att2",
                    label: "Attribute"
                }]
            }
        };

        let state = queryform(initialState, testAction);
        expect(state).toExist();
        expect(state.spatialField).toExist();
        expect(state.spatialField.zoneFields[0].values).toBe(null);
    });

    it('Simple Filter update', () => {
        let testAction = {
            type: "SIMPLE_FILTER_FIELD_UPDATE",
            id: 1,
            properties: {combo: true}
        };

        let state = queryform({simpleFilterFields: [{fieldId: 1, combo: false}, {fieldId: 2, combo: true}]}, testAction);
        expect(state).toExist();
        expect(state.simpleFilterFields).toExist();
        expect(state.simpleFilterFields[0].combo).toBe(true);
    });

    it('Add Simple Filter', () => {
        let testAction = {
            type: "ADD_SIMPLE_FILTER_FIELD",
            properties: {fieldId: 1, combo: true}
        };

        let state = queryform( {simpleFilterFields: []}, testAction);
        expect(state).toExist();
        expect(state.simpleFilterFields).toExist();
        expect(state.simpleFilterFields[0].combo).toBe(true);
        expect(state.simpleFilterFields[0].fieldId).toBe(1);
    });

    it('Remove Simple Filter', () => {
        let testAction = {
            type: "REMOVE_SIMPLE_FILTER_FIELD",
            id: 1
        };

        let state = queryform({simpleFilterFields: [{fieldId: 1, combo: false}]}, testAction);
        expect(state).toExist();
        expect(state.simpleFilterFields).toExist();
        expect(state.simpleFilterFields.length).toBe(0);
    });

    it('Remove All Simple Filter', () => {
        let testAction = {
            type: "REMOVE_ALL_SIMPLE_FILTER_FIELDS"
        };

        let state = queryform({simpleFilterFields: [{fieldId: 1, combo: false}]}, testAction);
        expect(state).toExist();
        expect(state.simpleFilterFields).toExist();
        expect(state.simpleFilterFields.length).toBe(0);
    });
    it('set autocomplete mode', () => {
        let testAction = {
            type: SET_AUTOCOMPLETE_MODE,
            status: true
        };

        let initialState = {
            filterFields: [],
            autocompleteEnabled: false
        };

        let state = queryform(initialState, testAction);
        expect(state).toExist();

        expect(state.autocompleteEnabled).toBe(true);

    });
    it('toggle autocomplete mode', () => {
        let testAction = {
            type: TOGGLE_AUTOCOMPLETE_MENU,
            rowId: 100,
            status: true
        };

        let initialState = {
            filterFields: [{
                rowId: 100,
                openAutocompleteMenu: false
            }],
            openAutocompleteMenu: false
        };

        let state = queryform(initialState, testAction);
        expect(state).toExist();

        expect(state.filterFields[0].openAutocompleteMenu).toBe(true);

    });
    it('toggle crosslayer', () => {
        let action = expandCrossLayerFilterPanel(true);
        let newState = queryform(undefined, action);
        expect(newState.crossLayerExpanded).toBe(true);
    });
    it('toggle crosslayer', () => {
        let action = expandCrossLayerFilterPanel(true);
        let newState = queryform(undefined, action);
        expect(newState.crossLayerExpanded).toBe(true);
    });
    it('test setCrossLayerFilterParameter', () => {
        let action = setCrossLayerFilterParameter("test", "TEST");
        let newState = queryform(undefined, action);
        expect(newState.crossLayerFilter.test).toBe("TEST");
    });
    it('test addCrossLayerFilterField, updateCrossLayerFilterField, removeCrossLayerFilterField', () => {
        let action = addCrossLayerFilterField({attribute: "a"});
        let newState = queryform(undefined, action);
        expect(newState.crossLayerFilter.collectGeometries.queryCollection.filterFields.length).toBe(1);
        const rowId = newState.crossLayerFilter.collectGeometries.queryCollection.filterFields[0].rowId;
        newState = queryform(newState, updateCrossLayerFilterField(rowId, "test", "test", "TYPE"));
        expect(newState.crossLayerFilter.collectGeometries.queryCollection.filterFields.length).toBe(1);
        expect(newState.crossLayerFilter.collectGeometries.queryCollection.filterFields[0].test).toBe("test");
        expect(newState.crossLayerFilter.collectGeometries.queryCollection.filterFields[0].type).toBe("TYPE");
        newState = queryform(newState, removeCrossLayerFilterField(rowId));
        expect(newState.crossLayerFilter.collectGeometries.queryCollection.filterFields.length).toBe(0);
    });
    it('test resetCrossLayerFilter', () => {
        let action = resetCrossLayerFilter();
        let newState = queryform({crossLayerFilter: {attribute: "ATTRIBUTE"}}, action);
        expect(newState.crossLayerFilter.attribute).toBe("ATTRIBUTE");
    });
    it('test loadFilter', () => {
        const newFilter = {
            crossLayerFilter: {
                collectGeometries: {
                    queryCollection: {

                    }
                }
            },
            spatialField: {
                method: "BBOX",
                operation: "DWITHIN",
                geometry: '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-635956.0753326667,5466776.262955805],[-635956.0753326667,4723196.8517976105],[-29351.81886150781,4723196.8517976105],[-29351.81886150781,5466776.262955805],[-635956.0753326667,5466776.262955805]]]},"properties":null}'
            }

        };
        const initialState = {
            crossLayerFilter: {
                attribute: "ATTRIBUTE1"
            },
            spatialField: {
                attribute: "GEOMETRY"
            }
        };
        let action = loadFilter(newFilter);
        let newState = queryform(initialState, action);
        expect(newState.crossLayerFilter.attribute).toBe("ATTRIBUTE1");
        expect(newState.spatialField.attribute).toBe("GEOMETRY");
        expect(newState.spatialField.method).toBe("BBOX");
    });
    it('attribute property on load an undefied filter', () => {
        const initialState = {
            spatialField: {
                attribute: "GEOMETRY",
                operation: "INTERSECTS"
            },
            crossLayerFilter: {
                attribute: "GEOMETRY1"
            }
        };
        let action = loadFilter();
        let newState = queryform(initialState, action);
        expect(newState.crossLayerFilter.attribute).toBe("GEOMETRY1");
        expect(newState.spatialField.attribute).toBe("GEOMETRY");
        expect(newState.spatialField.operation).toBe("INTERSECTS");
    });
    /* it('Open Zones Menu', () => {
        let testAction = {
            type: "OPEN_MENU",
            active: true,
            id: 1
        };

        const initialState = {
            spatialField: {
                method: "ZONE",
                attribute: "the_geom",
                operation: "INTERSECTS",
                geometry: null,
                zoneFields: [{
                    id: 1,
                    url: "http://localhost:8080/",
                    typeName: "typeName1",
                    values: featureCollection.features,
                    value: null,
                    valueField: "properties.attr1",
                    textField: "properties.attr2",
                    searchText: "*",
                    searchMethod: "ilike",
                    searchAttribute: "att2",
                    label: "Attribute"
                }]
            }
        };

        let state = queryform(initialState, testAction);
        expect(state).toExist();
        expect(state.spatialField).toExist();
        expect(state.spatialField.zoneFields[0].open).toBe(true);
    });*/
});
