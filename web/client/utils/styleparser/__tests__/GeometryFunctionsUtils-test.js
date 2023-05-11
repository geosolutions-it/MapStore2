/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import * as Cesium from 'cesium';

import OlGeomPoint from 'ol/geom/Point';
import OlGeomLineString from 'ol/geom/LineString';
import GeoJSON from 'ol/format/GeoJSON';
import { getCenter } from 'ol/extent';

import { geometryFunctionsLibrary } from '../GeometryFunctionsUtils';

const lineString = {
    type: 'Feature',
    properties: {},
    geometry: {
        type: 'LineString',
        coordinates: [[0, 0], [1, 1]]
    }
};
const polygon = {
    type: 'Feature',
    properties: {},
    geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [0, 1], [1, 1], [0, 0]]]
    }
};

describe('GeometryFunctionsUtils', () => {
    describe('cesium', () => {
        const getGeometryFunction = geometryFunctionsLibrary.cesium({ Cesium });
        it('centerPoint', (done) => {
            Cesium.GeoJsonDataSource.load({
                type: 'FeatureCollection',
                features: [lineString, polygon]
            }).then((dataSource) => {
                try {
                    const [lineStringEntity, polygonEntity] = dataSource?.entities?.values;

                    lineStringEntity._msStoredCoordinates = {};
                    lineStringEntity._msStoredCoordinates.polyline = lineStringEntity.polyline.positions;
                    expect(lineStringEntity.position).toBe(undefined);
                    getGeometryFunction({ msGeometry: { name: 'centerPoint' } })(lineStringEntity);
                    expect(lineStringEntity.position.getValue(Cesium.JulianDate.now()).toString()).toBe('(6377168.903116016, 55648.499534066716, 55284.387412283315)');

                    polygonEntity._msStoredCoordinates = {};
                    polygonEntity._msStoredCoordinates.polygon = polygonEntity.polygon.hierarchy;
                    expect(polygonEntity.position).toBe(undefined);
                    getGeometryFunction({ msGeometry: { name: 'centerPoint' } })(polygonEntity);
                    expect(polygonEntity.position.getValue(Cesium.JulianDate.now()).toString()).toBe('(6377652.9150632555, 55656.9338051044, 55286.450279746416)');
                } catch (e) {
                    done(e);
                }
                done();
            });
        });
        it('lineToArc', (done) => {
            Cesium.GeoJsonDataSource.load({
                type: 'FeatureCollection',
                features: [lineString]
            }).then((dataSource) => {
                try {
                    const [lineStringEntity] = dataSource?.entities?.values;
                    lineStringEntity.polyline.arcType = Cesium.ArcType.NONE;
                    getGeometryFunction({ msGeometry: { name: 'lineToArc' } })(lineStringEntity);
                    expect(lineStringEntity.polyline.arcType.getValue(Cesium.JulianDate.now())).toBe(Cesium.ArcType.GEODESIC);
                } catch (e) {
                    done(e);
                }
                done();
            });
        });
        it('startPoint', (done) => {
            Cesium.GeoJsonDataSource.load({
                type: 'FeatureCollection',
                features: [lineString, polygon]
            }).then((dataSource) => {
                try {
                    const [lineStringEntity, polygonEntity] = dataSource?.entities?.values;

                    lineStringEntity._msStoredCoordinates = {};
                    lineStringEntity._msStoredCoordinates.polyline = lineStringEntity.polyline.positions;
                    expect(lineStringEntity.position).toBe(undefined);
                    getGeometryFunction({ msGeometry: { name: 'startPoint' } })(lineStringEntity);
                    expect(lineStringEntity.position.getValue(Cesium.JulianDate.now()).toString()).toBe('(6378137, 0, 0)');

                    polygonEntity._msStoredCoordinates = {};
                    polygonEntity._msStoredCoordinates.polygon = polygonEntity.polygon.hierarchy;
                    expect(polygonEntity.position).toBe(undefined);
                    getGeometryFunction({ msGeometry: { name: 'startPoint' } })(polygonEntity);
                    expect(polygonEntity.position.getValue(Cesium.JulianDate.now()).toString()).toBe('(6378137, 0, 0)');
                } catch (e) {
                    done(e);
                }
                done();
            });
        });
        it('endPoint', (done) => {
            Cesium.GeoJsonDataSource.load({
                type: 'FeatureCollection',
                features: [lineString, polygon]
            }).then((dataSource) => {
                try {
                    const [lineStringEntity, polygonEntity] = dataSource?.entities?.values;

                    lineStringEntity._msStoredCoordinates = {};
                    lineStringEntity._msStoredCoordinates.polyline = lineStringEntity.polyline.positions;
                    expect(lineStringEntity.position).toBe(undefined);
                    getGeometryFunction({ msGeometry: { name: 'endPoint' } })(lineStringEntity);
                    expect(lineStringEntity.position.getValue(Cesium.JulianDate.now()).toString()).toBe('(6376200.806232033, 111296.99906813345, 110568.77482456663)');

                    polygonEntity._msStoredCoordinates = {};
                    polygonEntity._msStoredCoordinates.polygon = polygonEntity.polygon.hierarchy;
                    expect(polygonEntity.position).toBe(undefined);
                    getGeometryFunction({ msGeometry: { name: 'endPoint' } })(polygonEntity);
                    expect(polygonEntity.position.getValue(Cesium.JulianDate.now()).toString()).toBe('(6376200.806232033, 111296.99906813345, 110568.77482456663)');
                } catch (e) {
                    done(e);
                }
                done();
            });
        });
    });
    describe('openlayers', () => {
        const getGeometryFunction = geometryFunctionsLibrary.openlayers({
            Point: OlGeomPoint,
            LineString: OlGeomLineString,
            GeoJSON,
            getCenter
        });
        const geoJSONParser = new GeoJSON();
        it('centerPoint', () => {
            const olLineStringFeature = geoJSONParser.readFeatureFromObject(lineString, { featureProjection: 'EPSG:3857', dataProjection: 'EPSG:4326'});
            expect(getGeometryFunction({ msGeometry: { name: 'centerPoint' } }, olLineStringFeature).geometry(olLineStringFeature).getCoordinates())
                .toEqual([ 55655.50634181371, 55662.571271759254 ]);
            const olPolygonFeature = geoJSONParser.readFeatureFromObject(polygon, { featureProjection: 'EPSG:3857', dataProjection: 'EPSG:4326'});
            expect(getGeometryFunction({ msGeometry: { name: 'centerPoint' } }, olPolygonFeature).geometry(olPolygonFeature).getCoordinates())
                .toEqual([ 55659.74539663679, 55662.571433192075 ]);
        });
        it('lineToArc', () => {
            const olLineStringFeature = geoJSONParser.readFeatureFromObject(lineString, { featureProjection: 'EPSG:3857', dataProjection: 'EPSG:4326'});
            expect(getGeometryFunction({ msGeometry: { name: 'lineToArc' } }, olLineStringFeature).geometry(olLineStringFeature).getCoordinates().length)
                .toBe(100);
        });
        it('startPoint', () => {
            const olLineStringFeature = geoJSONParser.readFeatureFromObject(lineString, { featureProjection: 'EPSG:3857', dataProjection: 'EPSG:4326'});
            expect(getGeometryFunction({ msGeometry: { name: 'startPoint' } }, olLineStringFeature).geometry(olLineStringFeature).getCoordinates())
                .toEqual([ 0, -7.081154551613622e-10 ]);
            const olPolygonFeature = geoJSONParser.readFeatureFromObject(polygon, { featureProjection: 'EPSG:3857', dataProjection: 'EPSG:4326'});
            expect(getGeometryFunction({ msGeometry: { name: 'startPoint' } }, olPolygonFeature).geometry(olPolygonFeature).getCoordinates())
                .toEqual([ 0, -7.081154551613622e-10 ]);
        });
        it('endPoint', () => {
            const olLineStringFeature = geoJSONParser.readFeatureFromObject(lineString, { featureProjection: 'EPSG:3857', dataProjection: 'EPSG:4326'});
            expect(getGeometryFunction({ msGeometry: { name: 'endPoint' } }, olLineStringFeature).geometry(olLineStringFeature).getCoordinates())
                .toEqual([ 111319.49079327358, 111325.14286638486 ]);
            const olPolygonFeature = geoJSONParser.readFeatureFromObject(polygon, { featureProjection: 'EPSG:3857', dataProjection: 'EPSG:4326'});
            expect(getGeometryFunction({ msGeometry: { name: 'endPoint' } }, olPolygonFeature).geometry(olPolygonFeature).getCoordinates())
                .toEqual([ 111319.49079327358, 111325.14286638486 ]);
        });
    });
    describe('geojson', () => {
        const getGeometryFunction = geometryFunctionsLibrary.geojson();
        it('centerPoint', () => {
            expect(getGeometryFunction({ msGeometry: { name: 'centerPoint' } })(lineString).map(coord => coord.toFixed(2)).join(' '))
                .toBe('0.50 0.50');
            expect(getGeometryFunction({ msGeometry: { name: 'centerPoint' } })(polygon).map(coord => coord.toFixed(2)).join(' '))
                .toBe('0.50 0.50');
        });
        it('lineToArc', () => {
            const coordinates = getGeometryFunction({ msGeometry: { name: 'lineToArc' } })(lineString);
            expect(coordinates.length).toBe(100);
        });
        it('startPoint', () => {
            expect(getGeometryFunction({ msGeometry: { name: 'startPoint' } })(lineString))
                .toBe(lineString.geometry.coordinates[0]);
            expect(getGeometryFunction({ msGeometry: { name: 'startPoint' } })(polygon))
                .toBe(polygon.geometry.coordinates[0][0]);
        });
        it('endPoint', () => {
            expect(getGeometryFunction({ msGeometry: { name: 'endPoint' } })(lineString))
                .toBe(lineString.geometry.coordinates[lineString.geometry.coordinates.length - 1]);
            expect(getGeometryFunction({ msGeometry: { name: 'endPoint' } })(polygon))
                .toBe(polygon.geometry.coordinates[0][polygon.geometry.coordinates[0].length - 2]);
        });
    });
});
