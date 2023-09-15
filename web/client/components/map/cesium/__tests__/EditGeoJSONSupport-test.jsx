/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import CesiumMap from '../Map';
import expect from 'expect';
import { act } from 'react-dom/test-utils';
import EditGeoJSONSupport from '../EditGeoJSONSupport';
import {
    simulateClick,
    simulateDoubleClick
} from './CesiumSimulate';
import * as Cesium from 'cesium';
import {
    createPolylinePrimitive,
    createEllipsePolylinePrimitive
} from '../../../../utils/cesium/PrimitivesUtils';

describe('Cesium EditGeoJSONSupport', () => {
    let staticBillboardCollection;
    const polylinePrimitive = createPolylinePrimitive({
        coordinates: [
            Cesium.Cartographic.toCartesian(new Cesium.Cartographic(Cesium.Math.toRadians(10.3), Cesium.Math.toRadians(43.9), 0)),
            Cesium.Cartographic.toCartesian(new Cesium.Cartographic(Cesium.Math.toRadians(11.3), Cesium.Math.toRadians(43.9), 0))
        ]
    });
    const ellipsePrimitive = createEllipsePolylinePrimitive({
        coordinates: Cesium.Cartographic.toCartesian(new Cesium.Cartographic(Cesium.Math.toRadians(10.3), Cesium.Math.toRadians(43.9), 0)),
        radius: 500,
        geodesic: true
    });
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        staticBillboardCollection = new Cesium.BillboardCollection();
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        staticBillboardCollection.removeAll();
        staticBillboardCollection.destroy();
        setTimeout(done);
    });
    it('should render with default values', () => {
        let ref;
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref  = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={11}
                >
                    <EditGeoJSONSupport />
                </CesiumMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        expect(ref.map.canvas).toBeTruthy();
    });
    it('edit single feature', (done) => {
        let ref;
        const geojson = {
            id: 'feature-01',
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [10.3, 43.9]
            },
            properties: {
                name: 'Location 01'
            }
        };
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref  = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={15}
                    style={{
                        position: 'fixed',
                        width: 60,
                        height: 60,
                        top: 0,
                        left: 0
                    }}
                >
                    <EditGeoJSONSupport
                        active
                        geojson={geojson}
                        getPositionInfo={() => {
                            const cartographic = new Cesium.Cartographic(Cesium.Math.toRadians(10.35), Cesium.Math.toRadians(43.85), 0);
                            const cartesian = Cesium.Cartographic.toCartesian(cartographic);
                            staticBillboardCollection.add({
                                id: geojson.id,
                                position: cartesian
                            });
                            return {
                                intersected: [{
                                    primitive: staticBillboardCollection.get(0),
                                    id: geojson.id
                                }],
                                cartesian,
                                cartographic
                            };
                        }}
                        onEditEnd={(newGeoJSON) => {
                            try {
                                expect(newGeoJSON.type).toBe('Feature');
                                expect(newGeoJSON.id).toBe('feature-01');
                                expect(newGeoJSON.properties).toEqual({
                                    name: 'Location 01'
                                });
                                expect(newGeoJSON.geometry.type).toBe('Point');
                                expect(newGeoJSON.geometry.coordinates.length).toBe(3);
                                expect(newGeoJSON.geometry.coordinates[0] > geojson.geometry.coordinates[0]).toBe(true);
                                expect(newGeoJSON.geometry.coordinates[1] > geojson.geometry.coordinates[1]).toBe(false);
                                expect(Math.round(newGeoJSON.geometry.coordinates[2])).toBe(0);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </CesiumMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        expect(ref.map.canvas).toBeTruthy();
        const mapCanvas = ref.map.canvas;
        const options = { clientX: mapCanvas.clientWidth / 2, clientY: mapCanvas.clientHeight / 2 };
        simulateClick(mapCanvas, options);
        simulateClick(mapCanvas, {
            clientX: options.clientX + 5,
            clientY: options.clientY + 5
        });
    });
    it('edit feature collection', (done) => {
        let ref;
        const geojson = {
            type: 'FeatureCollection',
            features: [
                {
                    id: 'feature-01',
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [10.3, 43.9]
                    },
                    properties: {
                        name: 'Location 01'
                    }
                },
                {
                    id: 'feature-02',
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [11.3, 44.9]
                    },
                    properties: {
                        name: 'Location 02'
                    }
                }
            ]
        };
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref  = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={15}
                    style={{
                        position: 'fixed',
                        width: 60,
                        height: 60,
                        top: 0,
                        left: 0
                    }}
                >
                    <EditGeoJSONSupport
                        active
                        geojson={geojson}
                        getPositionInfo={() => {
                            const cartographic = new Cesium.Cartographic(Cesium.Math.toRadians(10.35), Cesium.Math.toRadians(43.85), 0);
                            const cartesian = Cesium.Cartographic.toCartesian(cartographic);
                            staticBillboardCollection.add({
                                id: geojson.features[0].id,
                                position: cartesian
                            });
                            return {
                                intersected: [{
                                    primitive: staticBillboardCollection.get(0),
                                    id: geojson.features[0].id
                                }],
                                cartesian,
                                cartographic
                            };
                        }}
                        onEditEnd={(newGeoJSON) => {
                            try {
                                expect(newGeoJSON.type).toBe('FeatureCollection');
                                expect(newGeoJSON.features.length).toBe(2);
                                const [feature0, feature1] = newGeoJSON.features;
                                expect(feature0.properties).toEqual({
                                    name: 'Location 01'
                                });
                                expect(feature0.geometry.type).toBe('Point');
                                expect(feature0.geometry.coordinates.length).toBe(3);
                                expect(feature0.geometry.coordinates[0] > geojson.features[0].geometry.coordinates[0]).toBe(true);
                                expect(feature0.geometry.coordinates[1] > geojson.features[0].geometry.coordinates[1]).toBe(false);
                                expect(Math.round(feature0.geometry.coordinates[2])).toBe(0);

                                expect(feature1).toEqual(geojson.features[1]);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </CesiumMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        expect(ref.map.canvas).toBeTruthy();
        const mapCanvas = ref.map.canvas;
        const options = { clientX: mapCanvas.clientWidth / 2, clientY: mapCanvas.clientHeight / 2 };
        simulateClick(mapCanvas, options);
        simulateClick(mapCanvas, {
            clientX: options.clientX + 5,
            clientY: options.clientY + 5
        });
    });
    it('edit linestring feature vertex', (done) => {
        let ref;
        const geojson = {
            id: 'feature-01',
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [[10.3, 43.9], [11.3, 43.9]]
            },
            properties: {
                name: 'Line 01'
            }
        };
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref  = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={15}
                    style={{
                        position: 'fixed',
                        width: 60,
                        height: 60,
                        top: 0,
                        left: 0
                    }}
                >
                    <EditGeoJSONSupport
                        active
                        geojson={geojson}
                        getPositionInfo={() => {
                            const id = `${geojson.id}:0:vertex`;
                            const cartographic = new Cesium.Cartographic(Cesium.Math.toRadians(10.35), Cesium.Math.toRadians(43.85), 0);
                            const cartesian = Cesium.Cartographic.toCartesian(cartographic);
                            staticBillboardCollection.add({
                                id,
                                position: cartesian
                            });
                            return {
                                intersected: [{
                                    primitive: staticBillboardCollection.get(0),
                                    id
                                }],
                                cartesian,
                                cartographic
                            };
                        }}
                        onEditEnd={(newGeoJSON) => {
                            try {
                                expect(newGeoJSON.type).toBe('Feature');
                                expect(newGeoJSON.id).toBe('feature-01');
                                expect(newGeoJSON.properties).toEqual({
                                    name: 'Line 01'
                                });
                                expect(newGeoJSON.geometry.type).toBe('LineString');
                                expect(newGeoJSON.geometry.coordinates[0].length).toBe(3);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </CesiumMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        expect(ref.map.canvas).toBeTruthy();
        const mapCanvas = ref.map.canvas;
        const options = { clientX: (mapCanvas.clientWidth / 2) - 5, clientY: mapCanvas.clientHeight / 2 };
        simulateClick(mapCanvas, options);
        simulateClick(mapCanvas, {
            clientX: options.clientX + 5,
            clientY: options.clientY + 5
        });
    });
    it('edit linestring adding new point', (done) => {
        let ref;
        const geojson = {
            id: 'feature-01',
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [[10.3, 43.9], [11.3, 43.9]]
            },
            properties: {
                name: 'Line 01'
            }
        };
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref  = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={15}
                    style={{
                        position: 'fixed',
                        width: 60,
                        height: 60,
                        top: 0,
                        left: 0
                    }}
                >
                    <EditGeoJSONSupport
                        active
                        geojson={geojson}
                        getPositionInfo={() => {
                            const cartographic = new Cesium.Cartographic(Cesium.Math.toRadians(10.35), Cesium.Math.toRadians(43.85), 0);
                            const id = `${geojson.id}:0:segment`;
                            return {
                                intersected: [{
                                    primitive: polylinePrimitive,
                                    id
                                }],
                                cartesian: Cesium.Cartographic.toCartesian(cartographic),
                                cartographic
                            };
                        }}
                        onEditEnd={(newGeoJSON) => {
                            try {
                                expect(newGeoJSON.type).toBe('Feature');
                                expect(newGeoJSON.id).toBe('feature-01');
                                expect(newGeoJSON.properties).toEqual({
                                    name: 'Line 01'
                                });
                                expect(newGeoJSON.geometry.type).toBe('LineString');
                                expect(newGeoJSON.geometry.coordinates.length).toBe(3);
                                expect(newGeoJSON.geometry.coordinates[1].length).toBe(3);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </CesiumMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        expect(ref.map.canvas).toBeTruthy();
        const mapCanvas = ref.map.canvas;
        const options = { clientX: (mapCanvas.clientWidth / 2) + 10, clientY: mapCanvas.clientHeight / 2 };
        simulateClick(mapCanvas, options);
        simulateClick(mapCanvas, {
            clientX: options.clientX + 5,
            clientY: options.clientY + 5
        });
    });
    it('edit linestring extend coordinates', (done) => {
        let ref;
        const geojson = {
            id: 'feature-01',
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [[10.3, 43.9], [11.3, 43.9]]
            },
            properties: {
                name: 'Line 01'
            }
        };
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref  = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={15}
                    style={{
                        position: 'fixed',
                        width: 60,
                        height: 60,
                        top: 0,
                        left: 0
                    }}
                >
                    <EditGeoJSONSupport
                        active
                        geojson={geojson}
                        getPositionInfo={() => {
                            const cartographic = new Cesium.Cartographic(Cesium.Math.toRadians(10.35), Cesium.Math.toRadians(43.85), 0);
                            return {
                                intersected: [],
                                cartesian: Cesium.Cartographic.toCartesian(cartographic),
                                cartographic
                            };
                        }}
                        onEditEnd={(newGeoJSON) => {
                            try {
                                expect(newGeoJSON.type).toBe('Feature');
                                expect(newGeoJSON.id).toBe('feature-01');
                                expect(newGeoJSON.properties).toEqual({
                                    name: 'Line 01'
                                });
                                expect(newGeoJSON.geometry.type).toBe('LineString');
                                expect(newGeoJSON.geometry.coordinates.length).toBe(3);
                                expect(newGeoJSON.geometry.coordinates[2].length).toBe(3);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </CesiumMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        expect(ref.map.canvas).toBeTruthy();
        const mapCanvas = ref.map.canvas;
        const options = { clientX: mapCanvas.clientWidth / 3, clientY: mapCanvas.clientHeight / 3 };
        simulateClick(mapCanvas, options);
        simulateDoubleClick(mapCanvas, {
            clientX: options.clientX + 5,
            clientY: options.clientY + 5
        });
    });
    it('edit polygon feature vertex', (done) => {
        let ref;
        const geojson = {
            id: 'feature-01',
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[[10.3, 43.9], [11.3, 43.9], [12.3, 42.9], [10.3, 43.9]]]
            },
            properties: {
                name: 'Polygon 01'
            }
        };
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref  = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={15}
                    style={{
                        position: 'fixed',
                        width: 60,
                        height: 60,
                        top: 0,
                        left: 0
                    }}
                >
                    <EditGeoJSONSupport
                        active
                        geojson={geojson}
                        getPositionInfo={() => {
                            const id = `${geojson.id}:0:vertex`;
                            const cartographic = new Cesium.Cartographic(Cesium.Math.toRadians(10.35), Cesium.Math.toRadians(43.85), 0);
                            const cartesian = Cesium.Cartographic.toCartesian(cartographic);
                            staticBillboardCollection.add({
                                id,
                                position: cartesian
                            });
                            return {
                                intersected: [{
                                    primitive: staticBillboardCollection.get(0),
                                    id
                                }],
                                cartesian,
                                cartographic
                            };
                        }}
                        onEditEnd={(newGeoJSON) => {
                            try {
                                expect(newGeoJSON.type).toBe('Feature');
                                expect(newGeoJSON.id).toBe('feature-01');
                                expect(newGeoJSON.properties).toEqual({
                                    name: 'Polygon 01'
                                });
                                expect(newGeoJSON.geometry.type).toBe('Polygon');
                                expect(newGeoJSON.geometry.coordinates[0].length).toBe(4);
                                expect(newGeoJSON.geometry.coordinates[0][0]).toEqual(newGeoJSON.geometry.coordinates[0][newGeoJSON.geometry.coordinates.length - 1]);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </CesiumMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        expect(ref.map.canvas).toBeTruthy();
        const mapCanvas = ref.map.canvas;
        const options = { clientX: (mapCanvas.clientWidth / 2) - 5, clientY: mapCanvas.clientHeight / 2 };
        simulateClick(mapCanvas, options);
        simulateClick(mapCanvas, {
            clientX: options.clientX + 5,
            clientY: options.clientY + 5
        });
    });
    it('edit polygon adding new point', (done) => {
        let ref;
        const geojson = {
            id: 'feature-01',
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[[10.3, 43.9], [11.3, 43.9], [12.3, 42.9], [10.3, 43.9]]]
            },
            properties: {
                name: 'Polygon 01'
            }
        };
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref  = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={15}
                    style={{
                        position: 'fixed',
                        width: 60,
                        height: 60,
                        top: 0,
                        left: 0
                    }}
                >
                    <EditGeoJSONSupport
                        active
                        geojson={geojson}
                        getPositionInfo={() => {
                            const cartographic = new Cesium.Cartographic(Cesium.Math.toRadians(10.35), Cesium.Math.toRadians(43.85), 0);
                            const id = `${geojson.id}:0:segment`;
                            return {
                                intersected: [{
                                    primitive: polylinePrimitive,
                                    id
                                }],
                                cartesian: Cesium.Cartographic.toCartesian(cartographic),
                                cartographic
                            };
                        }}
                        onEditEnd={(newGeoJSON) => {
                            try {
                                expect(newGeoJSON.type).toBe('Feature');
                                expect(newGeoJSON.id).toBe('feature-01');
                                expect(newGeoJSON.properties).toEqual({
                                    name: 'Polygon 01'
                                });
                                expect(newGeoJSON.geometry.type).toBe('Polygon');
                                expect(newGeoJSON.geometry.coordinates[0].length).toBe(5);
                                expect(newGeoJSON.geometry.coordinates[0][1].length).toBe(3);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </CesiumMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        expect(ref.map.canvas).toBeTruthy();
        const mapCanvas = ref.map.canvas;
        const options = { clientX: (mapCanvas.clientWidth / 2) + 10, clientY: mapCanvas.clientHeight / 2 };
        simulateClick(mapCanvas, options);
        simulateClick(mapCanvas, {
            clientX: options.clientX + 5,
            clientY: options.clientY + 5
        });
    });
    it('edit circle geometry center', (done) => {
        let ref;
        const geojson = {
            id: 'feature-01',
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [10.3, 43.9]
            },
            properties: {
                name: 'Location 01',
                type: 'Circle',
                geodesic: true,
                radius: 500
            }
        };
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref  = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={15}
                    style={{
                        position: 'fixed',
                        width: 60,
                        height: 60,
                        top: 0,
                        left: 0
                    }}
                >
                    <EditGeoJSONSupport
                        active
                        geojson={geojson}
                        getGeometryType={(feature) => feature.properties.type}
                        getPositionInfo={() => {
                            const id = `${geojson.id}:0:vertex`;
                            const cartographic = new Cesium.Cartographic(Cesium.Math.toRadians(10.35), Cesium.Math.toRadians(43.85), 0);
                            const cartesian = Cesium.Cartographic.toCartesian(cartographic);
                            staticBillboardCollection.add({
                                id,
                                position: cartesian
                            });
                            return {
                                intersected: [{
                                    primitive: staticBillboardCollection.get(0),
                                    id
                                }],
                                cartesian,
                                cartographic
                            };
                        }}
                        onEditEnd={(newGeoJSON) => {
                            try {
                                expect(newGeoJSON.type).toBe('Feature');
                                expect(newGeoJSON.id).toBe('feature-01');
                                expect(newGeoJSON.properties).toEqual({
                                    name: 'Location 01',
                                    type: 'Circle',
                                    geodesic: true,
                                    radius: 500
                                });
                                expect(newGeoJSON.geometry.type).toBe('Point');
                                expect(newGeoJSON.geometry.coordinates.length).toBe(3);
                                expect(newGeoJSON.geometry.coordinates[0] > geojson.geometry.coordinates[0]).toBe(true);
                                expect(newGeoJSON.geometry.coordinates[1] > geojson.geometry.coordinates[1]).toBe(false);
                                expect(Math.round(newGeoJSON.geometry.coordinates[2])).toBe(0);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </CesiumMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        expect(ref.map.canvas).toBeTruthy();
        const mapCanvas = ref.map.canvas;
        const options = { clientX: mapCanvas.clientWidth / 2, clientY: mapCanvas.clientHeight / 2 };
        simulateClick(mapCanvas, options);
        simulateClick(mapCanvas, {
            clientX: options.clientX + 5,
            clientY: options.clientY + 5
        });
    });
    it('edit circle geometry radius', (done) => {
        let ref;
        const geojson = {
            id: 'feature-01',
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [10.3, 43.9]
            },
            properties: {
                name: 'Location 01',
                type: 'Circle',
                geodesic: true,
                radius: 500
            }
        };
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref  = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={15}
                    style={{
                        position: 'fixed',
                        width: 60,
                        height: 60,
                        top: 0,
                        left: 0
                    }}
                >
                    <EditGeoJSONSupport
                        active
                        geojson={geojson}
                        getGeometryType={(feature) => feature.properties.type}
                        getPositionInfo={() => {
                            const cartographic = new Cesium.Cartographic(Cesium.Math.toRadians(10.35), Cesium.Math.toRadians(43.85), 0);
                            return {
                                intersected: [{
                                    primitive: ellipsePrimitive,
                                    id: "feature-01"
                                }],
                                cartesian: Cesium.Cartographic.toCartesian(cartographic),
                                cartographic
                            };
                        }}
                        onEditEnd={(newGeoJSON) => {
                            try {
                                expect(newGeoJSON.type).toBe('Feature');
                                expect(newGeoJSON.id).toBe('feature-01');
                                const { radius, ...properties } = newGeoJSON.properties;
                                expect(properties).toEqual({
                                    name: 'Location 01',
                                    type: 'Circle',
                                    geodesic: true
                                });
                                expect(Math.round(radius)).toBe(6857);
                                expect(newGeoJSON.geometry.type).toBe('Point');
                                expect(newGeoJSON.geometry.coordinates).toEqual(geojson.geometry.coordinates);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </CesiumMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        expect(ref.map.canvas).toBeTruthy();
        const mapCanvas = ref.map.canvas;
        const options = { clientX: (mapCanvas.clientWidth / 2) + 11, clientY: mapCanvas.clientHeight / 2 };
        simulateClick(mapCanvas, options);
        simulateClick(mapCanvas, {
            clientX: options.clientX + 39,
            clientY: options.clientY
        });
    });
});
