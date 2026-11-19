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
    isPrimaryKeyField
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
    it('gridUpdateToQueryUpdate with isNull operator', () => {
        const gridUpdate1 = {
            type: "number",
            attribute: "ATTRIBUTE",
            operator: "isNull",
            value: "",
            rawValue: ""
        };
        const queryUpdateFilter = gridUpdateToQueryUpdate(gridUpdate1, {});
        expect(queryUpdateFilter.filterFields.length).toBe(1);
        expect(queryUpdateFilter.groupFields.length).toBe(1);
        expect(queryUpdateFilter.groupFields[0].logic).toBe("AND");
        expect(queryUpdateFilter.filterFields[0].value).toBe('');
        expect(queryUpdateFilter.filterFields[0].operator).toBe("isNull");

    });
    it('gridUpdateToQueryUpdate with range operator', () => {
        const gridUpdate1 = {
            type: "date",
            attribute: "ATTR_2_DATE",
            operator: "><",
            value: "2023-01-01 >< 2023-01-10",
            rawValue: "2023-01-01 >< 2023-01-10"
        };

        const queryUpdateFilter = gridUpdateToQueryUpdate(gridUpdate1, {});
        expect(queryUpdateFilter.filterFields.length).toBe(1);
        expect(queryUpdateFilter.groupFields.length).toBe(1);
        expect(queryUpdateFilter.groupFields[0].logic).toBe("AND");
        expect(queryUpdateFilter.filterFields[0].value).toBe('2023-01-01 >< 2023-01-10');
        expect(queryUpdateFilter.filterFields[0].operator).toBe("><");

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
        const schema = {attributes: [{name: 'Test1', localType: 'number'}, {name: 'Test2', localType: 'number'}]};
        const columnSettings = {name: 'Test1', hide: false};
        const options = [{name: 'Test1', title: 'Some title', description: 'Some description'}];
        const featureGridColumns = featureTypeToGridColumns(schema, {}, columnSettings, [], {options});
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
        const schema = {attributes: [{name: 'Test1', localType: 'number'}, {name: 'Test2', localType: 'number'}]};
        const columnSettings = {name: 'Test1', hide: false};
        const options = [{name: 'Test1', title: 'Some title', description: 'Some description'}];
        const featureGridColumns = featureTypeToGridColumns(schema, {}, columnSettings, [], {options}, {getHeaderRenderer: () => DUMMY, getFilterRenderer: () => DUMMY, getFormatter: () => DUMMY, getEditor: () => DUMMY});
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
    it('test featureTypeToGridColumns with headerRenderer, filterRenderer, formatter and editor for attribute table', () => {
        const DUMMY = () => {};
        const schema = {attributes: [{name: 'Test1', localType: 'number'}, {name: 'Test2', localType: 'number'}]};
        const columnSettings = {name: 'Test1', hide: false};
        const options = [{name: 'Test1', title: 'Some title', description: 'Some description'}];
        const featureGridColumns = featureTypeToGridColumns(schema, {}, columnSettings, [], {options}, {getHeaderRenderer: () => DUMMY, getFilterRenderer: () => DUMMY, getFormatter: () => DUMMY, getEditor: () => DUMMY, isWithinAttrTbl: true});
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
            expect(fgColumns.width).toBe(300);          // for attribute table
            expect(fgColumns.headerRenderer).toBeTruthy();
            expect(fgColumns.filterRenderer).toBeTruthy();
            expect(fgColumns.formatter).toBeTruthy();
            expect(fgColumns.editor).toBeTruthy();
        });
    });
    it('featureTypeToGridColumns with fields', () => {
        const schema = {attributes: [{name: 'Test1', localType: 'number'}, {name: 'Test2', localType: 'number'}]};
        const columnSettings = {name: 'Test1', hide: false};
        const fields = [{name: 'Test1', type: "xsd:number", alias: 'Test1 alias'}];
        const featureGridColumns = featureTypeToGridColumns(schema, {}, columnSettings, fields);
        expect(featureGridColumns.length).toBe(2);
        expect(featureGridColumns[0].title).toBe('Test1 alias');
        // test alias empty string
        expect(featureTypeToGridColumns(schema, {}, columnSettings, [{name: "Test1", alias: ""}])[0].title).toEqual('Test1');
        // test localized alias
        expect(featureTypeToGridColumns(schema, {}, columnSettings, [{name: "Test1", alias: {"default": "XX"}}])[0].title.default).toEqual('XX');
        // test localized alias with empty default
        expect(featureTypeToGridColumns(schema, {}, columnSettings, [{name: "Test1", alias: {"default": ""}}])[0].title.default).toEqual('Test1');

    });
    it('featureTypeToGridColumns formatters', () => {
        const DUMMY = () => {};
        const formatterWrapper = () => (<div>testtttt</div>);
        const schema = {attributes: [{name: 'Test1', localType: 'number'}, {name: 'Test2', localType: 'number'}]};
        const columnSettings = {name: 'Test1', hide: false};
        const options = [{name: 'Test1', title: 'Some title', description: 'Some description'}];
        const featureGridColumns = featureTypeToGridColumns(schema, {}, columnSettings, [], {options}, {getHeaderRenderer: () => DUMMY, getFilterRenderer: () => DUMMY, getFormatter: () => formatterWrapper, getEditor: () => DUMMY});
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
    it('featureTypeToGridColumns with featurePropertiesJSONSchema', () => {
        const schema = {attributes: [{name: 'Test1', localType: 'number'}, {name: 'Test2', localType: 'string'}]};
        const featurePropertiesJSONSchema = {
            properties: {
                Test1: { type: 'number', minimum: 0, maximum: 100 },
                Test2: { type: 'string', minLength: 1, maxLength: 50 }
            }
        };
        const featureGridColumns = featureTypeToGridColumns(schema, featurePropertiesJSONSchema, {}, []);
        expect(featureGridColumns.length).toBe(2);
        expect(featureGridColumns[0].schema).toEqual({ type: 'number', minimum: 0, maximum: 100 });
        expect(featureGridColumns[1].schema).toEqual({ type: 'string', minLength: 1, maxLength: 50 });
    });
    it('featureTypeToGridColumns with schemaRequired', () => {
        const schema = {attributes: [{name: 'Test1', localType: 'number'}, {name: 'Test2', localType: 'string'}, {name: 'Test3', type: "xsd:boolean"}]};
        const featurePropertiesJSONSchema = {
            properties: {
                Test1: { type: 'number' },
                Test2: { type: 'string' },
                Test3: { type: 'boolean' }
            },
            required: ['Test1', 'Test2']
        };
        const featureGridColumns = featureTypeToGridColumns(schema, featurePropertiesJSONSchema, {}, []);
        expect(featureGridColumns.length).toBe(3);
        expect(featureGridColumns[0].schemaRequired).toBeTruthy(); // Test1 is required
        expect(featureGridColumns[1].schemaRequired).toBeTruthy(); // Test2 is required
        expect(featureGridColumns[2].schemaRequired).toBeFalsy(); // Test3 is not required
    });
    it('featureTypeToGridColumns with primaryKeyAttributes', () => {
        const schema = {attributes: [{name: 'fid', localType: 'string'}, {name: 'name', localType: 'string'}, {name: 'ogc_fid', localType: 'number'}]};
        const featurePropertiesJSONSchema = {
            properties: {
                fid: { type: 'string' },
                name: { type: 'string' },
                ogc_fid: { type: 'number' }
            }
        };
        const featureGridColumns = featureTypeToGridColumns(schema, featurePropertiesJSONSchema, {}, [], {primaryKeyAttributes: ['fid', 'ogc_fid']});
        expect(featureGridColumns.length).toBe(3);
        expect(featureGridColumns[0].isPrimaryKey).toBeTruthy(); // fid is primary key
        expect(featureGridColumns[1].isPrimaryKey).toBeFalsy(); // name is not primary key
        expect(featureGridColumns[2].isPrimaryKey).toBeTruthy(); // ogc_fid is primary key
    });
    it('featureTypeToGridColumns with primaryKeyAttributes case insensitive', () => {
        const schema = {attributes: [{name: 'FID', localType: 'string'}, {name: 'name', localType: 'string'}]};
        const featurePropertiesJSONSchema = {
            properties: {
                FID: { type: 'string' },
                name: { type: 'string' }
            }
        };
        const featureGridColumns = featureTypeToGridColumns(schema, featurePropertiesJSONSchema, {}, [], {primaryKeyAttributes: ['fid']});
        expect(featureGridColumns.length).toBe(2);
        expect(featureGridColumns[0].isPrimaryKey).toBeTruthy(); // FID matches 'fid' (case insensitive)
        expect(featureGridColumns[1].isPrimaryKey).toBeFalsy(); // name is not primary key
    });
    it('featureTypeToGridColumns with empty primaryKeyAttributes', () => {
        const schema = {attributes: [{name: 'fid', localType: 'string'}, {name: 'name', localType: 'string'}]};
        const featurePropertiesJSONSchema = {
            properties: {
                fid: { type: 'string' },
                name: { type: 'string' }
            }
        };
        const featureGridColumns = featureTypeToGridColumns(schema, featurePropertiesJSONSchema, {}, [], {primaryKeyAttributes: []});
        expect(featureGridColumns.length).toBe(2);
        expect(featureGridColumns[0].isPrimaryKey).toBeFalsy(); // No primary keys defined
        expect(featureGridColumns[1].isPrimaryKey).toBeFalsy();
    });
    it('featureTypeToGridColumns with featurePropertiesJSONSchema, schemaRequired, and primaryKeyAttributes combined', () => {
        const schema = {attributes: [{name: 'id', localType: 'number'}, {name: 'name', localType: 'string'}, {name: 'description', localType: 'string'}]};
        const featurePropertiesJSONSchema = {
            properties: {
                id: { type: 'number', minimum: 1 },
                name: { type: 'string', minLength: 1 },
                description: { type: 'string' }
            },
            required: ['id', 'name']
        };
        const featureGridColumns = featureTypeToGridColumns(schema, featurePropertiesJSONSchema, {}, [], {primaryKeyAttributes: ['id']});
        expect(featureGridColumns.length).toBe(3);

        // Test id column
        expect(featureGridColumns[0].name).toBe('id');
        expect(featureGridColumns[0].schema).toEqual({ type: 'number', minimum: 1 });
        expect(featureGridColumns[0].schemaRequired).toBeTruthy();
        expect(featureGridColumns[0].isPrimaryKey).toBeTruthy();

        // Test name column
        expect(featureGridColumns[1].name).toBe('name');
        expect(featureGridColumns[1].schema).toEqual({ type: 'string', minLength: 1 });
        expect(featureGridColumns[1].schemaRequired).toBeTruthy();
        expect(featureGridColumns[1].isPrimaryKey).toBeFalsy();

        // Test description column
        expect(featureGridColumns[2].name).toBe('description');
        expect(featureGridColumns[2].schema).toEqual({ type: 'string' });
        expect(featureGridColumns[2].schemaRequired).toBeFalsy();
        expect(featureGridColumns[2].isPrimaryKey).toBeFalsy();
    });
    it('featureTypeToGridColumns with featurePropertiesJSONSchema undefined', () => {
        const schema = {attributes: [{name: 'Test1', localType: 'number'}]};
        const featureGridColumns = featureTypeToGridColumns(schema, undefined, {}, []);
        expect(featureGridColumns.length).toBe(1);
        expect(featureGridColumns[0].schema).toBeFalsy();
        expect(featureGridColumns[0].schemaRequired).toBeFalsy();
    });
    it('featureTypeToGridColumns with featurePropertiesJSONSchema null', () => {
        const schema = {attributes: [{name: 'Test1', localType: 'number'}]};
        const featureGridColumns = featureTypeToGridColumns(schema, null, {}, []);
        expect(featureGridColumns.length).toBe(1);
        expect(featureGridColumns[0].schema).toBeFalsy();
        expect(featureGridColumns[0].schemaRequired).toBeFalsy();
    });
    it('featureTypeToGridColumns with getEditor receiving schema parameter', () => {
        const featureSchema = {attributes: [{name: 'Test1', localType: 'number'}]};
        const featurePropertiesJSONSchema = {
            properties: {
                Test1: { type: 'number', minimum: 0, maximum: 100 }
            }
        };
        const receivedSchemas = [];
        const getEditor = (desc, field, schema) => {
            receivedSchemas.push({ name: desc.name, schema });
            return () => {};
        };
        featureTypeToGridColumns(featureSchema, featurePropertiesJSONSchema, {}, [], {}, {getEditor});
        expect(receivedSchemas.length).toBe(1);
        expect(receivedSchemas[0].name).toBe('Test1');
        expect(receivedSchemas[0].schema).toEqual({ type: 'number', minimum: 0, maximum: 100 });
    });
    describe('isPrimaryKeyField', () => {
        it('should return false for empty fieldName', () => {
            expect(isPrimaryKeyField('')).toBeFalsy();
            expect(isPrimaryKeyField(null)).toBeFalsy();
            expect(isPrimaryKeyField(undefined)).toBeFalsy();
        });
        it('should return false when customPrimaryKeyNames is empty or undefined', () => {
            expect(isPrimaryKeyField('fid', [])).toBeFalsy();
            expect(isPrimaryKeyField('fid', undefined)).toBeFalsy();
            expect(isPrimaryKeyField('fid')).toBeFalsy();
        });
        it('should return false when fieldName does not match any custom primary key', () => {
            expect(isPrimaryKeyField('fid', ['ogc_fid'])).toBeFalsy();
            expect(isPrimaryKeyField('name', ['fid', 'ogc_fid'])).toBeFalsy();
            expect(isPrimaryKeyField('description', ['id', 'gid'])).toBeFalsy();
        });
        it('should be case-insensitive when matching field names', () => {
            expect(isPrimaryKeyField('FID', ['fid'])).toBeTruthy();
            expect(isPrimaryKeyField('fid', ['FID'])).toBeTruthy();
            expect(isPrimaryKeyField('OGC_FID', ['ogc_fid'])).toBeTruthy();
            expect(isPrimaryKeyField('ogc_fid', ['OGC_FID'])).toBeTruthy();
            expect(isPrimaryKeyField('Id', ['id'])).toBeTruthy();
            expect(isPrimaryKeyField('ID', ['Id'])).toBeTruthy();
        });
        it('should handle multiple custom primary keys', () => {
            const primaryKeys = ['fid', 'ogc_fid', 'id', 'gid', 'objectid'];
            expect(isPrimaryKeyField('fid', primaryKeys)).toBeTruthy();
            expect(isPrimaryKeyField('ogc_fid', primaryKeys)).toBeTruthy();
            expect(isPrimaryKeyField('id', primaryKeys)).toBeTruthy();
            expect(isPrimaryKeyField('gid', primaryKeys)).toBeTruthy();
            expect(isPrimaryKeyField('objectid', primaryKeys)).toBeTruthy();
            expect(isPrimaryKeyField('name', primaryKeys)).toBeFalsy();
        });
    });
});
