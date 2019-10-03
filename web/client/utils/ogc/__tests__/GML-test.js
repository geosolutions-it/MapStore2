/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {processOGCGeometry} = require('../GML');
const V1_1_0 = "1.1.0";
const point = {"type": "Point", "coordinates": [100.0, 0.0] };
const lineString = { "type": "LineString",
    "coordinates": [ [100.0, 0.0], [101.0, 1.0] ]
};
const polygon = {
    "type": "Polygon",
    "coordinates": [[[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]]
};
const multiPolygon = {
    "type": "MultiPolygon",
    "coordinates": [
        [[[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]],
        [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
            [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]]
    ]
};
const multiLineString = { "type": "MultiLineString",
    "coordinates": [
        [ [100.0, 0.0], [101.0, 1.0] ],
        [ [102.0, 2.0], [103.0, 3.0] ]
    ]
};
const EXPECTED_RESULTS = {
    V1_1_0: {
        point: '<gml:Point srsDimension="2" srsName="EPSG:4326"><gml:pos>100 0</gml:pos></gml:Point>',
        multiLineString: '<gml:MultiLineString srsName="EPSG:4326">'
                    + '<gml:lineStringMember>'
                        + '<gml:LineString srsName="EPSG:4326">'
                            + '<gml:posList>100 0 101 1</gml:posList>'
                        + '</gml:LineString>'
                    + '</gml:lineStringMember>'
                    + '<gml:lineStringMember>'
                        + '<gml:LineString srsName="EPSG:4326">'
                            + '<gml:posList>102 2 103 3</gml:posList>'
                            + '</gml:LineString>'
                    + '</gml:lineStringMember>'
                    + '</gml:MultiLineString>',
        lineString: '<gml:LineString srsName="EPSG:4326">'
                + '<gml:posList>100 0 101 1</gml:posList>'
                + '</gml:LineString>',
        polygon: '<gml:Polygon srsName="EPSG:4326">'
            + '<gml:exterior>'
                + '<gml:LinearRing>'
                    + '<gml:posList>102 2 103 2 103 3 102 3 102 2</gml:posList>'
                + '</gml:LinearRing>'
            + '</gml:exterior>'
        + '</gml:Polygon>',
        multiPolygon: '<gml:MultiPolygon srsName="EPSG:4326">'
                        + '<gml:polygonMember>'
                            + '<gml:Polygon srsName="EPSG:4326">'
                                + '<gml:exterior>'
                                    + '<gml:LinearRing>'
                                        + '<gml:posList>102 2 103 2 103 3 102 3 102 2</gml:posList>'
                                    + '</gml:LinearRing>'
                                + '</gml:exterior>'
                            + '</gml:Polygon>'
                        + '</gml:polygonMember>'
                        + '<gml:polygonMember>'
                            + '<gml:Polygon srsName="EPSG:4326">'
                                + '<gml:exterior>'
                                    + '<gml:LinearRing>'
                                        + '<gml:posList>100 0 101 0 101 1 100 1 100 0</gml:posList>'
                                    + '</gml:LinearRing>'
                                + '</gml:exterior>'
                                + '<gml:exterior>'
                                    + '<gml:LinearRing>'
                                        + '<gml:posList>100.2 0.2 100.8 0.2 100.8 0.8 100.2 0.8 100.2 0.2</gml:posList>'
                                    + '</gml:LinearRing>'
                                + '</gml:exterior>'
                            + '</gml:Polygon>'
                        + '</gml:polygonMember>'
                    + '</gml:MultiPolygon>'
    }
};
describe('Test GeoJSON/GML geometry conversion', () => {
    it('Point to GML 1.1.0', () => {
        const gmlPoint = processOGCGeometry(V1_1_0, point);
        expect(gmlPoint).toEqual(EXPECTED_RESULTS.V1_1_0.point);
    });

    it('LineString to GML 1.1.0', () => {
        const gmlLineString = processOGCGeometry(V1_1_0, lineString);
        expect(gmlLineString).toBe(EXPECTED_RESULTS.V1_1_0.lineString);
    });
    it('MultiLineString to GML 1.1.0', () => {
        const gmlLineString = processOGCGeometry(V1_1_0, multiLineString);
        expect(gmlLineString).toBe(EXPECTED_RESULTS.V1_1_0.multiLineString);
    });
    it('Polygon to GML 1.1.0', () => {
        const gmlPolygon = processOGCGeometry(V1_1_0, polygon);
        expect(gmlPolygon).toBe(EXPECTED_RESULTS.V1_1_0.polygon);
    });
    it('MultiPolygon to GML 1.1.0', () => {
        const gmlMultiPolygon = processOGCGeometry(V1_1_0, multiPolygon);
        expect(gmlMultiPolygon).toBe(EXPECTED_RESULTS.V1_1_0.multiPolygon);
    });
});
