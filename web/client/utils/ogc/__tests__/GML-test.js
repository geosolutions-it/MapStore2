/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {processOGCGeometry, polygonElement} = require('../GML');
const V1_1_0 = "1.1.0";
const srsName = "EPSG:3857";
const point = {"type": "Point", "coordinates": [100.0, 0.0] };
const lineString = { "type": "LineString",
    "coordinates": [ [100.0, 0.0], [101.0, 1.0] ]
};
const polygon = {
    "type": "Polygon",
    "coordinates": [[[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]]
};

const polygonExternalInternal = {
    "type": "Polygon",
    "coordinates": [[[-13837894.938769765, 6152246.765038833], [-13870573.06472578, 5167186.555807996], [-13885246.404215768, 5141882.531585468], [-13060956.58557037, 3836666.5247580605], [-10834726.501826838, 2986698.362005187], [-10494170.270500567, 3494875.037811458], [-9336249.138400448, 3489971.447318631], [-8715477.041201625, 4086300.4560303073], [-8433239.847950352, 4713623.15121573], [-7624933.488392262, 5936526.215342932], [-9247909.64555257, 5111113.43704269], [-10569782.887260191, 6277905.950416091], [-13822622.687463861, 6276333.806899306]], [[-13082405.114977926, 5738510.996205103], [-12975574.219813585, 4728558.514625181], [-11716961.038662285, 4179094.355509075], [-9922209.486299047, 4394852.33719347], [-9935385.546249239, 5499208.293757439]]]
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
                                + '<gml:interior>'
                                    + '<gml:LinearRing>'
                                        + '<gml:posList>100.2 0.2 100.8 0.2 100.8 0.8 100.2 0.8 100.2 0.2</gml:posList>'
                                    + '</gml:LinearRing>'
                                + '</gml:interior>'
                            + '</gml:Polygon>'
                        + '</gml:polygonMember>'
                    + '</gml:MultiPolygon>',
        exteriorInterior: '<gml:Polygon srsName="EPSG:3857">'
                            + '<gml:exterior>'
                            +    '<gml:LinearRing>'
                            +        '<gml:posList>-13837894.938769765 6152246.765038833 -13870573.06472578 5167186.555807996 -13885246.404215768 5141882.531585468 -13060956.58557037 3836666.5247580605 -10834726.501826838 2986698.362005187 -10494170.270500567 3494875.037811458 -9336249.138400448 3489971.447318631 -8715477.041201625 4086300.4560303073 -8433239.847950352 4713623.15121573 -7624933.488392262 5936526.215342932 -9247909.64555257 5111113.43704269 -10569782.887260191 6277905.950416091 -13822622.687463861 6276333.806899306 -13837894.938769765 6152246.765038833</gml:posList>'
                            +    '</gml:LinearRing>'
                            + '</gml:exterior>'
                            + '<gml:interior>'
                            +    '<gml:LinearRing>'
                            +        '<gml:posList>-13082405.114977926 5738510.996205103 -12975574.219813585 4728558.514625181 -11716961.038662285 4179094.355509075 -9922209.486299047 4394852.33719347 -9935385.546249239 5499208.293757439 -13082405.114977926 5738510.996205103</gml:posList>'
                            +    '</gml:LinearRing>'
                            + '</gml:interior>'
                        + '</gml:Polygon>'

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

    it('Polygon with holes to GML external internal', () => {
        const gmlMultiPolygon = polygonElement(polygonExternalInternal.coordinates, srsName, V1_1_0);
        expect(gmlMultiPolygon).toBe(EXPECTED_RESULTS.V1_1_0.exteriorInterior);
    });
});
