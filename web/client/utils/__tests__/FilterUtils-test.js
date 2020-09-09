/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
var FilterUtils = require('../FilterUtils');


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

        let filter = FilterUtils.toOGCFilter("ft_name_test", filterObj);
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

        let filter = FilterUtils.toCQLFilter(filterObj);
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

        let filter = FilterUtils.toCQLFilter(filterObj);
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

        let filter = FilterUtils.toOGCFilter("ft_name_test", filterObj, "1.1.0");
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

        let filterParts = FilterUtils.toOGCFilterParts(objFilter, versionOGC, nsplaceholder);
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

        let filterParts = FilterUtils.toOGCFilterParts(objFilter, versionOGC, nsplaceholder);
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

        let filterParts = FilterUtils.toOGCFilterParts(objFilter, versionOGC, nsplaceholder);
        expect(filterParts[0]).toEqual('<ogc:Or><ogc:PropertyIsBetween>'
            + '<ogc:PropertyName>attributeEmpty</ogc:PropertyName>'
                + '<ogc:LowerBoundary><ogc:Literal>' + startDate + '</ogc:Literal></ogc:LowerBoundary>'
                + '<ogc:UpperBoundary><ogc:Literal>' + endDate + '</ogc:Literal></ogc:UpperBoundary>'
            + '</ogc:PropertyIsBetween></ogc:Or>');
        let cqlFilter = FilterUtils.toCQLFilter(objFilter);
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

        let filterParts = FilterUtils.toOGCFilterParts(objFilter, versionOGC, nsplaceholder);
        const R1 = '<ogc:Or><ogc:PropertyIsEqualTo><ogc:PropertyName>attributeEmpty</ogc:PropertyName><ogc:Literal></ogc:Literal></ogc:PropertyIsEqualTo></ogc:Or>';
        const R2 = '<ogc:PropertyIsEqualTo><ogc:PropertyName>prop</ogc:PropertyName><ogc:Literal>value</ogc:Literal></ogc:PropertyIsEqualTo>';
        expect(filterParts[0]).toEqual(R1);
        expect(filterParts[1]).toEqual(R2);
        let filter = FilterUtils.toOGCFilter("ft_name_test", objFilter, versionOGC, nsplaceholder);
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

        let filterParts = FilterUtils.toOGCFilterParts(objFilter, versionOGC, nsplaceholder);
        const R1 = '<fes:Or><fes:PropertyIsEqualTo><fes:ValueReference>attributeEmpty</fes:ValueReference><fes:Literal></fes:Literal></fes:PropertyIsEqualTo></fes:Or>';
        const R2 = '<fes:PropertyIsEqualTo><fes:ValueReference>prop</fes:ValueReference><fes:Literal>value</fes:Literal></fes:PropertyIsEqualTo>';
        expect(filterParts[0]).toEqual(R1);
        expect(filterParts[1]).toEqual(R2);
        let filter = FilterUtils.toOGCFilter("ft_name_test", objFilter, versionOGC, nsplaceholder);
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

        let filter = FilterUtils.toOGCFilter("ft_name_test", filterObj);
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

        let filter = FilterUtils.toOGCFilter("ft_name_test", filterObj);
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
        let filter = FilterUtils.toOGCFilter("ft_name_test", filterObj);
        expect(filter).toEqual(expected);
    });
    it('Test checkOperatorValidity', () => {
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
            }]
        };

        filterObj.filterFields.forEach((f, i) => {
            let valid = FilterUtils.checkOperatorValidity(f.value, f.operator);
            if (i <= 2) {
                expect(valid).toEqual(false);
            } else {
                expect(valid).toEqual(true);
            }
        });
    });
    it('getGetFeatureBase gets viewParams', () => {
        const version = "2.0";
        const base = FilterUtils.getGetFeatureBase(version, null, false, "application/json", {viewParams: "a:b"});
        expect(base.indexOf('viewParams="a:b"') > 0).toBeTruthy();
        expect(FilterUtils.getGetFeatureBase(version, null, false, "application/json", { cql_filter: "a:b" }).indexOf('viewParams="a:b"') > 0).toBeFalsy();
    });
    it('getGetFeatureBase excludes xsi:schemaLocation when option noSchemaLocation=true', () => {
        const version = "2.0";
        // use noSchemaLocation
        const base = FilterUtils.getGetFeatureBase(version, null, false, "application/json", { noSchemaLocation: true });
        expect(base.indexOf('xsi:schemaLocation=') >= 0).toBeFalsy();
        // default includes
        expect(FilterUtils.getGetFeatureBase(version, null, false, "application/json", {}).indexOf('xsi:schemaLocation=') > 0).toBeTruthy();
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
        let filter = FilterUtils.toOGCFilter("ft_name_test", filterObj);
        let filterNumber = FilterUtils.toOGCFilter("ft_name_test", filterObjNumbers);
        let filterList = FilterUtils.toOGCFilter("ft_name_test", filterObjList);
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
        let filter = FilterUtils.toOGCFilter("ft_name_test", filterObj);
        let filterNumber = FilterUtils.toOGCFilter("ft_name_test", filterObjNumbers);
        let filterList = FilterUtils.toOGCFilter("ft_name_test", filterObjList);
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
        let expected = '<wfs:GetFeature service="WFS" version="2.0" xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:fes="http://www.opengis.net/fes/2.0" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd"><wfs:Query typeNames="ft_name_test" srsName="EPSG:4326"><fes:Filter><fes:PropertyIsNull><fes:ValueReference>attributeNull</fes:ValueReference></fes:PropertyIsNull><fes:PropertyIsNull><fes:ValueReference>attributeValid</fes:ValueReference></fes:PropertyIsNull></fes:Filter></wfs:Query></wfs:GetFeature>';
        let filter = FilterUtils.toOGCFilter("ft_name_test", filterObj);
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
        let filter = FilterUtils.toOGCFilter("ft_name_test", filterObj);
        let filterNoFields1 = FilterUtils.toOGCFilter("ft_name_test", filterObjNoFields1);
        let filterNoFields2 = FilterUtils.toOGCFilter("ft_name_test", filterObjNoFields2);
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
        let filter = FilterUtils.toOGCFilter("ft_name_test", filterObj);
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
        let filter = FilterUtils.toOGCFilter("ft_name_test", filterObj);
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
        let filter = FilterUtils.toOGCFilter("ft_name_test", filterObj, "1.0.0");
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
        let filter = FilterUtils.toOGCFilter("ft_name_test", filterObj, "1.0.0");
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
        let filter = FilterUtils.toOGCFilter("ft_name_test", filterObj, "1.0");
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
        let filter = FilterUtils.toOGCFilter("ft_name_test", filterObj, "1.1.0");
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
        let filter = FilterUtils.toOGCFilter("ft_name_test", filterObj, "1.1.0");
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
        let filter = FilterUtils.toOGCFilter("ft_name_test", filterObj, "2.0");
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
        let filter = FilterUtils.toOGCFilter("ft_name_test", filterObj, "2.0");
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
        let filter = FilterUtils.toOGCFilter("ft_name_test", filterObj);
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
        let filter = FilterUtils.toOGCFilter("ft_name_test", filterObj);
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

        let filter = FilterUtils.toCQLFilter(filterObj);
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
        let filter = FilterUtils.toCQLFilter(filterObj);
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

        let filter = FilterUtils.processOGCCrossLayerFilter(crossLayerFilterObj);
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

        expect(FilterUtils.toOGCFilter(filterObj.featureTypeName, filterObj, filterObj.ogcVersion, filterObj.sortOptions, filterObj.hits)).toEqual(expected);
    });
    it('Check if cqlBooleanField(attribute, operator, value)', () => {
        // testing operators
        expect(FilterUtils.cqlBooleanField("attribute_1", "=", true)).toBe("\"attribute_1\"='true'");
        expect(FilterUtils.cqlBooleanField("attribute_1", "=", false)).toBe("\"attribute_1\"='false'");
        expect(FilterUtils.cqlBooleanField("attribute_1", "=", "true")).toBe("\"attribute_1\"='true'");
        expect(FilterUtils.cqlBooleanField("attribute_1", "=", "false")).toBe("\"attribute_1\"='false'");
        expect(FilterUtils.cqlBooleanField("attribute_1", "<", true)).toBe("");
        expect(FilterUtils.cqlBooleanField("attribute_1", "like", true)).toBe("");
        // testing falsy values
        expect(FilterUtils.cqlBooleanField("attribute_1", "=", "")).toBe("");
        expect(FilterUtils.cqlBooleanField("attribute_1", "=", undefined)).toBe("");
        expect(FilterUtils.cqlBooleanField("attribute_1", "=", null)).toBe("");
    });
    it('Check if cqlStringField(attribute, operator, value)', () => {
        // testing operator =
        expect(FilterUtils.cqlStringField("attribute_1", "=", "Alabama")).toBe("\"attribute_1\"='Alabama'");
        // test escape single quotes
        expect(FilterUtils.cqlStringField("attribute_1", "=", "PRE'")).toBe("\"attribute_1\"='PRE'''");
        // test isNull
        expect(FilterUtils.cqlStringField("attribute_1", "isNull", "")).toBe("isNull(\"attribute_1\")=true");
        // test ilike
        expect(FilterUtils.cqlStringField("attribute_1", "ilike", "A")).toBe("strToLowerCase(\"attribute_1\") LIKE '%a%'");
        // test LIKE
        expect(FilterUtils.cqlStringField("attribute_1", "like", "A")).toBe("\"attribute_1\" LIKE '%A%'");
    });
    it('Check if ogcBooleanField(attribute, operator, value, nsplaceholder)', () => {
        // testing operators
        expect(FilterUtils.ogcBooleanField("attribute_1", "=", true, "ogc"))
            .toBe("<ogc:PropertyIsEqualTo><ogc:PropertyName>attribute_1</ogc:PropertyName><ogc:Literal>true</ogc:Literal></ogc:PropertyIsEqualTo>");
        expect(FilterUtils.ogcBooleanField("attribute_1", "=", false, "ogc"))
            .toBe("<ogc:PropertyIsEqualTo><ogc:PropertyName>attribute_1</ogc:PropertyName><ogc:Literal>false</ogc:Literal></ogc:PropertyIsEqualTo>");
        expect(FilterUtils.ogcBooleanField("attribute_1", "=", "true", "ogc"))
            .toBe("<ogc:PropertyIsEqualTo><ogc:PropertyName>attribute_1</ogc:PropertyName><ogc:Literal>true</ogc:Literal></ogc:PropertyIsEqualTo>");
        expect(FilterUtils.ogcBooleanField("attribute_1", "=", "false", "ogc"))
            .toBe("<ogc:PropertyIsEqualTo><ogc:PropertyName>attribute_1</ogc:PropertyName><ogc:Literal>false</ogc:Literal></ogc:PropertyIsEqualTo>");
        expect(FilterUtils.ogcBooleanField("attribute_1", "<", true, "ogc")).toBe("");
        expect(FilterUtils.ogcBooleanField("attribute_1", "<", false, "ogc")).toBe("");
        expect(FilterUtils.ogcBooleanField("attribute_1", "<", true, "ogc")).toBe("");
        expect(FilterUtils.ogcBooleanField("attribute_1", "like", true, "ogc")).toBe("");
        // testing falsy values
        expect(FilterUtils.ogcBooleanField("attribute_1", "=", "", "ogc")).toBe("");
        expect(FilterUtils.ogcBooleanField("attribute_1", "=", undefined, "ogc")).toBe("");
        expect(FilterUtils.ogcBooleanField("attribute_1", "=", null, "ogc")).toBe("");

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

        let filter = FilterUtils.toCQLFilter(filterObj);
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
                    operator: "LIKE",
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

        let filter = FilterUtils.toCQLFilter(filterObj);
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
        expect(FilterUtils.toCQLFilter(filterObject)).toBe('(("STATE_NAME"=\'Alabama\'))');
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
        expect(FilterUtils.toCQLFilter(filterObject)).toBe("(\"STATE_NAME\"='Alabama' OR (\"STATE_NAME\"='Arizona' OR \"STATE_NAME\"='Arkansas'))");
    });
    it('getCrossLayerCqlFilter', () => {
        const filter = FilterUtils.getCrossLayerCqlFilter({
            collectGeometries: {
                queryCollection: {
                    filterFields: [
                        {
                            groupId: 1,
                            attribute: "attribute3",
                            exception: null,
                            operator: "LIKE",
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
        const filter = FilterUtils.composeAttributeFilters([filterA, filterB]);
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
        const filter = FilterUtils.toCQLFilter(filterObject);
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

        const parts = FilterUtils.toOGCFilterParts(filterObj, "1.1.0", "ogc");

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

        expect(FilterUtils.toOGCFilter(filterObj.featureTypeName, filterObj, filterObj.ogcVersion, filterObj.sortOptions, filterObj.hits)).toEqual(expected);
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

        let filter = FilterUtils.toCQLFilter(filterObj);
        expect(filter).toExist();
        expect(filter).toBe("(\"attribute1\"='value1') AND " +
            "(INTERSECTS(\"the_geom\",SRID=4326;Polygon((1 2, 2 3, 3 4, 1 2))) AND INTERSECTS(\"the_geom\",SRID=4326;Polygon((1 2, 2 3, 3 4, 4 5, 5 6, 1 2))))");
    });
});
