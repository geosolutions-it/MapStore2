/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from "react";
import ReactDOM from "react-dom";
import expect from 'expect';

import {
    updatePages,
    gridUpdateToQueryUpdate,
    getAttributesList,
    getAttributesNames,
    featureTypeToGridColumns,
    supportsFeatureEditing,
    areLayerFeaturesEditable
} from '../FeatureGridUtils';


describe('FeatureGridUtils', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(
            document.getElementById("container")
        );
        document.body.innerHTML = "";
        setTimeout(done);
    });
    it('Test updatePages when needPages * size is less then features', () => {
        const oldFeatures = Array(350);
        const features = Array(60);

        const result = {
            features
        };
        const requestOptions = {
            endPage: 99,
            startPage: 95
        };
        const oldData = {
            pages: [
                2330,
                2340,
                2350,
                2360,
                2370,
                3190,
                3200,
                3210,
                3220,
                1020,
                1030,
                1040,
                1050,
                1060
            ],
            features: oldFeatures
        };
        const paginationOptions = {
            size: 10,
            maxStoredPages: 10,
            startIndex: 960
        };
        const {pages, features: newFeatures } = updatePages(result, requestOptions, oldData, paginationOptions);
        expect(pages).toBeTruthy();
        expect(newFeatures).toBeTruthy();
        expect(newFeatures.length).toBe(120);
    });

    it('gridUpdateToQueryUpdate', () => {
        const gridUpdate1 = {
            type: "geometry",
            attribute: "ATTRIBUTE",
            operator: "OPERATOR",
            value: {attribute: "ATTRIBUTE", method: "METHOD_1"},
            rawValue: "RAWVAL"
        };
        const queryUpdateFilter = gridUpdateToQueryUpdate(gridUpdate1, {});
        expect(queryUpdateFilter.spatialField).toEqual(gridUpdate1.value);
        expect(queryUpdateFilter.filterFields).toBe(undefined);

        // value as array
        const gridUpdate2 = {
            ...gridUpdate1,
            value: [{attribute: "ATTRIBUTE", method: "METHOD_1"}, {attribute: "ATTRIBUTE", method: "METHOD_2"}]
        };
        const queryUpdateFilter2 = gridUpdateToQueryUpdate(gridUpdate2, {});
        expect(queryUpdateFilter2.spatialField).toEqual(gridUpdate2.value);
        expect(queryUpdateFilter2.filterFields).toBe(undefined);
        expect(queryUpdateFilter2.spatialFieldOperator).toBe("OR");
    });
    it('gridUpdateToQueryUpdate with multiple strings', () => {
        const gridUpdate1 = {
            type: "string",
            attribute: "ATTRIBUTE",
            operator: "ilike",
            value: "str1, str2",
            rawValue: "str1, str2"
        };
        const queryUpdateFilter = gridUpdateToQueryUpdate(gridUpdate1, {});
        expect(queryUpdateFilter.filterFields.length).toBe(2);
        expect(queryUpdateFilter.groupFields.length).toBe(1);
        expect(queryUpdateFilter.groupFields[0].logic).toBe("OR");
        expect(queryUpdateFilter.filterFields[0].value).toBe("str1");
        expect(queryUpdateFilter.filterFields[0].operator).toBe("ilike");
        expect(queryUpdateFilter.filterFields[1].value).toBe("str2");
        expect(queryUpdateFilter.filterFields[1].operator).toBe("ilike");
    });
    it('gridUpdateToQueryUpdate with multiple numbers', () => {
        const gridUpdate1 = {
            type: "number",
            attribute: "ATTRIBUTE",
            operator: null,
            value: "> 300, 69, < 10",
            rawValue: "> 300, 69, < 10"
        };
        const queryUpdateFilter = gridUpdateToQueryUpdate(gridUpdate1, {});
        expect(queryUpdateFilter.filterFields.length).toBe(3);
        expect(queryUpdateFilter.groupFields.length).toBe(1);
        expect(queryUpdateFilter.groupFields[0].logic).toBe("OR");
        expect(queryUpdateFilter.filterFields[0].value).toBe(300);
        expect(queryUpdateFilter.filterFields[0].operator).toBe(">");
        expect(queryUpdateFilter.filterFields[1].value).toBe(69);
        expect(queryUpdateFilter.filterFields[1].operator).toBe("=");
        expect(queryUpdateFilter.filterFields[2].value).toBe(10);
        expect(queryUpdateFilter.filterFields[2].operator).toBe("<");

    });
    it('gridUpdateToQueryUpdate with multiple numbers and multiple strings', () => {
        const gridUpdate1 = {
            type: "number",
            attribute: "ATTR_2_NUMERIC",
            operator: null,
            value: "> 300, 69, < 10",
            rawValue: "> 300, 69, < 10"
        };

        const oldFilterObject = {
            "groupFields": [{"id": "ATTR_1_STRING", "logic": "OR", "groupId": 1, "index": 0}],
            "filterFields": [
                {
                    "attribute": "ATTR_1_STRING",
                    "rowId": 1608204971082,
                    "type": "string",
                    "groupId": "ATTR_1_STRING",
                    "operator": "ilike",
                    "value": "cat"
                },
                {"attribute": "ATTR_1_STRING",
                    "rowId": 1608204971082,
                    "type": "string",
                    "groupId": "ATTR_1_STRING",
                    "operator": "ilike",
                    "value": "to"
                }
            ]};

        const queryUpdateFilter = gridUpdateToQueryUpdate(gridUpdate1, oldFilterObject);
        expect(queryUpdateFilter.filterFields.length).toBe(5);
        expect(queryUpdateFilter.groupFields.length).toBe(2);
        expect(queryUpdateFilter.groupFields[0].id).toBe("ATTR_1_STRING");
        expect(queryUpdateFilter.groupFields[0].logic).toBe("OR");
        expect(queryUpdateFilter.groupFields[0].id).toBe("ATTR_1_STRING");
        expect(queryUpdateFilter.groupFields[1].logic).toBe("OR");
        expect(queryUpdateFilter.filterFields[0].value).toBe("cat");
        expect(queryUpdateFilter.filterFields[0].operator).toBe("ilike");
        expect(queryUpdateFilter.filterFields[1].value).toBe("to");
        expect(queryUpdateFilter.filterFields[1].operator).toBe("ilike");
        expect(queryUpdateFilter.filterFields[2].value).toBe(300);
        expect(queryUpdateFilter.filterFields[2].operator).toBe(">");
        expect(queryUpdateFilter.filterFields[3].value).toBe(69);
        expect(queryUpdateFilter.filterFields[3].operator).toBe("=");
        expect(queryUpdateFilter.filterFields[4].value).toBe(10);
        expect(queryUpdateFilter.filterFields[4].operator).toBe("<");
    });
    it('gridUpdateToQueryUpdate with cql filters in filters', () => {
        const gridUpdate1 = {
            filters: [{format: 'cql', body: 'STATE_NAME = \'Texas\''}]
        };

        const oldFilterObject = {
            "groupFields": [{"id": "ATTR_1_STRING", "logic": "OR", "groupId": 1, "index": 0}],
            "filterFields": [
                {
                    "attribute": "ATTR_1_STRING",
                    "rowId": 1608204971082,
                    "type": "string",
                    "groupId": "ATTR_1_STRING",
                    "operator": "ilike",
                    "value": "cat"
                },
                {"attribute": "ATTR_1_STRING",
                    "rowId": 1608204971082,
                    "type": "string",
                    "groupId": "ATTR_1_STRING",
                    "operator": "ilike",
                    "value": "to"
                }
            ]};
        const queryUpdateFilter = gridUpdateToQueryUpdate(gridUpdate1, oldFilterObject);
        expect(queryUpdateFilter.filters.length).toBe(1);
        expect(queryUpdateFilter.filters[0].format).toBe('cql');
        expect(queryUpdateFilter.filters[0].body).toBe('STATE_NAME = \'Texas\'');
        expect(queryUpdateFilter.filterFields.length).toBe(2);
    });
    it('getAttributesList', () => {
        const attributes = [
            {
                "label": "ATTR1",
                "attribute": "ATTR1",
                "type": "number",
                "valueId": "id",
                "valueLabel": "name",
                "values": []
            },
            {
                "label": "ATTR2",
                "attribute": "ATTR2",
                "type": "string",
                "valueId": "id",
                "valueLabel": "name",
                "values": []
            },
            {
                "label": "ATTR3",
                "attribute": "ATTR3",
                "type": "number",
                "valueId": "id",
                "valueLabel": "name",
                "values": []
            },
            {
                "label": "ATTR4",
                "attribute": "ATTR4",
                "type": "number",
                "valueId": "id",
                "valueLabel": "name",
                "values": []
            }
        ];
        const customAttributesSettings = {
            ATTR2: {
                hide: true
            },
            ATTR3: {
                hide: false
            },
            ATTR4: {
                hide: true
            }
        };

        const customSettings = getAttributesList(attributes, customAttributesSettings);
        const noSettings = getAttributesList(attributes, {});
        const allDeselected = getAttributesList(attributes, attributes.reduce((prev, attr) => {
            prev[attr.attribute] = {hide: true};
            return prev;
        }, {}));

        expect(customSettings).toEqual(['ATTR1', 'ATTR3']);
        expect(noSettings).toBe(undefined);
        expect(allDeselected).toEqual([]);
    });
    it('getAttributesNames', () => {
        const attributes = ['ATTR1', 'ATTR2', 'ATTR3'];
        expect(getAttributesNames(attributes)).toEqual(['ATTR1', 'ATTR2', 'ATTR3']);
    });
    it('getAttributesNames from array of object', () => {
        const attributes = [
            {
                "label": "ATTR1",
                "attribute": "ATTR1",
                "name": "ATTR1",
                "title": "Attribute 1",
                "description": "Some attribute 1",
                "type": "number",
                "valueId": "id",
                "valueLabel": "name",
                "values": []
            }
        ];
        expect(getAttributesNames(attributes)).toEqual(['ATTR1']);
    });
    it('test featureTypeToGridColumns', () => {
        const describe = {featureTypes: [{properties: [{name: 'Test1', type: "xsd:number"}, {name: 'Test2', type: "xsd:number"}]}]};
        const columnSettings = {name: 'Test1', hide: false};
        const options = [{name: 'Test1', title: 'Some title', description: 'Some description'}];
        const featureGridColumns = featureTypeToGridColumns(describe, columnSettings, [], {options});
        expect(featureGridColumns.length).toBe(2);
        featureGridColumns.forEach((fgColumns, index) => {
            if (index === 0) {
                expect(fgColumns.description).toBe('Some description');
                expect(fgColumns.title).toBe('Some title');
                expect(fgColumns.showTitleTooltip).toBeTruthy();
            }
            expect(['Test1', 'Test2'].includes(fgColumns.name)).toBeTruthy();
            expect(fgColumns.resizable).toBeTruthy();
            expect(fgColumns.filterable).toBeTruthy();
            expect(fgColumns.editable).toBeFalsy();
            expect(fgColumns.sortable).toBeTruthy();
            expect(fgColumns.width).toBe(200);
        });
    });
    it('test featureTypeToGridColumns with headerRenderer, filterRenderer, formatter and editor', () => {
        const DUMMY = () => {};
        const describe = {featureTypes: [{properties: [{name: 'Test1', type: "xsd:number"}, {name: 'Test2', type: "xsd:number"}]}]};
        const columnSettings = {name: 'Test1', hide: false};
        const options = [{name: 'Test1', title: 'Some title', description: 'Some description'}];
        const featureGridColumns = featureTypeToGridColumns(describe, columnSettings, [], {options}, {getHeaderRenderer: () => DUMMY, getFilterRenderer: () => DUMMY, getFormatter: () => DUMMY, getEditor: () => DUMMY});
        expect(featureGridColumns.length).toBe(2);
        featureGridColumns.forEach((fgColumns, index) => {
            if (index === 0) {
                expect(fgColumns.description).toBe('Some description');
                expect(fgColumns.title).toBe('Some title');
                expect(fgColumns.showTitleTooltip).toBeTruthy();
            }
            expect(['Test1', 'Test2'].includes(fgColumns.name)).toBeTruthy();
            expect(fgColumns.resizable).toBeTruthy();
            expect(fgColumns.filterable).toBeTruthy();
            expect(fgColumns.editable).toBeFalsy();
            expect(fgColumns.sortable).toBeTruthy();
            expect(fgColumns.width).toBe(200);
            expect(fgColumns.headerRenderer).toBeTruthy();
            expect(fgColumns.filterRenderer).toBeTruthy();
            expect(fgColumns.formatter).toBeTruthy();
            expect(fgColumns.editor).toBeTruthy();
        });
    });
    it('featureTypeToGridColumns with fields', () => {
        const describe = {featureTypes: [{properties: [{name: 'Test1', type: "xsd:number"}, {name: 'Test2', type: "xsd:number"}]}]};
        const columnSettings = {name: 'Test1', hide: false};
        const fields = [{name: 'Test1', type: "xsd:number", alias: 'Test1 alias'}];
        const featureGridColumns = featureTypeToGridColumns(describe, columnSettings, fields);
        expect(featureGridColumns.length).toBe(2);
        expect(featureGridColumns[0].title).toBe('Test1 alias');
        // test alias empty string
        expect(featureTypeToGridColumns(describe, columnSettings, [{name: "Test1", alias: ""}])[0].title).toEqual('Test1');
        // test localized alias
        expect(featureTypeToGridColumns(describe, columnSettings, [{name: "Test1", alias: {"default": "XX"}}])[0].title.default).toEqual('XX');
        // test localized alias with empty default
        expect(featureTypeToGridColumns(describe, columnSettings, [{name: "Test1", alias: {"default": ""}}])[0].title.default).toEqual('Test1');

    });
    it('featureTypeToGridColumns formatters', () => {
        const DUMMY = () => {};
        const formatterWrapper = () => (<div>testtttt</div>);
        const describe = {featureTypes: [{properties: [{name: 'Test1', type: "xsd:number"}, {name: 'Test2', type: "xsd:number"}]}]};
        const columnSettings = {name: 'Test1', hide: false};
        const options = [{name: 'Test1', title: 'Some title', description: 'Some description'}];
        const featureGridColumns = featureTypeToGridColumns(describe, columnSettings, [], {options}, {getHeaderRenderer: () => DUMMY, getFilterRenderer: () => DUMMY, getFormatter: () => formatterWrapper, getEditor: () => DUMMY});
        expect(featureGridColumns.length).toBe(2);
        featureGridColumns.forEach((fgColumns)=>{
            const Formatter = fgColumns.formatter;
            ReactDOM.render(
                <Formatter/>,
                document.getElementById("container")
            );
            expect(document.getElementById("container").innerHTML).toExist();
        });

    });
    describe("supportsFeatureEditing", () => {
        it('test supportsFeatureEditing with valid layer type', () => {
            let layer = {type: "wms", id: "test"};
            expect(supportsFeatureEditing(layer)).toBeTruthy();
            layer.type = "wfs";
            expect(supportsFeatureEditing(layer)).toBeTruthy();
        });
        it('test supportsFeatureEditing with invalid layer type', () => {
            const layer = {type: "wmts", id: "test"};
            expect(supportsFeatureEditing(layer)).toBeFalsy();
        });
    });
    describe("areLayerFeaturesEditable", () => {
        it("test areLayerFeaturesEditable with valid layer type", () => {
            expect(areLayerFeaturesEditable({type: "wms"})).toBeTruthy();
        });
        it("test areLayerFeaturesEditable with valid layer type and disableFeaturesEditing", () => {
            expect(areLayerFeaturesEditable({type: "wms", disableFeaturesEditing: true})).toBeFalsy();
        });
        it("test areLayerFeaturesEditable with invalid layer type", () => {
            expect(areLayerFeaturesEditable({type: "wmts"})).toBeFalsy();
        });
    });
});
