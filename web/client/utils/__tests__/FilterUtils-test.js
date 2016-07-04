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
                exception: null,
                operator: "=",
                rowId: "1",
                type: "list",
                value: "value1"
            }, {
                attribute: "attribute2",
                exception: null,
                operator: "=",
                rowId: "2",
                type: "list",
                value: "value2"
            }],
            groupFields: [{
                id: 1,
                index: 0,
                logic: "OR"
            }],
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
        expect(filter).toExist();
    });

    it('Calculate CQL filter', () => {
        let filterObj = {
            filterFields: [{
                attribute: "attribute1",
                exception: null,
                operator: "=",
                rowId: "1",
                type: "list",
                value: "value1"
            }, {
                attribute: "attribute2",
                exception: null,
                operator: "=",
                rowId: "2",
                type: "list",
                value: "value2"
            }],
            groupFields: [{
                id: 1,
                index: 0,
                logic: "OR"
            }],
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

        let filter = FilterUtils.toCQLFilter("ft_name_test", filterObj);
        expect(filter).toExist();
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
    it('Check SimpleFilterField cql', () => {
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
});
