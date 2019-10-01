/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const uuid = require('uuid');
const {boundsToOLExtent, fromLeafletFeatureToQueryform, transformPolygonToCircle} = require('../DrawSupportUtils');
const {reproject} = require('../CoordinatesUtils');
const L = require('leaflet');
const ol = require('openlayers');

describe('LocaleUtils', () => {
    it('test fromLeafletFeatureToQueryform', () => {
        const latlngs = [[37, -109.05], [41, -109.03], [41, -102.05], [37, -102.04]];
        const features = [{
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [latlngs]
            }
        }];
        const testBounds = [37, -109.05, 41, -102.04];
        const layer = L.geoJson(features, {});
        expect(layer).toExist();
        const feature = fromLeafletFeatureToQueryform(layer);
        expect(feature).toExist();
        expect(feature.type).toBe("Polygon");
        expect(feature.coordinates.length).toBe(1);
        expect(feature.coordinates[0].length).toBe(5);
        expect(feature.extent.length).toBe(4);
        feature.extent.forEach((e, i) => {
            expect(e).toBe(testBounds[i]);
        });
        const bounds = L.latLngBounds([[testBounds[0], testBounds[1]], [testBounds[2], testBounds[3]]]);
        const center = bounds.getCenter();
        expect(center.lat).toBe(39);
        expect(center.lng).toBe(-105.545);
    });

    it('test boundsToOLExtent', () => {
        const bounds = L.latLngBounds([[1, 2], [3, 4]]);
        const convertedBounds = boundsToOLExtent(bounds);
        expect(convertedBounds.length).toBe(4);
    });


    const precision = 10;
    const makePoint = (p) => [p.x, p.y];
    const numberToPrecision = x => x.toPrecision(precision);
    const pointToPrecision = ([x, y]) => [x.toPrecision(precision), y.toPrecision(precision)];

    const center = [150.647, -89.43278];
    const radius = 11.2332;
    const makeTestFeature = (crs) => {
        return new ol.Feature({
            geometry: ol.geom.Polygon.fromCircle(new ol.geom.Circle(center, radius), 100),
            isCircle: true,
            id: uuid.v1(),
            radius,
            center: makePoint(reproject(center, crs, "EPSG:4326"))
        });
    };

    it('test transformPolygonToCircle with mapCrs=EPSG:4326', () => {
        const mapCrs = "EPSG:4326";
        const testFeature = makeTestFeature(mapCrs);
        const newFeature = transformPolygonToCircle(testFeature, mapCrs);
        expect(newFeature).toExist();
        const geometry = newFeature.getGeometry();
        expect(geometry).toBeA(ol.geom.Circle);
        expect(pointToPrecision(geometry.getCenter())).toEqual(pointToPrecision(center));
        expect(numberToPrecision(geometry.getRadius())).toEqual(numberToPrecision(radius));
    });

    it('test transformPolygonToCircle with mapCrs=EPSG:3857', () => {
        const mapCrs = "EPSG:3857";
        const testFeature = makeTestFeature(mapCrs);
        const newFeature = transformPolygonToCircle(testFeature, mapCrs);
        expect(newFeature).toExist();
        const geometry = newFeature.getGeometry();
        expect(geometry).toBeA(ol.geom.Circle);
        expect(pointToPrecision(geometry.getCenter())).toEqual(pointToPrecision(center));
        expect(numberToPrecision(geometry.getRadius())).toEqual(numberToPrecision(radius));
    });

    it('test transformPolygonToCircle with mapCrs=EPSG:4326 coordinateCrs=EPSG:3857', () => {
        const mapCrs = "EPSG:4326";
        const coordinateCrs = "EPSG:3857";
        const testFeature = makeTestFeature(coordinateCrs);
        const newFeature = transformPolygonToCircle(testFeature, mapCrs, coordinateCrs);
        expect(newFeature).toExist();
        const geometry = newFeature.getGeometry();
        expect(geometry).toBeA(ol.geom.Circle);
        const newCenter = makePoint(reproject(center, coordinateCrs, mapCrs));
        const newRadius = reproject([radius, 0.0], coordinateCrs, mapCrs).x;
        expect(pointToPrecision(geometry.getCenter())).toEqual(pointToPrecision(newCenter));
        expect(numberToPrecision(geometry.getRadius())).toEqual(numberToPrecision(newRadius));
    });

    it('test transformPolygonToCircle with mapCrs=EPSG:3857 coordinateCrs=EPSG:4326', () => {
        const mapCrs = "EPSG:3857";
        const coordinateCrs = "EPSG:4326";
        const testFeature = makeTestFeature(coordinateCrs);
        const newFeature = transformPolygonToCircle(testFeature, mapCrs, coordinateCrs);
        expect(newFeature).toExist();
        const geometry = newFeature.getGeometry();
        expect(geometry).toBeA(ol.geom.Circle);
        const newCenter = makePoint(reproject(center, coordinateCrs, mapCrs));
        const newRadius = reproject([radius, 0.0], coordinateCrs, mapCrs).x;
        expect(pointToPrecision(geometry.getCenter())).toEqual(pointToPrecision(newCenter));
        expect(numberToPrecision(geometry.getRadius())).toEqual(numberToPrecision(newRadius));
    });

    it('test transformPolygonToCircle with Circle', () => {
        const feature = new ol.Feature({geometry: new ol.geom.Circle([5.0, 7.0], 5.0)});
        const newFeature = transformPolygonToCircle(feature);
        expect(newFeature).toEqual(feature);
    });

    it('test transformPolygonToCircle with Polygon', () => {
        const feature = new ol.Feature({geometry: new ol.geom.Polygon([[1.0, 2.0], [-1.0, -1.0]])});
        const newFeature = transformPolygonToCircle(feature);
        expect(newFeature).toEqual(feature);
    });
});
