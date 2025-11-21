/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import toGeoJSON from '../toGeoJSON';
import toWKT from '../toWKT';
const WKT_TESTS = [{
    wkt: 'POINT(30 10)',
    geojson: {
        type: 'Point',
        coordinates: [30, 10]
    }
}, {
    wkt: 'LINESTRING(30 10, 10 30, 40 40)',
    geojson: {
        type: 'LineString',
        coordinates: [[30, 10], [10, 30], [40, 40]]
    }
}, {
    wkt: 'POLYGON((30 10, 40 40, 20 40, 10 20, 30 10))',
    geojson: {
        type: 'Polygon',
        coordinates: [[[30, 10], [40, 40], [20, 40], [10, 20], [30, 10]]]
    }
},
{
    wkt: 'MULTIPOINT(10 40, 40 30, 20 20, 30 10)',
    geojson: {
        type: 'MultiPoint',
        coordinates: [[10, 40], [40, 30], [20, 20], [30, 10]]
    }
},
{

    wkt: 'MULTILINESTRING((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10))',
    geojson: {
        type: 'MultiLineString',
        coordinates: [[[10, 10], [20, 20], [10, 40]], [[40, 40], [30, 30], [40, 20], [30, 10]]]
    }
},
{
    wkt: 'MULTIPOLYGON(((30 20, 45 40, 10 40, 30 20)), ((15 5, 40 10, 10 20, 5 10, 15 5)))',
    geojson: {
        type: 'MultiPolygon',
        coordinates: [
            [[[30, 20], [45, 40], [10, 40], [30, 20]]],
            [[[15, 5], [40, 10], [10, 20], [5, 10], [15, 5]
            ]]
        ]
    }
}, {
    wkt: 'GEOMETRYCOLLECTION(POINT(4 6), LINESTRING(4 6, 7 10))',
    geojson: {
        type: 'GeometryCollection',
        geometries: [{
            type: 'Point',
            coordinates: [4, 6]
        }, {
            type: 'LineString',
            coordinates: [[4, 6], [7, 10]]
        }]
    }
}];

// SRID-prefixed geometries (GeoServer extension)
const SRID_WKT_TESTS = [{
    wkt: 'SRID=3857;POINT(30 10)',
    geojson: {
        type: 'Point',
        coordinates: [30, 10],
        projection: 'EPSG:3857'
    }
}, {
    wkt: 'SRID=4326;LINESTRING(30 10, 10 30, 40 40)',
    geojson: {
        type: 'LineString',
        coordinates: [[30, 10], [10, 30], [40, 40]],
        projection: 'EPSG:4326'
    }
}, {
    wkt: 'SRID=3857;POLYGON((30 10, 40 40, 20 40, 10 20, 30 10))',
    geojson: {
        type: 'Polygon',
        coordinates: [[[30, 10], [40, 40], [20, 40], [10, 20], [30, 10]]],
        projection: 'EPSG:3857'
    }
}, {
    wkt: 'SRID=4326;MULTIPOINT(10 40, 40 30, 20 20, 30 10)',
    geojson: {
        type: 'MultiPoint',
        coordinates: [[10, 40], [40, 30], [20, 20], [30, 10]],
        projection: 'EPSG:4326'
    }
}, {
    wkt: 'SRID=3857;MULTILINESTRING((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10))',
    geojson: {
        type: 'MultiLineString',
        coordinates: [[[10, 10], [20, 20], [10, 40]], [[40, 40], [30, 30], [40, 20], [30, 10]]],
        projection: 'EPSG:3857'
    }
}, {
    wkt: 'SRID=4326;MULTIPOLYGON(((30 20, 45 40, 10 40, 30 20)), ((15 5, 40 10, 10 20, 5 10, 15 5)))',
    geojson: {
        type: 'MultiPolygon',
        coordinates: [
            [[[30, 20], [45, 40], [10, 40], [30, 20]]],
            [[[15, 5], [40, 10], [10, 20], [5, 10], [15, 5]]]
        ],
        projection: 'EPSG:4326'
    }
}, {
    wkt: 'SRID=3857;GEOMETRYCOLLECTION(POINT(4 6), LINESTRING(4 6, 7 10))',
    geojson: {
        type: 'GeometryCollection',
        geometries: [{
            type: 'Point',
            coordinates: [4, 6]
        }, {
            type: 'LineString',
            coordinates: [[4, 6], [7, 10]]
        }],
        projection: 'EPSG:3857'
    }
}, {
    // Case-insensitive SRID prefix
    wkt: 'srid=4326;POINT(30 10)',
    geojson: {
        type: 'Point',
        coordinates: [30, 10],
        projection: 'EPSG:4326'
    }
}, {
    // Case-insensitive geometry type
    wkt: 'SRID=3857;point(30 10)',
    geojson: {
        type: 'Point',
        coordinates: [30, 10],
        projection: 'EPSG:3857'
    }
}];

// alternative syntax to check parsing
const ALTERNATIVE_SYNTAX_TESTS = [
    // MULTIPOINT HAS 2 EQUIVALENT FORMS
    {
        wkt: 'MULTIPOINT((10 40), (40 30), (20 20), (30 10))',
        geojson: {
            type: 'MultiPoint',
            coordinates: [[10, 40], [40, 30], [20, 20], [30, 10]]
        }
    },
    // spaces after comma are optional
    {
        wkt: 'GEOMETRYCOLLECTION(POINT(4 6), LINESTRING(4 6,7 10))',
        geojson: {
            type: 'GeometryCollection',
            geometries: [{
                type: 'Point',
                coordinates: [4, 6]
            }, {
                type: 'LineString',
                coordinates: [[4, 6], [7, 10]]
            }]
        }
    },
    // space after geometry name is allowed
    {
        wkt: 'GEOMETRYCOLLECTION (POINT (4 6), LINESTRING (4 6, 7 10))',
        geojson: {
            type: 'GeometryCollection',
            geometries: [{
                type: 'Point',
                coordinates: [4, 6]
            }, {
                type: 'LineString',
                coordinates: [[4, 6], [7, 10]]
            }]
        }
    }
];

describe('WKT convert to geoJSON (toGeoJSON)', function() {
    [...WKT_TESTS, ...ALTERNATIVE_SYNTAX_TESTS].forEach((test) => {
        it(test.wkt, () => {
            expect(toGeoJSON(test.wkt)).toEqual(test.geojson);
        });
    });

    describe('SRID-prefixed geometries', function() {
        SRID_WKT_TESTS.forEach((test) => {
            it(test.wkt, () => {
                expect(toGeoJSON(test.wkt)).toEqual(test.geojson);
            });
        });
    });

});

describe('geoJSON convert to WKT (toWKT)', function() {
    WKT_TESTS.forEach((test) => {
        it(test.wkt, () => {
            expect(toWKT(test.geojson)).toEqual(test.wkt);
        });
    });
});
