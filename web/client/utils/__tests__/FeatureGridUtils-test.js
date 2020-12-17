/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';
import {updatePages, gridUpdateToQueryUpdate} from '../FeatureGridUtils';


describe('FeatureGridUtils', () => {
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
});
