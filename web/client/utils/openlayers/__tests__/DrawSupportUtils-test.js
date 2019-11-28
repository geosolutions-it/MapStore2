import expect from 'expect';
import uuid from 'uuid';
import { Circle, Polygon } from 'ol/geom';
import { fromCircle } from 'ol/geom/Polygon';
import Feature from 'ol/Feature';

import { reproject } from '../../CoordinatesUtils';
import { transformPolygonToCircle } from '../DrawSupportUtils';

describe('DrawSupportUtils openlayers', () => {
    const precision = 10;
    const makePoint = (p) => [p.x, p.y];
    const numberToPrecision = x => x.toPrecision(precision);
    const pointToPrecision = ([x, y]) => [x.toPrecision(precision), y.toPrecision(precision)];

    const center = [150.647, -89.43278];
    const radius = 11.2332;
    const makeTestFeature = (crs) => {
        return new Feature({
            geometry: fromCircle(new Circle(center, radius), 100),
            isCircle: true,
            id: uuid.v1(),
            radius,
            center: makePoint(reproject(center, crs, "EPSG:4326")),
            crs
        });
    };

    it('test transformPolygonToCircle with mapCrs=EPSG:4326', () => {
        const mapCrs = "EPSG:4326";
        const testFeature = makeTestFeature(mapCrs);
        const newFeature = transformPolygonToCircle(testFeature, mapCrs);
        expect(newFeature).toExist();
        const geometry = newFeature.getGeometry();
        expect(geometry).toBeA(Circle);
        expect(pointToPrecision(geometry.getCenter())).toEqual(pointToPrecision(center));
        expect(numberToPrecision(geometry.getRadius())).toEqual(numberToPrecision(radius));
    });

    it('test transformPolygonToCircle with mapCrs=EPSG:3857', () => {
        const mapCrs = "EPSG:3857";
        const testFeature = makeTestFeature(mapCrs);
        const newFeature = transformPolygonToCircle(testFeature, mapCrs);
        expect(newFeature).toExist();
        const geometry = newFeature.getGeometry();
        expect(geometry).toBeA(Circle);
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
        expect(geometry).toBeA(Circle);
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
        expect(geometry).toBeA(Circle);
        const newCenter = makePoint(reproject(center, coordinateCrs, mapCrs));
        const newRadius = reproject([radius, 0.0], coordinateCrs, mapCrs).x;
        expect(pointToPrecision(geometry.getCenter())).toEqual(pointToPrecision(newCenter));
        expect(numberToPrecision(geometry.getRadius())).toEqual(numberToPrecision(newRadius));
    });

    it('test transformPolygonToCircle with Circle', () => {
        const feature = new Feature({geometry: new Circle([5.0, 7.0], 5.0)});
        const newFeature = transformPolygonToCircle(feature);
        expect(newFeature).toEqual(feature);
    });

    it('test transformPolygonToCircle with Polygon', () => {
        const feature = new Feature({geometry: new Polygon([[1.0, 2.0], [-1.0, -1.0]])});
        const newFeature = transformPolygonToCircle(feature);
        expect(newFeature).toEqual(feature);
    });

    it('test transformPolygonToCircle when feature crs differ with mapCrs', () => {
        const mapCrs = "EPSG:4326";
        const coordinateCrs = "EPSG:3857";
        const testFeature = makeTestFeature("EPSG:3857");
        const newFeature = transformPolygonToCircle(testFeature, mapCrs, coordinateCrs);
        expect(newFeature).toExist();
        const geometry = newFeature.getGeometry();
        expect(geometry).toBeA(Circle);
        expect(numberToPrecision(geometry.getRadius())).toNotEqual(numberToPrecision(radius));
    });
});
