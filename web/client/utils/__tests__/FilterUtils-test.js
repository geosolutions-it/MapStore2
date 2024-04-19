/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    toCQLFilter,
    toOGCFilterParts,
    toOGCFilter,
    checkOperatorValidity,
    getGetFeatureBase,
    processOGCCrossLayerFilter,
    cqlBooleanField,
    cqlStringField,
    ogcStringField,
    ogcBooleanField,
    getCrossLayerCqlFilter,
    composeAttributeFilters,
    ogcArrayField,
    cqlArrayField,
    processOGCFilterFields,
    processOGCSimpleFilterField,
    processCQLFilterFields,
    wrapIfNoWildcards,
    mergeFiltersToOGC,
    convertFiltersToOGC,
    convertFiltersToCQL,
    isFilterEmpty
} from '../FilterUtils';


describe('FilterUtils', () => {
    it('Calculate OGC filter', () => {
        let filterObj = {
            filterFields: [{
                attribute: "attribute1",
                groupId: 1,
                exception: null,
                operator: "=",
                rowId: "1",
                type: "list",
                value: "value1"
            }, {
                attribute: "attribute2",
                exception: null,
                groupId: 1,
                operator: "=",
                rowId: "2",
                type: "list",
                value: "value2"
            },
            {
                attribute: "attribute3",
                exception: null,
                groupId: 1,
                operator: "=",
                rowId: "3",
                type: "number",
                value: "value1"
            },
            {
                attribute: "attribute4",
                exception: null,
                operator: "><",
                groupId: 1,
                rowId: "4",
                type: "number",
                value: {lowBound: 10, upBound: 20}
            },
            {
                attribute: "attribute5",
                exception: null,
                operator: "isNull",
                groupId: 1,
                rowId: "5",
                type: "string",
                value: ''
            },
            {
                attribute: "attribute5",
                exception: null,
                operator: "ilike",
                groupId: 1,
                rowId: "6",
                type: "string",
                value: 'pa'
            }],
            groupFields: [{
                id: 1,
                index: 0,
                logic: "OR"
            }],
            spatialField: {
                groupId: 1,
                attribute: "the_geom",
                geometry: {
                    center: [1, 1],
                    coordinates: [
                        [1, 2],
                        [2, 3],
                        [3, 4],
                        [4, 5],
                        [5, 6]
                    ],
                    extent: [
                        1, 2, 3, 4, 5
                    ],
                    projection: "EPSG:4326",
                    radius: 1,
                    type: "Polygon"
                },
                method: "BBOX",
                operation: "INTERSECTS"
            }
        };

        let filter = toOGCFilter("ft_name_test", filterObj);
        expect(filter).toExist();
    });
    it('Calculate CQL filter', () => {
        let filterObj = {
            filterFields: [{
                groupId: 1,
                attribute: "attribute1",
                exception: null,
                operator: "=",
                rowId: "1",
                type: "list",
                value: "value1"
            }],
            groupFields: [{
                id: 1,
                index: 0,
                logic: "OR"
            }],
            spatialField: {
                groupId: 1,
                attribute: "the_geom",
                geometry: {
                    center: [1, 1],
                    coordinates: [[
                        [1, 2],
                        [2, 3],
                        [3, 4],
                        [4, 5],
                        [5, 6]
                    ]],
                    extent: [
                        1, 2, 3, 4, 5
                    ],
                    projection: "EPSG:4326",
                    radius: 1,
                    type: "Polygon"
                },
                method: "BBOX",
                operation: "INTERSECTS"
            }
        };

        let filter = toCQLFilter(filterObj);
        expect(filter).toExist();
        expect(filter).toBe("(\"attribute1\"='value1') AND (INTERSECTS(\"the_geom\",SRID=4326;Polygon((1 2, 2 3, 3 4, 4 5, 5 6, 1 2))))");
    });
    it('Calculate CQL filter without filter projection', () => {
        let filterObj = {
            filterFields: [{
                groupId: 1,
                attribute: "attribute1",
                exception: null,
                operator: "=",
                rowId: "1",
                type: "list",
                value: "value1"
            }],
            groupFields: [{
                id: 1,
                index: 0,
                logic: "OR"
            }],
            spatialField: {
                groupId: 1,
                attribute: "the_geom",
                geometry: {
                    center: [1, 1],
                    coordinates: [[
                        [1, 2],
                        [2, 3],
                        [3, 4],
                        [4, 5],
                        [5, 6]
                    ]],
                    extent: [
                        1, 2, 3, 4, 5
                    ],
                    radius: 1,
                    type: "Polygon"
                },
                method: "BBOX",
                operation: "INTERSECTS"
            }
        };

        let filter = toCQLFilter(filterObj);
        expect(filter).toExist();
        expect(filter).toBe("(\"attribute1\"='value1') AND (INTERSECTS(\"the_geom\",Polygon((1 2, 2 3, 3 4, 4 5, 5 6, 1 2))))");
    });
    it('Check for pagination wfs 1.1.0', () => {
        let filterObj = {
            pagination: {
                startIndex: 1,
                maxFeatures: 20
            },
            spatialField: {
                attribute: "the_geom",
                geometry: {
                    center: [1, 1],
                    coordinates: [
                        [1, 2],
                        [2, 3],
                        [3, 4],
                        [4, 5],
                        [5, 6]
                    ],
                    extent: [
                        1, 2, 3, 4, 5
                    ],
                    projection: "EPSG:4326",
                    radius: 1,
                    type: "Polygon"
                },
                method: "BBOX",
                operation: "INTERSECTS"
            }
        };

        let filter = toOGCFilter("ft_name_test", filterObj, "1.1.0");
        expect(filter.indexOf('maxFeatures="20"') !== -1).toBe(true);
        expect(filter.indexOf('startIndex="1"') !== -1).toBe(true);
    });

    it('Check for no oparation', () => {
        const versionOGC = "1.1.0";
        const nsplaceholder = "ogc";
        const objFilter = {
            featureTypeName: "topp:states",
            groupFields: [{
                id: 1,
                logic: "OR",
                index: 0
            }],
            filterFields: [],
            spatialField: {
                method: null,
                operation: "INTERSECTS",
                geometry: null,
                attribute: "the_geom"
            },
            pagination: {
                startIndex: 0,
                maxFeatures: 20
            },
            filterType: "OGC",
            ogcVersion: "1.1.0",
            sortOptions: null,
            crossLayerFilter: {
                attribute: "the_geom",
                collectGeometries: {
                    queryCollection: {
                        typeName: "topp:states",
                        filterFields: [],
                        geometryName: "the_geom",
                        groupFields: [{
                            id: 1,
                            index: 0,
                            logic: "OR"
                        }]
                    }
                }
            },
            hits: false
        };

        let filterParts = toOGCFilterParts(objFilter, versionOGC, nsplaceholder);
        expect(filterParts).toEqual([]);
    });
    it('Check  for options.cqlFilter add parts to the query', () => {
        const versionOGC = "1.1.0";
        const nsplaceholder = "ogc";
        const objFilter = {
            featureTypeName: "topp:states",
            groupFields: [{
                id: 1,
                logic: "OR",
                index: 0
            }],
            filterFields: [],
            spatialField: {
                method: null,
                operation: "INTERSECTS",
                geometry: null,
                attribute: "the_geom"
            },
            pagination: {
                startIndex: 0,
                maxFeatures: 20
            },
            filterType: "OGC",
            ogcVersion: "1.1.0",
            sortOptions: null,
            options: { cqlFilter: "prop = 'value'"},
            crossLayerFilter: {
                attribute: "the_geom",
                collectGeometries: {
                    queryCollection: {
                        typeName: "topp:states",
                        filterFields: [],
                        geometryName: "the_geom",
                        groupFields: [{
                            id: 1,
                            index: 0,
                            logic: "OR"
                        }]
                    }
                }
            },
            hits: false
        };

        let filterParts = toOGCFilterParts(objFilter, versionOGC, nsplaceholder);
        expect(filterParts[0]).toEqual('<ogc:PropertyIsEqualTo><ogc:PropertyName>prop</ogc:PropertyName><ogc:Literal>value</ogc:Literal></ogc:PropertyIsEqualTo>');
    });
    it('Check date field >< operator', () => {
        const versionOGC = "1.1.0";
        const nsplaceholder = "ogc";
        const startDate = "2000-01-01T00:00:00.000Z";
        const endDate = "3000-01-01T00:00:00.000Z";
        const objFilter = {
            featureTypeName: "topp:states",
            groupFields: [{
                id: 1,
                logic: "OR",
                index: 0
            }],
            filterFields: [{
                attribute: "attributeEmpty",
                groupId: 1,
                exception: null,
                operator: "><",
                rowId: "1",
                type: "date",
                value: {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate)
                }
            }],
            spatialField: {
                method: null,
                operation: "INTERSECTS",
                geometry: null,
                attribute: "the_geom"
            },
            pagination: {
                startIndex: 0,
                maxFeatures: 20
            },
            filterType: "OGC",
            ogcVersion: "1.1.0",
            sortOptions: null
        };

        let filterParts = toOGCFilterParts(objFilter, versionOGC, nsplaceholder);
        expect(filterParts[0]).toEqual('<ogc:Or><ogc:PropertyIsBetween>'
            + '<ogc:PropertyName>attributeEmpty</ogc:PropertyName>'
                + '<ogc:LowerBoundary><ogc:Literal>' + startDate + '</ogc:Literal></ogc:LowerBoundary>'
                + '<ogc:UpperBoundary><ogc:Literal>' + endDate + '</ogc:Literal></ogc:UpperBoundary>'
            + '</ogc:PropertyIsBetween></ogc:Or>');
        let cqlFilter = toCQLFilter(objFilter);
        expect(cqlFilter).toBe("((attributeEmpty>='2000-01-01T00:00:00.000Z' AND attributeEmpty<='3000-01-01T00:00:00.000Z'))");
    });
    it('Check  for options.cqlFilter are merged with existing fields', () => {
        const versionOGC = "1.1.0";
        const nsplaceholder = "ogc";
        const objFilter = {
            featureTypeName: "topp:states",
            groupFields: [{
                id: 1,
                logic: "OR",
                index: 0
            }],
            filterFields: [{
                attribute: "attributeEmpty",
                groupId: 1,
                exception: null,
                operator: "=",
                rowId: "1",
                type: "string",
                value: ''
            }],
            spatialField: {
                method: null,
                operation: "INTERSECTS",
                geometry: null,
                attribute: "the_geom"
            },
            pagination: {
                startIndex: 0,
                maxFeatures: 20
            },
            filterType: "OGC",
            ogcVersion: "1.1.0",
            sortOptions: null,
            options: { cqlFilter: "prop = 'value'" },
            crossLayerFilter: {
                attribute: "the_geom",
                collectGeometries: {
                    queryCollection: {
                        typeName: "topp:states",
                        filterFields: [],
                        geometryName: "the_geom",
                        groupFields: [{
                            id: 1,
                            index: 0,
                            logic: "OR"
                        }]
                    }
                }
            },
            hits: false
        };

        let filterParts = toOGCFilterParts(objFilter, versionOGC, nsplaceholder);
        const R1 = '<ogc:Or><ogc:PropertyIsEqualTo><ogc:PropertyName>attributeEmpty</ogc:PropertyName><ogc:Literal></ogc:Literal></ogc:PropertyIsEqualTo></ogc:Or>';
        const R2 = '<ogc:PropertyIsEqualTo><ogc:PropertyName>prop</ogc:PropertyName><ogc:Literal>value</ogc:Literal></ogc:PropertyIsEqualTo>';
        expect(filterParts[0]).toEqual(R1);
        expect(filterParts[1]).toEqual(R2);
        let filter = toOGCFilter("ft_name_test", objFilter, versionOGC, nsplaceholder);
        expect(filter.split("<ogc:Filter>")[1].split("</ogc:Filter>")[0]).toBe(`<ogc:And>${R1}${R2}</ogc:And>`);
    });
    it('Check  for options.cqlFilter are merged with existing fields (wfs 2.0)', () => {
        const versionOGC = "2.0";
        const nsplaceholder = "fes";
        const objFilter = {
            featureTypeName: "topp:states",
            groupFields: [{
                id: 1,
                logic: "OR",
                index: 0
            }],
            filterFields: [{
                attribute: "attributeEmpty",
                groupId: 1,
                exception: null,
                operator: "=",
                rowId: "1",
                type: "string",
                value: ''
            }],
            spatialField: {
                method: null,
                operation: "INTERSECTS",
                geometry: null,
                attribute: "the_geom"
            },
            pagination: {
                startIndex: 0,
                maxFeatures: 20
            },
            filterType: "OGC",
            ogcVersion: "2.0",
            sortOptions: null,
            options: { cqlFilter: "prop = 'value'" },
            crossLayerFilter: {
                attribute: "the_geom",
                collectGeometries: {
                    queryCollection: {
                        typeName: "topp:states",
                        filterFields: [],
                        geometryName: "the_geom",
                        groupFields: [{
                            id: 1,
                            index: 0,
                            logic: "OR"
                        }]
                    }
                }
            },
            hits: false
        };

        let filterParts = toOGCFilterParts(objFilter, versionOGC, nsplaceholder);
        const R1 = '<fes:Or><fes:PropertyIsEqualTo><fes:ValueReference>attributeEmpty</fes:ValueReference><fes:Literal></fes:Literal></fes:PropertyIsEqualTo></fes:Or>';
        const R2 = '<fes:PropertyIsEqualTo><fes:ValueReference>prop</fes:ValueReference><fes:Literal>value</fes:Literal></fes:PropertyIsEqualTo>';
        expect(filterParts[0]).toEqual(R1);
        expect(filterParts[1]).toEqual(R2);
        let filter = toOGCFilter("ft_name_test", objFilter, versionOGC, nsplaceholder);
        expect(filter.split("<fes:Filter>")[1].split("</fes:Filter>")[0]).toBe(`<fes:And>${R1}${R2}</fes:And>`);
    });
    it('Check for pagination wfs 2.0', () => {
        let filterObj = {
            pagination: {
                startIndex: 1,
                maxFeatures: 20
            },
            spatialField: {
                attribute: "the_geom",
                geometry: {
                    center: [1, 1],
                    coordinates: [
                        [1, 2],
                        [2, 3],
                        [3, 4],
                        [4, 5],
                        [5, 6]
                    ],
                    extent: [
                        1, 2, 3, 4, 5
                    ],
                    projection: "EPSG:4326",
                    radius: 1,
                    type: "Polygon"
                },
                method: "BBOX",
                operation: "INTERSECTS"
            }
        };

        let filter = toOGCFilter("ft_name_test", filterObj);
        expect(filter.indexOf('count="20"') !== -1).toBe(true);
        expect(filter.indexOf('startIndex="1"') !== -1).toBe(true);
    });
    it('Check for no pagination', () => {
        let filterObj = {
            spatialField: {
                attribute: "the_geom",
                geometry: {
                    center: [1, 1],
                    coordinates: [
                        [1, 2],
                        [2, 3],
                        [3, 4],
                        [4, 5],
                        [5, 6]
                    ],
                    extent: [
                        1, 2, 3, 4, 5
                    ],
                    projection: "EPSG:4326",
                    radius: 1,
                    type: "Polygon"
                },
                method: "BBOX",
                operation: "INTERSECTS"
            }
        };

        let filter = toOGCFilter("ft_name_test", filterObj);
        expect(filter.indexOf('count="20"') !== -1).toBe(false);
        expect(filter.indexOf('maxFeatures="20"') !== -1).toBe(false);
        expect(filter.indexOf('startIndex="1"') !== -1).toBe(false);
    });
    it('Check for empty string', () => {
        let filterObj = {
            filterFields: [{
                attribute: "attributeEmpty",
                groupId: 1,
                exception: null,
                operator: "=",
                rowId: "1",
                type: "string",
                value: ''
            }]
        };
        let expected = '<wfs:GetFeature service="WFS" version="2.0" xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:fes="http://www.opengis.net/fes/2.0" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd"><wfs:Query typeNames="ft_name_test" srsName="EPSG:4326"><fes:Filter><fes:PropertyIsEqualTo><fes:ValueReference>attributeEmpty</fes:ValueReference><fes:Literal></fes:Literal></fes:PropertyIsEqualTo></fes:Filter></wfs:Query></wfs:GetFeature>';
        let filter = toOGCFilter("ft_name_test", filterObj);
        expect(filter).toEqual(expected);
    });
    it('Test checkOperatorValidity', () => {
        const validFilterFields = [{
            attribute: "operatorIsEqaual",
            groupId: 1,
            exception: null,
            operator: "=",
            rowId: "1",
            type: "string",
            value: "value"
        }, {
            attribute: "attributeNull2",
            groupId: 1,
            exception: null,
            operator: "isNull",
            rowId: "3",
            type: "string",
            value: undefined
        }, {
            attribute: "attributeUndefined2",
            groupId: 1,
            exception: null,
            operator: "isNull",
            rowId: "4",
            type: "string",
            value: null // valid value for isnull operator
        }];
        validFilterFields.forEach((f, i) => {
            expect(checkOperatorValidity(f.value, f.operator)).toBe(true, `Failed on ${i}` );
        });
        const invalidFilterFields = [{
            attribute: "attributeNull",
            groupId: 1,
            exception: null,
            operator: "=",
            rowId: "1",
            type: "string",
            value: null
        }, {
            attribute: "attributeUndefined",
            groupId: 1,
            exception: null,
            operator: "=",
            rowId: "2",
            type: "string",
            value: undefined
        }, {
            attribute: "attributeUndefined",
            groupId: 1,
            exception: null
        }];
        invalidFilterFields.forEach((f, i) => {
            expect(checkOperatorValidity(f.value, f.operator)).toBe(false, `Failed on ${i}` );
        });
    });
    it('getGetFeatureBase gets viewParams', () => {
        const version = "2.0";
        const base = getGetFeatureBase(version, null, false, "application/json", {viewParams: "a:b"});
        expect(base.indexOf('viewParams="a:b"') > 0).toBeTruthy();
        expect(getGetFeatureBase(version, null, false, "application/json", { cql_filter: "a:b" }).indexOf('viewParams="a:b"') > 0).toBeFalsy();
    });
    it('getGetFeatureBase excludes xsi:schemaLocation when option noSchemaLocation=true', () => {
        const version = "2.0";
        // use noSchemaLocation
        const base = getGetFeatureBase(version, null, false, "application/json", { noSchemaLocation: true });
        expect(base.indexOf('xsi:schemaLocation=') >= 0).toBeFalsy();
        // default includes
        expect(getGetFeatureBase(version, null, false, "application/json", {}).indexOf('xsi:schemaLocation=') > 0).toBeTruthy();
    });
    it('Check for undefined or null values for string and number and list in ogc filter', () => {
        let filterObj = {
            filterFields: [{
                attribute: "attributeNull",
                groupId: 1,
                exception: null,
                operator: "=",
                rowId: "1",
                type: "string",
                value: null
            }, {
                attribute: "attributeUndefined",
                groupId: 1,
                exception: null,
                operator: "=",
                rowId: "2",
                type: "string",
                value: undefined
            }]
        };
        let filterObjNumbers = {
            filterFields: [{
                attribute: "attributeNumberNull",
                groupId: 1,
                exception: null,
                operator: "=",
                rowId: "1",
                type: "number",
                value: null
            }, {
                attribute: "attributeNumberUndefined",
                groupId: 1,
                exception: null,
                operator: "=",
                rowId: "2",
                type: "number",
                value: undefined
            }]
        };
        let filterObjList = {
            filterFields: [{
                attribute: "attributeListNull",
                groupId: 1,
                exception: null,
                operator: "=",
                rowId: "1",
                type: "list",
                value: null
            }, {
                attribute: "attributeListUndefined",
                groupId: 1,
                exception: null,
                operator: "=",
                rowId: "2",
                type: "list",
                value: undefined
            }]
        };
        let expected = '<wfs:GetFeature service="WFS" version="2.0" xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:fes="http://www.opengis.net/fes/2.0" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd"><wfs:Query typeNames="ft_name_test" srsName="EPSG:4326"></wfs:Query></wfs:GetFeature>';
        let filter = toOGCFilter("ft_name_test", filterObj);
        let filterNumber = toOGCFilter("ft_name_test", filterObjNumbers);
        let filterList = toOGCFilter("ft_name_test", filterObjList);
        expect(filter).toEqual(expected);
        expect(filterNumber).toEqual(expected);
        expect(filterList).toEqual(expected);
    });
    it('Check for undefined or null values for string and number and list WITH GROUP in ogc filter', () => {
        let filterObj = {
            filterFields: [{
                attribute: "attributeNull",
                groupId: 1,
                exception: null,
                operator: "=",
                rowId: "1",
                type: "string",
                value: null
            }, {
                attribute: "attributeUndefined",
                groupId: 1,
                exception: null,
                operator: "=",
                rowId: "2",
                type: "string",
                value: undefined
            }],
            groupFields: [{
                id: 1,
                index: 0,
                logic: "OR"
            }]
        };
        let filterObjNumbers = {
            filterFields: [{
                attribute: "attributeNumberNull",
                groupId: 1,
                exception: null,
                operator: "=",
                rowId: "1",
                type: "number",
                value: null
            }, {
                attribute: "attributeNumberUndefined",
                groupId: 1,
                exception: null,
                operator: "=",
                rowId: "2",
                type: "number",
                value: undefined
            }],
            groupFields: [{
                id: 1,
                index: 0,
                logic: "AND"
            }]
        };
        let filterObjList = {
            filterFields: [{
                attribute: "attributeListNull",
                groupId: 1,
                exception: null,
                operator: "=",
                rowId: "1",
                type: "list",
                value: null
            }, {
                attribute: "attributeListUndefined",
                groupId: 1,
                exception: null,
                operator: "=",
                rowId: "2",
                type: "list",
                value: undefined
            }],
            groupFields: [{
                id: 1,
                index: 0,
                logic: "AND NOT"
            }]
        };
        let expected = '<wfs:GetFeature service="WFS" version="2.0" xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:fes="http://www.opengis.net/fes/2.0" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd"><wfs:Query typeNames="ft_name_test" srsName="EPSG:4326"></wfs:Query></wfs:GetFeature>';
        let filter = toOGCFilter("ft_name_test", filterObj);
        let filterNumber = toOGCFilter("ft_name_test", filterObjNumbers);
        let filterList = toOGCFilter("ft_name_test", filterObjList);
        expect(filter).toEqual(expected);
        expect(filterNumber).toEqual(expected);
        expect(filterList).toEqual(expected);
    });
    it('Check for undefined or null values for isNull operator in ogc filter', () => {
        let filterObj = {
            filterFields: [{
                attribute: "attributeNull",
                groupId: 1,
                exception: null,
                operator: "isNull",
                rowId: "1",
                type: "string",
                value: null
            }, {
                attribute: "attributeUndefined",
                groupId: 1,
                exception: null,
                operator: "isNull",
                rowId: "2",
                type: "string",
                value: undefined
            }, {
                attribute: "attributeValid",
                groupId: 1,
                exception: null,
                operator: "isNull",
                rowId: "3",
                type: "string",
                value: "isNull"
            }]
        };
        let expected = '<wfs:GetFeature service="WFS" version="2.0" '
            + 'xmlns:wfs="http://www.opengis.net/wfs/2.0" '
            + 'xmlns:fes="http://www.opengis.net/fes/2.0" '
            + 'xmlns:gml="http://www.opengis.net/gml/3.2" '
            + 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
            + 'xsi:schemaLocation="http://www.opengis.net/wfs/2.0 '
            + 'http://schemas.opengis.net/wfs/2.0/wfs.xsd '
            + 'http://www.opengis.net/gml/3.2 '
            + 'http://schemas.opengis.net/gml/3.2.1/gml.xsd">'
            + '<wfs:Query '
                + 'typeNames="ft_name_test" srsName="EPSG:4326">'
                + '<fes:Filter>'
                    + '<fes:PropertyIsNull><fes:ValueReference>attributeNull</fes:ValueReference></fes:PropertyIsNull>'
                    + '<fes:PropertyIsNull><fes:ValueReference>attributeUndefined</fes:ValueReference></fes:PropertyIsNull>'
                    + '<fes:PropertyIsNull><fes:ValueReference>attributeValid</fes:ValueReference></fes:PropertyIsNull>'
                    + '</fes:Filter>'
                + '</wfs:Query>'
            + '</wfs:GetFeature>';
        let filter = toOGCFilter("ft_name_test", filterObj);
        expect(filter).toEqual(expected);
    });
    it('Check with no filterFields or empty array for filterFields', () => {
        let filterObj = {
            filterFields: []
        };
        let filterObjNoFields1 = {
            filterFields: null
        };
        let filterObjNoFields2 = {};
        let expected = '<wfs:GetFeature service="WFS" version="2.0" xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:fes="http://www.opengis.net/fes/2.0" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd"><wfs:Query typeNames="ft_name_test" srsName="EPSG:4326"></wfs:Query></wfs:GetFeature>';
        let filter = toOGCFilter("ft_name_test", filterObj);
        let filterNoFields1 = toOGCFilter("ft_name_test", filterObjNoFields1);
        let filterNoFields2 = toOGCFilter("ft_name_test", filterObjNoFields2);
        expect(filter).toEqual(expected);
        expect(filterNoFields1).toEqual(expected);
        expect(filterNoFields2).toEqual(expected);
    });
    it('Check with filter type of list in filterFields', () => {
        let filterObj = {
            filterFields: [{
                attribute: "attribute1",
                groupId: 1,
                exception: null,
                operator: "=",
                rowId: "1",
                type: "list",
                value: "value1"
            }]
        };
        let expected = '<wfs:GetFeature service="WFS" version="2.0" xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:fes="http://www.opengis.net/fes/2.0" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd"><wfs:Query typeNames="ft_name_test" srsName="EPSG:4326"><fes:Filter><fes:PropertyIsEqualTo><fes:ValueReference>attribute1</fes:ValueReference><fes:Literal>value1</fes:Literal></fes:PropertyIsEqualTo></fes:Filter></wfs:Query></wfs:GetFeature>';
        let filter = toOGCFilter("ft_name_test", filterObj);
        expect(filter).toEqual(expected);
    });
    it('Check SimpleFilterField ogc', () => {
        let filterObj = {
            simpleFilterFields: [{
                "fieldId": 1,
                "label": "Highway System",
                "attribute": "highway_system",
                "multivalue": false,
                "values": ["state"],
                "optionsValues": ["local", "state"],
                "optionsLabels": {
                    "local": "Local",
                    "state": "State"
                },
                "type": "list",
                "operator": "=",
                "required": true,
                "sort": "ASC",
                "defaultExpanded": true,
                "collapsible": true
            }]
        };
        let expected = '<wfs:GetFeature service="WFS" version="2.0" xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:fes="http://www.opengis.net/fes/2.0" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd"><wfs:Query typeNames="ft_name_test" srsName="EPSG:4326"><fes:Filter><fes:And><fes:Or><fes:PropertyIsEqualTo><fes:ValueReference>highway_system</fes:ValueReference><fes:Literal>state</fes:Literal></fes:PropertyIsEqualTo></fes:Or></fes:And></fes:Filter></wfs:Query></wfs:GetFeature>';
        let filter = toOGCFilter("ft_name_test", filterObj);
        expect(filter).toEqual(expected);
    });
    it('Check SpatialFilterField ogc 1.0.0 Polygon', () => {
        let filterObj = {
            spatialField: {
                "operation": "INTERSECTS",
                "attribute": "geometry",
                "geometry": {
                    "type": "Polygon",
                    "projection": "EPSG:4326",
                    "coordinates": [[[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]]
                }
            }
        };
        let expected = '<wfs:GetFeature service="WFS" version="1.0.0" outputFormat="GML2" xmlns:gml="http://www.opengis.net/gml" xmlns:wfs="http://www.opengis.net/wfs" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd"><wfs:Query typeName="ft_name_test" srsName="EPSG:4326"><ogc:Filter><ogc:Intersects><ogc:PropertyName>geometry</ogc:PropertyName><gml:Polygon srsName="EPSG:4326"><gml:outerBoundaryIs><gml:LinearRing><gml:coordinates>1,1 1,2 2,2 2,1 1,1</gml:coordinates></gml:LinearRing></gml:outerBoundaryIs></gml:Polygon></ogc:Intersects></ogc:Filter></wfs:Query></wfs:GetFeature>';
        let filter = toOGCFilter("ft_name_test", filterObj, "1.0.0");
        expect(filter).toEqual(expected);
    });
    it('Check SpatialFilterField ogc 1.0.0 Point', () => {
        let filterObj = {
            spatialField: {
                "operation": "INTERSECTS",
                "attribute": "geometry",
                "geometry": {
                    "type": "Point",
                    "projection": "EPSG:4326",
                    "coordinates": [1, 1]
                }
            }
        };
        let expected = '<wfs:GetFeature service="WFS" version="1.0.0" outputFormat="GML2" xmlns:gml="http://www.opengis.net/gml" xmlns:wfs="http://www.opengis.net/wfs" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd"><wfs:Query typeName="ft_name_test" srsName="EPSG:4326"><ogc:Filter><ogc:Intersects><ogc:PropertyName>geometry</ogc:PropertyName><gml:Point srsDimension="2" srsName="EPSG:4326"><gml:coord><X>1</X><Y>1</Y></gml:coord></gml:Point></ogc:Intersects></ogc:Filter></wfs:Query></wfs:GetFeature>';
        let filter = toOGCFilter("ft_name_test", filterObj, "1.0.0");
        expect(filter).toEqual(expected);
    });
    it('Check SpatialFilterField normalizeVersion', () => {
        let filterObj = {
            spatialField: {
                "operation": "INTERSECTS",
                "attribute": "geometry",
                "geometry": {
                    "type": "Point",
                    "projection": "EPSG:4326",
                    "coordinates": [1, 1]
                }
            }
        };

        let expected = '<wfs:GetFeature service="WFS" version="1.0.0" outputFormat="GML2" xmlns:gml="http://www.opengis.net/gml" xmlns:wfs="http://www.opengis.net/wfs" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd"><wfs:Query typeName="ft_name_test" srsName="EPSG:4326"><ogc:Filter><ogc:Intersects><ogc:PropertyName>geometry</ogc:PropertyName><gml:Point srsDimension="2" srsName="EPSG:4326"><gml:coord><X>1</X><Y>1</Y></gml:coord></gml:Point></ogc:Intersects></ogc:Filter></wfs:Query></wfs:GetFeature>';
        let filter = toOGCFilter("ft_name_test", filterObj, "1.0");
        expect(filter).toEqual(expected);
    });
    it('Check SpatialFilterField ogc 1.1.0 Polygon', () => {
        let filterObj = {
            spatialField: {
                "attribute": "geometry",
                "operation": "INTERSECTS",
                "geometry": {
                    "type": "Polygon",
                    "projection": "EPSG:4326",
                    "coordinates": [[[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]]
                }
            }
        };
        let expected = '<wfs:GetFeature service="WFS" version="1.1.0" xmlns:gml="http://www.opengis.net/gml" xmlns:wfs="http://www.opengis.net/wfs" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd"><wfs:Query typeName="ft_name_test" srsName="EPSG:4326"><ogc:Filter><ogc:Intersects><ogc:PropertyName>geometry</ogc:PropertyName><gml:Polygon srsName="EPSG:4326"><gml:exterior><gml:LinearRing><gml:posList>1 1 1 2 2 2 2 1 1 1</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon></ogc:Intersects></ogc:Filter></wfs:Query></wfs:GetFeature>';
        let filter = toOGCFilter("ft_name_test", filterObj, "1.1.0");
        expect(filter).toEqual(expected);
    });
    it('Check SpatialFilterField ogc 1.1.0 Point', () => {
        let filterObj = {
            spatialField: {
                "operation": "INTERSECTS",
                "attribute": "geometry",
                "geometry": {
                    "type": "Point",
                    "projection": "EPSG:4326",
                    "coordinates": [1, 1]
                }
            }
        };
        let expected = '<wfs:GetFeature service="WFS" version="1.1.0" xmlns:gml="http://www.opengis.net/gml" xmlns:wfs="http://www.opengis.net/wfs" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd"><wfs:Query typeName="ft_name_test" srsName="EPSG:4326"><ogc:Filter><ogc:Intersects><ogc:PropertyName>geometry</ogc:PropertyName><gml:Point srsDimension="2" srsName="EPSG:4326"><gml:pos>1 1</gml:pos></gml:Point></ogc:Intersects></ogc:Filter></wfs:Query></wfs:GetFeature>';
        let filter = toOGCFilter("ft_name_test", filterObj, "1.1.0");
        expect(filter).toEqual(expected);
    });
    it('Check SpatialFilterField ogc 2.0 Point', () => {
        let filterObj = {
            spatialField: {
                "operation": "INTERSECTS",
                "attribute": "geometry",
                "geometry": {
                    "type": "Point",
                    "projection": "EPSG:4326",
                    "coordinates": [1, 1]
                }
            }
        };
        let expected = '<wfs:GetFeature service="WFS" version="2.0" xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:fes="http://www.opengis.net/fes/2.0" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd"><wfs:Query typeNames="ft_name_test" srsName="EPSG:4326"><fes:Filter><fes:Intersects><fes:ValueReference>geometry</fes:ValueReference><gml:Point srsDimension="2" srsName="EPSG:4326"><gml:pos>1 1</gml:pos></gml:Point></fes:Intersects></fes:Filter></wfs:Query></wfs:GetFeature>';
        let filter = toOGCFilter("ft_name_test", filterObj, "2.0");
        expect(filter).toEqual(expected);
    });
    it('Check SpatialFilterField ogc 2.0 Polygon', () => {
        let filterObj = {
            spatialField: {
                "attribute": "geometry",
                "operation": "INTERSECTS",
                "geometry": {
                    "type": "Polygon",
                    "projection": "EPSG:4326",
                    "coordinates": [[[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]]
                }
            }
        };
        let expected = '<wfs:GetFeature service="WFS" version="2.0" xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:fes="http://www.opengis.net/fes/2.0" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd"><wfs:Query typeNames="ft_name_test" srsName="EPSG:4326"><fes:Filter><fes:Intersects><fes:ValueReference>geometry</fes:ValueReference><gml:Polygon srsName="EPSG:4326"><gml:exterior><gml:LinearRing><gml:posList>1 1 1 2 2 2 2 1 1 1</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon></fes:Intersects></fes:Filter></wfs:Query></wfs:GetFeature>';
        let filter = toOGCFilter("ft_name_test", filterObj, "2.0");
        expect(filter).toEqual(expected);
    });
    it('Check SpatialFilterField ogc default version is 2.0', () => {
        let filterObj = {
            spatialField: {
                "operation": "INTERSECTS",
                "attribute": "geometry",
                "geometry": {
                    "type": "Point",
                    "projection": "EPSG:4326",
                    "coordinates": [1, 1]
                }
            }
        };
        let expected = '<wfs:GetFeature service="WFS" version="2.0" xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:fes="http://www.opengis.net/fes/2.0" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd"><wfs:Query typeNames="ft_name_test" srsName="EPSG:4326"><fes:Filter><fes:Intersects><fes:ValueReference>geometry</fes:ValueReference><gml:Point srsDimension="2" srsName="EPSG:4326"><gml:pos>1 1</gml:pos></gml:Point></fes:Intersects></fes:Filter></wfs:Query></wfs:GetFeature>';
        let filter = toOGCFilter("ft_name_test", filterObj);
        expect(filter).toEqual(expected);
    });
    it('Check SpatialFilterField OGC collectGeometries', () => {
        let filterObj = {
            spatialField: {
                "operation": "INTERSECTS",
                "attribute": "geometry",
                collectGeometries: {
                    queryCollection: {
                        typeName: "TEST",
                        cqlFilter: "INCLUDE",
                        geometryName: "GEOMETRY"
                    }
                },
                "geometry": {
                    "type": "Point",
                    "projection": "EPSG:4326",
                    "coordinates": [1, 1]
                }
            }
        };
        const expectedGeom = "<ogc:Intersects>"
         + '<ogc:PropertyName>geometry</ogc:PropertyName>'
         + '<ogc:Function name="collectGeometries">'
         + '<ogc:Function name="queryCollection">'
         + '<ogc:Literal>TEST</ogc:Literal>'
         + '<ogc:Literal>GEOMETRY</ogc:Literal>'
         + '<ogc:Literal><![CDATA[INCLUDE]]></ogc:Literal>'
         + '</ogc:Function></ogc:Function>'
         + "</ogc:Intersects>";
        let expected =
            '<wfs:GetFeature service="WFS" version="2.0" xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:fes="http://www.opengis.net/fes/2.0" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd"><wfs:Query typeNames="ft_name_test" srsName="EPSG:4326"><fes:Filter>'
            + expectedGeom
            + '</fes:Filter></wfs:Query></wfs:GetFeature>';
        let filter = toOGCFilter("ft_name_test", filterObj);
        expect(filter).toEqual(expected);
    });
    it('Check SpatialFilterField CQL collectGeometries', () => {
        let filterObj = {
            spatialField: {
                "operation": "INTERSECTS",
                "attribute": "geometry",
                collectGeometries: {
                    queryCollection: {
                        typeName: "TEST",
                        cqlFilter: "INCLUDE",
                        geometryName: "GEOMETRY"
                    }
                },
                "geometry": {
                    "type": "Point",
                    "projection": "EPSG:4326",
                    "coordinates": [1, 1]
                }
            }
        };

        let filter = toCQLFilter(filterObj);
        expect(filter).toEqual('(INTERSECTS("geometry",collectGeometries(queryCollection(\'TEST\', \'GEOMETRY\',\'INCLUDE\'))))');
    });
    it('Check SpatialFilterField cql', () => {
        let filterObj = {
            simpleFilterFields: [{
                "fieldId": 1,
                "label": "Highway System",
                "attribute": "highway_system",
                "multivalue": false,
                "values": ["state"],
                "type": "list",
                "operator": "=",
                "optionsValues": ["local", "state"],
                "optionsLabels": {
                    "local": "Local",
                    "state": "State"
                },
                "required": true,
                "sort": "ASC",
                "defaultExpanded": true,
                "collapsible": true
            }]
        };
        let expected = "((highway_system IN('state')))";
        let filter = toCQLFilter(filterObj);
        expect(filter).toEqual(expected);
    });
    it('Check CrossLayerFilter segment generation', () => {
        let crossLayerFilterObj = {
            operation: "INTERSECTS",
            attribute: "roads_geom",
            collectGeometries: {queryCollection: {
                typeName: "regions",
                geometryName: "regions_geom",
                cqlFilter: "area > 10"
            }}
        };
        let expected = "<ogc:Intersects>"
         + '<ogc:PropertyName>roads_geom</ogc:PropertyName>'
         + '<ogc:Function name="collectGeometries">'
         + '<ogc:Function name="queryCollection">'
         + '<ogc:Literal>regions</ogc:Literal>'
         + '<ogc:Literal>regions_geom</ogc:Literal>'
         + '<ogc:Literal><![CDATA[area > 10]]></ogc:Literal>'
         + '</ogc:Function></ogc:Function>'
         + "</ogc:Intersects>";

        let filter = processOGCCrossLayerFilter(crossLayerFilterObj);
        expect(filter).toEqual(expected);
    });

    it('Check if toOGCFilter generate double bbox', () => {
        const filterObj = {
            featureTypeName: 'feature',
            filterFields: [],
            filterType: 'OGC',
            groupFields: [{id: 1, index: 0, logic: 'OR'}],
            hits: false,
            ogcVersion: '1.1.0',
            pagination: {
                maxFeatures: 20,
                startIndex: 0
            },
            sortOptions: null,
            spatialField: {
                attribute: 'the_geom',
                geometry: {
                    center: [174.19921875, 24.04052578726085],
                    coordinates: [
                        [[[-180, -10.228437266155943], [-180, 58.309488840677645], [-125.33203125, 58.309488840677645], [-125.33203125, -10.228437266155943], [-180, -10.228437266155943]]],
                        [[[113.73046875, -10.228437266155943], [113.73046875, 58.309488840677645], [180, 58.309488840677645], [180, -10.228437266155943], [113.73046875, -10.228437266155943]]]
                    ],
                    extent: [
                        [-180, 23.200960808078566, -134.47265625, 54.39335222384589],
                        [160.400390625, 23.200960808078566, 180, 54.39335222384589]
                    ],
                    projection: 'EPSG:4326',
                    radius: 0,
                    type: 'MultiPolygon'
                },
                method: 'Viewport',
                operation: 'BBOX'
            }
        };

        const expected = '<wfs:GetFeature ' +
          'startIndex="0" ' +
          'maxFeatures="20" ' +
          'service="WFS" ' +
          'version="1.1.0" ' +
          'xmlns:gml="http://www.opengis.net/gml" ' +
          'xmlns:wfs="http://www.opengis.net/wfs" ' +
          'xmlns:ogc="http://www.opengis.net/ogc" ' +
          'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
          'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">' +
          '<wfs:Query typeName="feature" srsName="EPSG:4326">' +
            '<ogc:Filter>' +
              '<ogc:Or>' +
                '<ogc:BBOX>' +
                  '<ogc:PropertyName>the_geom</ogc:PropertyName>' +
                  '<gml:Envelope srsName="EPSG:4326">' +
                    '<gml:lowerCorner>-180 23.200960808078566</gml:lowerCorner>' +
                    '<gml:upperCorner>-134.47265625 54.39335222384589</gml:upperCorner>' +
                  '</gml:Envelope>' +
                '</ogc:BBOX>' +
                '<ogc:BBOX>' +
                  '<ogc:PropertyName>the_geom</ogc:PropertyName>' +
                  '<gml:Envelope srsName="EPSG:4326">' +
                    '<gml:lowerCorner>160.400390625 23.200960808078566</gml:lowerCorner>' +
                    '<gml:upperCorner>180 54.39335222384589</gml:upperCorner>' +
                  '</gml:Envelope>' +
                '</ogc:BBOX>' +
              '</ogc:Or>' +
            '</ogc:Filter>' +
          '</wfs:Query>' +
        '</wfs:GetFeature>';

        expect(toOGCFilter(filterObj.featureTypeName, filterObj, filterObj.ogcVersion, filterObj.sortOptions, filterObj.hits)).toEqual(expected);
    });
    it('Check if cqlBooleanField(attribute, operator, value)', () => {
        // testing operators
        expect(cqlBooleanField("attribute_1", "=", true)).toBe("\"attribute_1\"='true'");
        expect(cqlBooleanField("attribute_1", "=", false)).toBe("\"attribute_1\"='false'");
        expect(cqlBooleanField("attribute_1", "=", "true")).toBe("\"attribute_1\"='true'");
        expect(cqlBooleanField("attribute_1", "=", "false")).toBe("\"attribute_1\"='false'");
        expect(cqlBooleanField("attribute_1", "<", true)).toBe("");
        expect(cqlBooleanField("attribute_1", "like", true)).toBe("");
        // testing falsy values
        expect(cqlBooleanField("attribute_1", "=", "")).toBe("");
        expect(cqlBooleanField("attribute_1", "=", undefined)).toBe("");
        expect(cqlBooleanField("attribute_1", "=", null)).toBe("");
    });
    it('Check if cqlStringField(attribute, operator, value)', () => {
        // testing operator =
        expect(cqlStringField("attribute_1", "=", "Alabama")).toBe("\"attribute_1\"='Alabama'");
        // test escape single quotes
        expect(cqlStringField("attribute_1", "=", "PRE'")).toBe("\"attribute_1\"='PRE'''");
        // test <>
        expect(cqlStringField("attribute_1", "<>", "Alabama")).toBe("\"attribute_1\"<>'Alabama'");
        // test ilike
        expect(cqlStringField("attribute_1", "ilike", "A")).toBe("strToLowerCase(\"attribute_1\") LIKE '%a%'");
        // test LIKE
        expect(cqlStringField("attribute_1", "like", "A")).toBe("\"attribute_1\" LIKE '%A%'");
        // test ilike with wildcard at the beginning
        expect(cqlStringField("attribute_1", "ilike", "*A")).toBe("strToLowerCase(\"attribute_1\") LIKE '%a'");
        // test LIKE with wildcard at the beginning
        expect(cqlStringField("attribute_1", "like", "*A")).toBe("\"attribute_1\" LIKE '%A'");
        // test ilike with wildcard at the end
        expect(cqlStringField("attribute_1", "ilike", "A*")).toBe("strToLowerCase(\"attribute_1\") LIKE 'a%'");
        // test LIKE with wildcard at the end
        expect(cqlStringField("attribute_1", "like", "A*")).toBe("\"attribute_1\" LIKE 'A%'");
        // test ilike wrapped with wildcard
        expect(cqlStringField("attribute_1", "ilike", "*A*")).toBe("strToLowerCase(\"attribute_1\") LIKE '%a%'");
        // test LIKE wrapped with wildcard
        expect(cqlStringField("attribute_1", "like", "*A*")).toBe("\"attribute_1\" LIKE '%A%'");
    });
    it('Check if ogcStringField(attribute, operator, value, ns)', () => {
        // testing operator =
        expect(ogcStringField("attribute_1", "=", "Alabama", "ogc")).toBe("<ogc:PropertyIsEqualTo><ogc:PropertyName>attribute_1</ogc:PropertyName><ogc:Literal>Alabama</ogc:Literal></ogc:PropertyIsEqualTo>");
        expect(ogcStringField("attribute_1", "<>", "Alabama", "ogc")).toBe("<ogc:PropertyIsNotEqualTo><ogc:PropertyName>attribute_1</ogc:PropertyName><ogc:Literal>Alabama</ogc:Literal></ogc:PropertyIsNotEqualTo>");
        expect(ogcStringField("attribute_1", "like", "Alabama", "ogc")).toBe("<ogc:PropertyIsLike matchCase=\"true\" wildCard=\"*\" singleChar=\".\" escapeChar=\"!\"><ogc:PropertyName>attribute_1</ogc:PropertyName><ogc:Literal>*Alabama*</ogc:Literal></ogc:PropertyIsLike>");
        expect(ogcStringField("attribute_1", "ilike", "Alabama", "ogc")).toBe("<ogc:PropertyIsLike matchCase=\"false\" wildCard=\"*\" singleChar=\".\" escapeChar=\"!\"><ogc:PropertyName>attribute_1</ogc:PropertyName><ogc:Literal>*Alabama*</ogc:Literal></ogc:PropertyIsLike>");
        expect(ogcStringField("attribute_1", "isNull", "", "ogc")).toBe("<ogc:PropertyIsNull><ogc:PropertyName>attribute_1</ogc:PropertyName></ogc:PropertyIsNull>");
    });
    it('Check if ogcBooleanField(attribute, operator, value, nsplaceholder)', () => {
        // testing operators
        expect(ogcBooleanField("attribute_1", "=", true, "ogc"))
            .toBe("<ogc:PropertyIsEqualTo><ogc:PropertyName>attribute_1</ogc:PropertyName><ogc:Literal>true</ogc:Literal></ogc:PropertyIsEqualTo>");
        expect(ogcBooleanField("attribute_1", "=", false, "ogc"))
            .toBe("<ogc:PropertyIsEqualTo><ogc:PropertyName>attribute_1</ogc:PropertyName><ogc:Literal>false</ogc:Literal></ogc:PropertyIsEqualTo>");
        expect(ogcBooleanField("attribute_1", "=", "true", "ogc"))
            .toBe("<ogc:PropertyIsEqualTo><ogc:PropertyName>attribute_1</ogc:PropertyName><ogc:Literal>true</ogc:Literal></ogc:PropertyIsEqualTo>");
        expect(ogcBooleanField("attribute_1", "=", "false", "ogc"))
            .toBe("<ogc:PropertyIsEqualTo><ogc:PropertyName>attribute_1</ogc:PropertyName><ogc:Literal>false</ogc:Literal></ogc:PropertyIsEqualTo>");
        expect(ogcBooleanField("attribute_1", "<", true, "ogc")).toBe("");
        expect(ogcBooleanField("attribute_1", "<", false, "ogc")).toBe("");
        expect(ogcBooleanField("attribute_1", "<", true, "ogc")).toBe("");
        expect(ogcBooleanField("attribute_1", "like", true, "ogc")).toBe("");
        // testing falsy values
        expect(ogcBooleanField("attribute_1", "=", "", "ogc")).toBe("");
        expect(ogcBooleanField("attribute_1", "=", undefined, "ogc")).toBe("");
        expect(ogcBooleanField("attribute_1", "=", null, "ogc")).toBe("");

    });
    it('Calculate CQL filter for number with value 0', () => {
        let filterObj = {
            filterFields: [
                {
                    groupId: 1,
                    attribute: "attribute3",
                    exception: null,
                    operator: "=",
                    rowId: "3",
                    type: "number",
                    value: 0
                }],
            groupFields: [{
                id: 1,
                index: 0,
                logic: "OR"
            }]
        };

        let filter = toCQLFilter(filterObj);
        expect(filter).toExist();
        expect(filter).toBe("(\"attribute3\" = \'0\')");
    });
    it('Calculate CQL filter for string  and LIKE operator', () => {
        let filterObj = {
            filterFields: [
                {
                    groupId: 1,
                    attribute: "attribute3",
                    exception: null,
                    operator: "like",
                    rowId: "3",
                    type: "string",
                    value: "val"
                }],
            groupFields: [{
                id: 1,
                index: 0,
                logic: "OR"
            }]
        };

        let filter = toCQLFilter(filterObj);
        expect(filter).toExist();
        expect(filter).toBe("(\"attribute3\" LIKE \'%val%\')");
    });
    it('Calculate one single sub group CQL filter', () => {
        const filterObject = {
            "featureTypeName": "topp:states",
            "groupFields": [
                {
                    "id": 1,
                    "logic": "OR",
                    "index": 0
                },
                {
                    "id": 1545410762560,
                    "logic": "OR",
                    "groupId": 1,
                    "index": 1
                }
            ],
            "filterFields": [
                {
                    "rowId": 1545410763916,
                    "groupId": 1545410762560,
                    "attribute": "STATE_NAME",
                    "operator": "=",
                    "value": "Alabama",
                    "type": "string",
                    "fieldOptions": {
                        "valuesCount": 0,
                        "currentPage": 1
                    },
                    "exception": null,
                    "openAutocompleteMenu": false,
                    "loading": false,
                    "options": {
                        "STATE_NAME": []
                    }
                }
            ],
            "spatialField": {
                "method": null,
                "operation": "INTERSECTS",
                "geometry": null,
                "attribute": "the_geom"
            },
            "pagination": null,
            "filterType": "OGC",
            "ogcVersion": "1.1.0",
            "sortOptions": null,
            "crossLayerFilter": null,
            "hits": false
        };
        expect(toCQLFilter(filterObject)).toBe('(("STATE_NAME"=\'Alabama\'))');
    });
    it('Calculate multiple sub group CQL filter', () => {
        const filterObject = {
            "featureTypeName": "topp:states",
            "groupFields": [
                {
                    "id": 1,
                    "logic": "OR",
                    "index": 0
                },
                {
                    "id": 1545411893128,
                    "logic": "OR",
                    "groupId": 1,
                    "index": 1
                }
            ],
            "filterFields": [
                {
                    "rowId": 1545411885028,
                    "groupId": 1,
                    "attribute": "STATE_NAME",
                    "operator": "=",
                    "value": "Alabama",
                    "type": "string",
                    "fieldOptions": {
                        "valuesCount": 0,
                        "currentPage": 1
                    },
                    "exception": null,
                    "openAutocompleteMenu": false,
                    "loading": false,
                    "options": {
                        "STATE_NAME": []
                    }
                },
                {
                    "rowId": 1545411894600,
                    "groupId": 1545411893128,
                    "attribute": "STATE_NAME",
                    "operator": "=",
                    "value": "Arizona",
                    "type": "string",
                    "fieldOptions": {
                        "valuesCount": 0,
                        "currentPage": 1
                    },
                    "exception": null,
                    "openAutocompleteMenu": false,
                    "loading": false,
                    "options": {
                        "STATE_NAME": []
                    }
                },
                {
                    "rowId": 1545411900160,
                    "groupId": 1545411893128,
                    "attribute": "STATE_NAME",
                    "operator": "=",
                    "value": "Arkansas",
                    "type": "string",
                    "fieldOptions": {
                        "valuesCount": 0,
                        "currentPage": 1
                    },
                    "exception": null,
                    "loading": false,
                    "openAutocompleteMenu": false,
                    "options": {
                        "STATE_NAME": []
                    }
                }
            ],
            "spatialField": {
                "method": null,
                "operation": "INTERSECTS",
                "geometry": null,
                "attribute": "the_geom"
            },
            "pagination": null,
            "filterType": "OGC",
            "ogcVersion": "1.1.0",
            "sortOptions": null,
            "crossLayerFilter": null,
            "hits": false
        };
        expect(toCQLFilter(filterObject)).toBe("(\"STATE_NAME\"='Alabama' OR (\"STATE_NAME\"='Arizona' OR \"STATE_NAME\"='Arkansas'))");
    });
    it('isNull operator in CQL filter', () => {
        const filterObj = {
            "searchUrl": null,
            "featureTypeConfigUrl": null,
            "showGeneratedFilter": false,
            "attributePanelExpanded": true,
            "spatialPanelExpanded": true,
            "crossLayerExpanded": true,
            "showDetailsPanel": false,
            "groupLevels": 5,
            "useMapProjection": false,
            "toolbarEnabled": true,
            "groupFields": [
                {
                    "id": 1,
                    "logic": "NOR",
                    "index": 0
                }
            ],
            "maxFeaturesWPS": 5,
            "filterFields": [
                {
                    "rowId": 1680880641587,
                    "groupId": 1,
                    "attribute": "STATE_NAME",
                    "operator": "isNull",
                    "value": null,
                    "type": "string",
                    "fieldOptions": {
                        "valuesCount": 0,
                        "currentPage": 1
                    },
                    "exception": null
                }
            ],
            "spatialField": {
                "method": null,
                "operation": "INTERSECTS",
                "geometry": null,
                "attribute": "the_geom"
            }
        };
        expect(toCQLFilter(filterObj)).toBe('(NOT (isNull("STATE_NAME")=true))');

    });
    it('getCrossLayerCqlFilter', () => {
        const filter = getCrossLayerCqlFilter({
            collectGeometries: {
                queryCollection: {
                    filterFields: [
                        {
                            groupId: 1,
                            attribute: "attribute3",
                            exception: null,
                            operator: "like",
                            rowId: "3",
                            type: "string",
                            value: "val"
                        }],
                    groupFields: [{
                        id: 1,
                        index: 0,
                        logic: "OR"
                    }]
                }
            }
        });
        expect(filter).toExist();
        expect(filter).toBe("(\"attribute3\" LIKE \'%val%\')");
    });
    it('compose filterFilds', () => {
        const filterA = {
            "groupFields": [
                {
                    "id": 1,
                    "logic": "OR",
                    "index": 0
                },
                {
                    "id": 2,
                    "logic": "OR",
                    "groupId": 1,
                    "index": 1
                }
            ],
            filters: [{format: 'cql', body: "STATE_FIPS = '01'"}],
            "filterFields": [
                {
                    "rowId": 1545411885028,
                    "groupId": 1,
                    "attribute": "STATE_NAME",
                    "operator": "=",
                    "value": "Alabama",
                    "type": "string",
                    "fieldOptions": {
                        "valuesCount": 0,
                        "currentPage": 1
                    },
                    "exception": null,
                    "openAutocompleteMenu": false,
                    "loading": false,
                    "options": {
                        "STATE_NAME": []
                    }
                },
                {
                    "rowId": 1545411894600,
                    "groupId": 2,
                    "attribute": "STATE_NAME",
                    "operator": "=",
                    "value": "Arizona",
                    "type": "string",
                    "fieldOptions": {
                        "valuesCount": 0,
                        "currentPage": 1
                    },
                    "exception": null,
                    "openAutocompleteMenu": false,
                    "loading": false,
                    "options": {
                        "STATE_NAME": []
                    }
                }]
        };
        const filterB = {
            "groupFields": [
                {
                    "id": 1,
                    "logic": "OR",
                    "index": 0
                },
                {
                    "id": 2,
                    "logic": "OR",
                    "groupId": 1,
                    "index": 1
                }
            ],
            filters: [{format: 'cql', body: "STATE_NAME = 'Illinois'"}],
            "filterFields": [
                {
                    "rowId": 15454118,
                    "groupId": 1,
                    "attribute": "STATE_NAME",
                    "operator": "=",
                    "value": "Alabama",
                    "type": "string",
                    "fieldOptions": {
                        "valuesCount": 0,
                        "currentPage": 1
                    },
                    "exception": null,
                    "openAutocompleteMenu": false,
                    "loading": false,
                    "options": {
                        "STATE_NAME": []
                    }
                },
                {
                    "rowId": 1545411894,
                    "groupId": 2,
                    "attribute": "STATE_NAME",
                    "operator": "=",
                    "value": "Arizona",
                    "type": "string",
                    "fieldOptions": {
                        "valuesCount": 0,
                        "currentPage": 1
                    },
                    "exception": null,
                    "openAutocompleteMenu": false,
                    "loading": false,
                    "options": {
                        "STATE_NAME": []
                    }
                }]
        };
        const filter = composeAttributeFilters([filterA, filterB]);
        expect(filter).toExist();
        expect(filter.groupFields.length).toBe(5);
        expect(filter.groupFields[0].logic).toBe("AND");
        expect(filter.groupFields[1].groupId).toBe(filter.groupFields[0].id);
        expect(filter.groupFields[2].groupId).toBe(filter.groupFields[1].id);
        expect(filter.groupFields[3].groupId).toBe(filter.groupFields[0].id);
        expect(filter.groupFields[4].groupId).toBe(filter.groupFields[3].id);
        expect(filter.filterFields.length).toBe(4);
        expect(filter.filterFields[0].groupId).toBe(filter.groupFields[1].id);
        expect(filter.filterFields[1].groupId).toBe(filter.groupFields[2].id);
        expect(filter.filterFields[2].groupId).toBe(filter.groupFields[3].id);
        expect(filter.filterFields[3].groupId).toBe(filter.groupFields[4].id);
        expect(filter.filters.length).toBe(2);
        expect(filter.filters[0].body).toBe("STATE_FIPS = '01'");
        expect(filter.filters[1].body).toBe("STATE_NAME = 'Illinois'");
    });
    it('check CQL filter when logic is NOR', () => {
        const filterObject = {
            "groupFields": [
                {
                    "id": 1,
                    "logic": "NOR",
                    "index": 0
                },
                {
                    "id": 1573134118982,
                    "logic": "NOR",
                    "groupId": 1,
                    "index": 1
                }
            ],
            "filterFields": [
                {
                    "rowId": 1573131371566,
                    "groupId": 1,
                    "attribute": "STATE_NAME",
                    "operator": "like",
                    "value": "Ar",
                    "type": "string",
                    "fieldOptions": {
                        "valuesCount": 6,
                        "currentPage": 1
                    },
                    "exception": null,
                    "openAutocompleteMenu": false,
                    "loading": false,
                    "options": {
                        "STATE_NAME": []
                    }
                },
                {
                    "rowId": 1573131515197,
                    "groupId": 1,
                    "attribute": "PERSONS",
                    "operator": "<",
                    "value": 1000000,
                    "type": "number",
                    "fieldOptions": {
                        "valuesCount": 0,
                        "currentPage": 1
                    },
                    "exception": null
                },
                {
                    "rowId": 1573134121577,
                    "groupId": 1573134118982,
                    "attribute": "LAND_KM",
                    "operator": "<",
                    "value": 5000,
                    "type": "number",
                    "fieldOptions": {
                        "valuesCount": 0,
                        "currentPage": 1
                    },
                    "exception": null
                }
            ]
        };
        const filter = toCQLFilter(filterObject);
        expect(filter).toBe(`(NOT ("STATE_NAME" LIKE '%Ar%') AND NOT ("PERSONS" < '1000000') AND NOT (NOT ("LAND_KM" < '5000')))`);
    });
    it('toOGCFilterParts with spatialField array', () => {
        const filterObj = {
            filterFields: [],
            groupFields: [{
                id: 1,
                index: 0,
                logic: "OR"
            }],
            spatialField: [{
                attribute: "the_geom",
                geometry: {
                    coordinates: [[1, 1], [3, 2]],
                    projection: "EPSG:4326",
                    type: "Point"
                },
                operation: "INTERSECTS"
            }, {
                attribute: "the_geom",
                geometry: {
                    coordinates: [[2, 2], [4, 1]],
                    projection: "EPSG:4326",
                    type: "Point"
                },
                operation: "INTERSECTS"
            }]
        };

        const parts = toOGCFilterParts(filterObj, "1.1.0", "ogc");

        const point1OGC = '<ogc:Intersects>' +
            '<ogc:PropertyName>the_geom</ogc:PropertyName>' +
            '<gml:Point srsDimension="2" srsName="EPSG:4326">' +
            '<gml:pos>1,1 3,2</gml:pos>' +
            '</gml:Point></ogc:Intersects>';
        const point2OGC = '<ogc:Intersects>' +
            '<ogc:PropertyName>the_geom</ogc:PropertyName>' +
            '<gml:Point srsDimension="2" srsName="EPSG:4326">' +
            '<gml:pos>2,2 4,1</gml:pos>' +
            '</gml:Point></ogc:Intersects>';

        expect(parts).toExist();
        expect(parts.length).toBe(1);
        expect(parts[0]).toBe('<ogc:And>' + point1OGC + point2OGC + '</ogc:And>');
    });
    it('toOGCFilterParts returns also filters from filter objects', () => {
        const filters = toOGCFilterParts({
            spatialField: [{
                attribute: "the_geom",
                geometry: {
                    coordinates: [[2, 2], [4, 1]],
                    projection: "EPSG:4326",
                    type: "Point"
                },
                operation: "INTERSECTS"
            }],
            filterFields: [{
                attribute: "name",
                operator: "=",
                value: "test"
            }],
            groupFields: [{
                id: 1,
                index: 0,
                logic: "OR"
            }],
            filters: [{
                format: "cql",
                body: "name = 'test'"
            }]
        }, "1.1.0", "ogc");
        expect(filters).toExist();
        expect(filters.length).toBe(2);
        expect(filters[0]).toBe('<ogc:Intersects><ogc:PropertyName>the_geom</ogc:PropertyName><gml:Point srsDimension="2" srsName="EPSG:4326"><gml:pos>2,2 4,1</gml:pos></gml:Point></ogc:Intersects>');
        expect(filters[1]).toBe('<ogc:PropertyIsEqualTo><ogc:PropertyName>name</ogc:PropertyName><ogc:Literal>test</ogc:Literal></ogc:PropertyIsEqualTo>');
    });
    it('toOGCFilter with filters array', () => {
        const query = toOGCFilter("test", {
            filterFields: [{
                groupId: 1,
                attribute: "attribute1",
                exception: null,
                operator: "=",
                rowId: "1",
                type: "list",
                value: "value1"
            }],
            groupFields: [{
                id: 1,
                index: 0,
                logic: "OR"
            }],
            filters: [{
                format: "cql",
                body: "prop = 'test'"
            }]
        }, "1.1.0", "ogc");
        expect(query).toExist();
        // toOGCFilter returns an entire WFS, wrapping into the `<ogc:Filter>` tag the filters. We have to extract the filter part
        const filterPart = query.split('<ogc:Filter>')[1].split('</ogc:Filter>')[0];
        expect(filterPart).toEqual(
            '<ogc:And>' +
                '<ogc:Or>' +
                    '<ogc:PropertyIsEqualTo>' +
                        '<ogc:PropertyName>attribute1</ogc:PropertyName>' +
                        '<ogc:Literal>value1</ogc:Literal>' +
                    '</ogc:PropertyIsEqualTo>' +
                '</ogc:Or>' +
                '<ogc:PropertyIsEqualTo>' +
                    '<ogc:PropertyName>prop</ogc:PropertyName>' +
                    '<ogc:Literal>test</ogc:Literal>' +
                '</ogc:PropertyIsEqualTo>' +
            '</ogc:And>'
        );
    });
    it('toCQLFilter includes also filters', () => {
        const filters = toCQLFilter({
            spatialField: [{
                attribute: "the_geom",
                geometry: {
                    coordinates: [[2, 2], [4, 1]],
                    projection: "EPSG:4326",
                    type: "Point"
                },
                operation: "INTERSECTS"
            }],
            filterFields: [{
                attribute: "name",
                operator: "=",
                value: "test"
            }],
            groupFields: [{
                id: 1,
                index: 0,
                logic: "OR"
            }],
            filters: [{
                format: "cql",
                body: "name = 'test'"
            }]
        });
        expect(filters).toExist();
        expect(filters).toBe('(INTERSECTS("the_geom",SRID=4326;Point(2,2 4,1))) AND (name = \'test\')');
    });

    it('Check if toOGCFilter bbox overrides with spatialField array', () => {
        const filterObj = {
            featureTypeName: 'feature',
            filterFields: [],
            filterType: 'OGC',
            groupFields: [{id: 1, index: 0, logic: 'OR'}],
            hits: false,
            ogcVersion: '1.1.0',
            pagination: {
                maxFeatures: 20,
                startIndex: 0
            },
            sortOptions: null,
            spatialField: [{
                attribute: 'the_geom',
                geometry: {
                    center: [174.19921875, 24.04052578726085],
                    coordinates: [
                        [[[-180, -10.228437266155943], [-180, 58.309488840677645], [-125.33203125, 58.309488840677645], [-125.33203125, -10.228437266155943], [-180, -10.228437266155943]]],
                        [[[113.73046875, -10.228437266155943], [113.73046875, 58.309488840677645], [180, 58.309488840677645], [180, -10.228437266155943], [113.73046875, -10.228437266155943]]]
                    ],
                    extent: [
                        [-180, 23.200960808078566, -134.47265625, 54.39335222384589],
                        [160.400390625, 23.200960808078566, 180, 54.39335222384589]
                    ],
                    projection: 'EPSG:4326',
                    radius: 0,
                    type: 'MultiPolygon'
                },
                method: 'Viewport',
                operation: 'BBOX'
            }, {
                attribute: "the_geom",
                geometry: {
                    coordinates: [[1, 1], [3, 2]],
                    projection: "EPSG:4326",
                    type: "Point"
                },
                operation: "INTERSECTS"
            }, {
                attribute: "the_geom",
                geometry: {
                    coordinates: [[2, 2], [4, 1]],
                    projection: "EPSG:4326",
                    type: "Point"
                },
                operation: "INTERSECTS"
            }]
        };

        const expected = '<wfs:GetFeature ' +
          'startIndex="0" ' +
          'maxFeatures="20" ' +
          'service="WFS" ' +
          'version="1.1.0" ' +
          'xmlns:gml="http://www.opengis.net/gml" ' +
          'xmlns:wfs="http://www.opengis.net/wfs" ' +
          'xmlns:ogc="http://www.opengis.net/ogc" ' +
          'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
          'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">' +
          '<wfs:Query typeName="feature" srsName="EPSG:4326">' +
            '<ogc:Filter>' +
              '<ogc:Or>' +
                '<ogc:BBOX>' +
                  '<ogc:PropertyName>the_geom</ogc:PropertyName>' +
                  '<gml:Envelope srsName="EPSG:4326">' +
                    '<gml:lowerCorner>-180 23.200960808078566</gml:lowerCorner>' +
                    '<gml:upperCorner>-134.47265625 54.39335222384589</gml:upperCorner>' +
                  '</gml:Envelope>' +
                '</ogc:BBOX>' +
                '<ogc:BBOX>' +
                  '<ogc:PropertyName>the_geom</ogc:PropertyName>' +
                  '<gml:Envelope srsName="EPSG:4326">' +
                    '<gml:lowerCorner>160.400390625 23.200960808078566</gml:lowerCorner>' +
                    '<gml:upperCorner>180 54.39335222384589</gml:upperCorner>' +
                  '</gml:Envelope>' +
                '</ogc:BBOX>' +
              '</ogc:Or>' +
            '</ogc:Filter>' +
          '</wfs:Query>' +
        '</wfs:GetFeature>';

        expect(toOGCFilter(filterObj.featureTypeName, filterObj, filterObj.ogcVersion, filterObj.sortOptions, filterObj.hits)).toEqual(expected);
    });
    it('Calculate CQL filter with spatialField array', () => {
        let filterObj = {
            filterFields: [{
                groupId: 1,
                attribute: "attribute1",
                exception: null,
                operator: "=",
                rowId: "1",
                type: "list",
                value: "value1"
            }],
            groupFields: [{
                id: 1,
                index: 0,
                logic: "OR"
            }],
            spatialField: [{
                groupId: 1,
                attribute: "the_geom",
                geometry: {
                    center: [1, 1],
                    coordinates: [[
                        [1, 2],
                        [2, 3],
                        [3, 4]
                    ]],
                    extent: [
                        1, 2, 3
                    ],
                    projection: "EPSG:4326",
                    radius: 1,
                    type: "Polygon"
                },
                method: "BBOX",
                operation: "INTERSECTS"
            }, {
                groupId: 1,
                attribute: "the_geom",
                geometry: {
                    center: [1, 1],
                    coordinates: [[
                        [1, 2],
                        [2, 3],
                        [3, 4],
                        [4, 5],
                        [5, 6]
                    ]],
                    extent: [
                        1, 2, 3, 4, 5
                    ],
                    projection: "EPSG:4326",
                    radius: 1,
                    type: "Polygon"
                },
                method: "BBOX",
                operation: "INTERSECTS"
            }]
        };

        let filter = toCQLFilter(filterObj);
        expect(filter).toExist();
        expect(filter).toBe("(\"attribute1\"='value1') AND " +
            "(INTERSECTS(\"the_geom\",SRID=4326;Polygon((1 2, 2 3, 3 4, 1 2))) AND INTERSECTS(\"the_geom\",SRID=4326;Polygon((1 2, 2 3, 3 4, 4 5, 5 6, 1 2))))");
    });
    it('ogcArrayField', () => {
        const attribute = "array_field";
        const operator = "contains";
        const value = "1234";
        const nsplaceholder = "ogc";
        let filter = ogcArrayField(attribute, operator, value, nsplaceholder);
        expect(filter).toEqual(`<${nsplaceholder}:PropertyIsEqualTo>
                <${nsplaceholder}:Function name="InArray">
                    <${nsplaceholder}:Literal>${value}</${nsplaceholder}:Literal>
                    <${nsplaceholder}:PropertyName>${attribute}</${nsplaceholder}:PropertyName>
                </${nsplaceholder}:Function>
                <${nsplaceholder}:Literal>true</${nsplaceholder}:Literal>
            </${nsplaceholder}:PropertyIsEqualTo>`);

        filter = ogcArrayField(attribute, operator, "", nsplaceholder);
        expect(filter).toEqual("");
        filter = ogcArrayField(attribute, "<", "val", nsplaceholder);
        expect(filter).toEqual("");
    });
    it('processOGCSimpleFilterField', () => {
        const attribute = "array_field";
        const operator = "contains";
        const values = "1234";
        const nsplaceholder = "ogc";
        const type = "array";
        const groupId = 1;

        let field = {
            groupId,
            attribute,
            type,
            operator,
            values
        };
        let filter = processOGCSimpleFilterField(field, nsplaceholder);
        expect(filter).toEqual(`<${nsplaceholder}:PropertyIsEqualTo>
                <${nsplaceholder}:Function name="InArray">
                    <${nsplaceholder}:Literal>${values}</${nsplaceholder}:Literal>
                    <${nsplaceholder}:PropertyName>${attribute}</${nsplaceholder}:PropertyName>
                </${nsplaceholder}:Function>
                <${nsplaceholder}:Literal>true</${nsplaceholder}:Literal>
            </${nsplaceholder}:PropertyIsEqualTo>`);
        field = {
            groupId,
            attribute,
            type,
            operator: "<",
            values
        };
        filter = processOGCSimpleFilterField(field, nsplaceholder);
        expect(filter).toEqual("");
    });
    it('processOGCFilterFields', () => {
        const group = {id: 1};
        const attribute = "array_field";
        const operator = "contains";
        const value = "1234";
        const nsplaceholder = "ogc";
        const type = "array";
        const groupId = 1;
        let objFilter = {
            filterFields: [{
                groupId,
                attribute,
                type,
                operator,
                value
            }]
        };
        let filter = processOGCFilterFields(group, objFilter, nsplaceholder);
        expect(filter).toEqual(`<${nsplaceholder}:PropertyIsEqualTo>
                <${nsplaceholder}:Function name="InArray">
                    <${nsplaceholder}:Literal>${value}</${nsplaceholder}:Literal>
                    <${nsplaceholder}:PropertyName>${attribute}</${nsplaceholder}:PropertyName>
                </${nsplaceholder}:Function>
                <${nsplaceholder}:Literal>true</${nsplaceholder}:Literal>
            </${nsplaceholder}:PropertyIsEqualTo>`);
        objFilter = {
            filterFields: [{
                groupId: 1
            }]
        };
        filter = processOGCFilterFields(group, objFilter, nsplaceholder);
        expect(filter).toEqual("");

    });
    it('cqlArrayField', () => {
        const attribute = "array_field";
        const operator = "contains";
        const value = "1234";
        let filter = cqlArrayField(attribute, operator, value);
        expect(filter).toEqual(`InArray(${value},${attribute})=true`);

        filter = cqlArrayField(attribute, "<", value);
        expect(filter).toEqual("");
    });
    it('processCQLFilterFields', () => {
        const group = {id: 1};

        const attribute = "array_field";
        const operator = "contains";
        const value = "1234";
        const type = "array";
        const groupId = 1;
        let objFilter = {
            filterFields: [{
                groupId,
                attribute,
                type,
                operator,
                value
            }]
        };
        let filter = processCQLFilterFields(group, objFilter);
        expect(filter).toEqual(`InArray(${value},${attribute})=true`);
        objFilter = {
            filterFields: [{
                groupId: 1
            }]
        };
        filter = processCQLFilterFields(group, objFilter);
        expect(filter).toEqual("");
        // test one operator
        expect(processCQLFilterFields(group, {
            filterFields: [{
                groupId: 1,
                attribute: "test",
                type: "string",
                operator: "=",
                value: "test"
            }]
        })).toEqual(`"test"='test'`);
        // test is null
        expect(processCQLFilterFields(group, {
            filterFields: [{
                groupId: 1,
                attribute: "test",
                type: "string",
                operator: "isNull"
            }]
        })).toEqual(`isNull("test")=true`);

    });

    it('wrapIfNoWildcards', () => {
        const testCases = [
            // True if no unescaped wildcards
            ["testString", true],
            ["*testString", false],
            ["!*testString", true],
            ["!*test.String", false],
            ["!te*st!.String", false],
            ["!te!*st!.String*", false],
            ["!te!*st!.String!*", true],
            ["*!te!*st!.String!*", false],
            ["!*!te!**st!.String!*", false]
        ];
        testCases.forEach(([value, expected]) => {
            expect(wrapIfNoWildcards(value)).toBe(expected);
        });
    });
    it('mergeFiltersToOGC', () => {
        let ogcVersion = "1.0.0";
        let filterObj = {
            featureTypeName: "test",
            groupFields: [{id: 1, logic: "OR", index: 0}],
            filterFields: [],
            spatialField: {
                method: "BBOX",
                operation: "INTERSECTS",
                geometry: {
                    id: "some_id",
                    type: "Polygon",
                    extent: [-189291.52323397118, 6127042.8962688595, -189157.75843447214, 6127162.329125555],
                    center: [-189224.64083422167, 6127102.612697207],
                    coordinates: [[[-189291.52323397118, 6127162.329125555], [-189291.52323397118, 6127042.8962688595], [-189157.75843447214, 6127042.8962688595], [-189157.75843447214, 6127162.329125555], [-189291.52323397118, 6127162.329125555]]],
                    style: {},
                    projection: "EPSG:3857"
                },
                attribute: "shape"
            },
            pagination: { startIndex: 0, maxFeatures: 20 },
            filterType: "OGC",
            ogcVersion,
            sortOptions: null,
            crossLayerFilter: null,
            hits: false
        };
        let filter = mergeFiltersToOGC({
            ogcVersion,
            addXmlnsToRoot: true,
            xmlnsToAdd: ['xmlns:ogc="http://www.opengis.net/ogc"', 'xmlns:gml="http://www.opengis.net/gml"']
        }, undefined, filterObj);
        let expectedFilter = '<ogc:Filter xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml"><ogc:And><ogc:Intersects><ogc:PropertyName>shape</ogc:PropertyName><gml:Polygon srsName="EPSG:3857"><gml:outerBoundaryIs><gml:LinearRing><gml:coordinates>-189291.52323397118,6127162.329125555 -189291.52323397118,6127042.8962688595 -189157.75843447214,6127042.8962688595 -189157.75843447214,6127162.329125555 -189291.52323397118,6127162.329125555</gml:coordinates></gml:LinearRing></gml:outerBoundaryIs></gml:Polygon></ogc:Intersects></ogc:And></ogc:Filter>';
        expect(filter).toEqual(expectedFilter);

        // ogcVersion - 1.1.0
        ogcVersion = '1.1.0';
        filter = mergeFiltersToOGC({
            ogcVersion,
            addXmlnsToRoot: true,
            xmlnsToAdd: ['xmlns:ogc="http://www.opengis.net/ogc"', 'xmlns:gml="http://www.opengis.net/gml"']
        }, undefined, {...filterObj, ogcVersion});
        expectedFilter = '<ogc:Filter xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml"><ogc:And><ogc:Intersects><ogc:PropertyName>shape</ogc:PropertyName><gml:Polygon srsName="EPSG:3857"><gml:exterior><gml:LinearRing><gml:posList>-189291.52323397118 6127162.329125555 -189291.52323397118 6127042.8962688595 -189157.75843447214 6127042.8962688595 -189157.75843447214 6127162.329125555 -189291.52323397118 6127162.329125555</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon></ogc:Intersects></ogc:And></ogc:Filter>';
        expect(filter).toEqual(expectedFilter);

        // ogcVersion - 2.0
        ogcVersion = '2.0';
        filter = mergeFiltersToOGC({
            ogcVersion,
            addXmlnsToRoot: true,
            xmlnsToAdd: ['xmlns:ogc="http://www.opengis.net/ogc"', 'xmlns:gml="http://www.opengis.net/gml"']
        }, undefined, {...filterObj, ogcVersion});
        expect(filter).toEqual(expectedFilter);

        // ogcVersion - 2.0.0
        ogcVersion = '2.0.0';
        filter = mergeFiltersToOGC({
            ogcVersion,
            addXmlnsToRoot: true,
            xmlnsToAdd: ['xmlns:ogc="http://www.opengis.net/ogc"', 'xmlns:gml="http://www.opengis.net/gml"']
        }, undefined, {...filterObj, ogcVersion});
        expect(filter).toEqual(expectedFilter);
    });
    // sub function to convert filters from other formats
    describe('sub function to convert filters from other formats', () => {
        const TESTS = [
            {
                filters: [],
                ogc: '',
                cql: ''
            }, {
                filters: [{
                    format: 'cql',
                    body: 'prop = 1'
                }],
                ogc: '<ogc:PropertyIsEqualTo><ogc:PropertyName>prop</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo>',
                cql: 'prop = 1'
            }, {
                filters: [{
                    format: 'cql',
                    body: 'prop = 1'
                }, {
                    format: 'cql',
                    body: 'prop = 2'
                }],
                ogc: [
                    '<ogc:PropertyIsEqualTo><ogc:PropertyName>prop</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo>',
                    '<ogc:PropertyIsEqualTo><ogc:PropertyName>prop</ogc:PropertyName><ogc:Literal>2</ogc:Literal></ogc:PropertyIsEqualTo>'
                ],
                cql: ['prop = 1', 'prop = 2']
            },
            {
                filters: [{format: 'logic', logic: 'AND', filters: []}],
                ogc: '', // not needed to produce this but it is the result
                cql: ''
            }, {
                filters: [{format: 'logic', logic: 'OR', filters: []}],
                ogc: '', // not needed to produce this but it is the result
                cql: ''
            }
        ];
        it('convertFiltersToOGC', () => {
            TESTS.forEach((test) => {
                const ogc = convertFiltersToOGC(test.filters, {nsplaceholder: 'ogc'});
                expect(ogc).toEqual(test.ogc);
            });
        });
        it('convertFiltersToCQL', () => {
            TESTS.forEach((test) => {
                const cql = convertFiltersToCQL(test.filters);
                expect(cql).toEqual(test.cql);
            });
        });
    });
    it('isFilterEmpty', () => {
        expect(isFilterEmpty({
            filterFields: [],
            spatialField: {},
            crossLayerFilter: {},
            filters: []
        })).toBe(true);
        expect(isFilterEmpty({
            filterFields: [{value: 1}],
            spatialField: {},
            crossLayerFilter: {},
            filters: []
        })).toBe(false);
        expect(isFilterEmpty({
            filterFields: [{value: 1}],
            spatialField: {geometry: {type: 'Point', coordinates: [1, 2]}},
            crossLayerFilter: {},
            filters: []
        })).toBe(false);
        expect(isFilterEmpty({
            filterFields: [],
            spatialField: {},
            crossLayerFilter: {attribute: 'attr', operation: 'op'},
            filters: []
        })).toBe(false);
        expect(isFilterEmpty({
            filterFields: [],
            spatialField: {},
            crossLayerFilter: {},
            filters: [{format: 'logic', logic: 'AND', filters: []}]
        })).toBe(false);
        expect(isFilterEmpty({
            filterFields: [{operator: "isNull"}],
            spatialField: {},
            crossLayerFilter: {},
            filters: []
        })).toBe(false);

    });
});
