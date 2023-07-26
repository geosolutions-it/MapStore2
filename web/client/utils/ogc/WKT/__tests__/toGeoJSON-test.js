import expect from 'expect';
import toGeoJSON from '../toGeoJSON';
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
// MULTIPOINT HAS 2 EQUIVALENT FORMS
{
    wkt: 'MULTIPOINT((10 40), (40 30), (20 20), (30 10))',
    geojson: {
        type: 'MultiPoint',
        coordinates: [[10, 40], [40, 30], [20, 20], [30, 10]]
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

    wkt: 'MULTILINESTRING ((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10))',
    geojson: {
        type: 'MultiLineString',
        coordinates: [[[10, 10], [20, 20], [10, 40]], [[40, 40], [30, 30], [40, 20], [30, 10]]]
    }
},
{
    wkt: 'MULTIPOLYGON (((30 20, 45 40, 10 40, 30 20)), ((15 5, 40 10, 10 20, 5 10, 15 5)))',
    geojson: {
        type: 'MultiPolygon',
        coordinates: [
            [[[30, 20], [45, 40], [10, 40], [30, 20]]],
            [[[15, 5], [40, 10], [10, 20], [5, 10], [15, 5]
            ]]
        ]
    }
}, {
    wkt: 'GEOMETRYCOLLECTION(POINT(4 6),LINESTRING(4 6,7 10))',
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
describe('WKT convertion to geoJSON (toGeoJSON)', function() {
    WKT_TESTS.forEach((test) => {
        it(test.wkt, () => {
            expect(toGeoJSON(test.wkt)).toEqual(test.geojson);
        });
    });
});
