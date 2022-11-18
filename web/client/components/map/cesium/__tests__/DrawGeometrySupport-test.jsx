/*
 * Copyright 2022, GeoSolutions Sas.
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
import DrawGeometrySupport from '../DrawGeometrySupport';
import * as Cesium from 'cesium';
import {
    simulateClick,
    simulateDoubleClick
} from './CesiumSimulate';

describe('Cesium DrawGeometrySupport', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with default values', () => {
        let ref;
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={11}
                >
                    <DrawGeometrySupport />
                </CesiumMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        expect(ref.map.canvas).toBeTruthy();
    });
    it('should be able to draw a point', (done) => {
        let ref;
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ x: 10.3, y: 43.9 }}
                    zoom={11}
                >
                    <DrawGeometrySupport
                        active
                        geometryType="Point"
                        getPositionInfo={() => {
                            const cartographic = new Cesium.Cartographic(10, 43, 0);
                            return {
                                cartesian: Cesium.Cartographic.toCartesian(cartographic),
                                cartographic
                            };
                        }}
                        onDrawEnd={({ coordinates, feature }) => {
                            try {
                                expect(coordinates).toBeTruthy();
                                expect(coordinates.length).toBe(1);
                                expect(feature).toBeTruthy();
                                expect(feature.geometry.type).toBe('Point');
                                expect(feature.geometry.coordinates.length).toBe(3);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </CesiumMap>
                ,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        const mapCanvas = ref.map.canvas;
        const options = { clientX: mapCanvas.clientWidth / 2, clientY: mapCanvas.clientHeight / 2 };
        simulateClick(mapCanvas, options);
    });
    it('should be able to draw a line', (done) => {
        let ref;
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ x: 10.3, y: 43.9 }}
                    zoom={11}
                >
                    <DrawGeometrySupport
                        active
                        geometryType="LineString"
                        getPositionInfo={() => {
                            const cartographic = new Cesium.Cartographic(10, 43, 0);
                            return {
                                cartesian: Cesium.Cartographic.toCartesian(cartographic),
                                cartographic
                            };
                        }}
                        onDrawEnd={({ coordinates, feature }) => {
                            try {
                                expect(coordinates).toBeTruthy();
                                expect(coordinates.length).toBe(2);
                                expect(feature).toBeTruthy();
                                expect(feature.geometry.type).toBe('LineString');
                                expect(feature.geometry.coordinates.length).toBe(2);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </CesiumMap>
                ,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        const mapCanvas = ref.map.canvas;
        const options = { clientX: mapCanvas.clientWidth / 2, clientY: mapCanvas.clientHeight / 2 };
        simulateClick(mapCanvas, options);
        simulateDoubleClick(mapCanvas, options);
    });
    it('should be able to draw a line with a specific coordinates length', (done) => {
        let ref;
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ x: 10.3, y: 43.9 }}
                    zoom={11}
                >
                    <DrawGeometrySupport
                        active
                        geometryType="LineString"
                        coordinatesLength={3}
                        getPositionInfo={() => {
                            const cartographic = new Cesium.Cartographic(10, 43, 0);
                            return {
                                cartesian: Cesium.Cartographic.toCartesian(cartographic),
                                cartographic
                            };
                        }}
                        onDrawEnd={({ coordinates, feature }) => {
                            try {
                                expect(coordinates).toBeTruthy();
                                expect(coordinates.length).toBe(3);
                                expect(feature).toBeTruthy();
                                expect(feature.geometry.type).toBe('LineString');
                                expect(feature.geometry.coordinates.length).toBe(3);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </CesiumMap>
                ,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        const mapCanvas = ref.map.canvas;
        const options = { clientX: mapCanvas.clientWidth / 2, clientY: mapCanvas.clientHeight / 2 };
        simulateClick(mapCanvas, options);
        simulateClick(mapCanvas, options);
        simulateClick(mapCanvas, options);
    });
    it('should be able to draw a polygon', (done) => {
        let ref;
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ x: 10.3, y: 43.9 }}
                    zoom={11}
                >
                    <DrawGeometrySupport
                        active
                        geometryType="Polygon"
                        getPositionInfo={() => {
                            const cartographic = new Cesium.Cartographic(10, 43, 0);
                            return {
                                cartesian: Cesium.Cartographic.toCartesian(cartographic),
                                cartographic
                            };
                        }}
                        onDrawEnd={({ coordinates, feature }) => {
                            try {
                                expect(coordinates).toBeTruthy();
                                expect(coordinates.length).toBe(4);
                                expect(feature).toBeTruthy();
                                expect(feature.geometry.type).toBe('Polygon');
                                expect(feature.geometry.coordinates[0].length).toBe(4);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </CesiumMap>
                ,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        const mapCanvas = ref.map.canvas;
        const options = { clientX: mapCanvas.clientWidth / 2, clientY: mapCanvas.clientHeight / 2 };

        simulateClick(mapCanvas, options);
        simulateClick(mapCanvas, options);
        simulateDoubleClick(mapCanvas, options);
    });
    it('should be able to draw a polygon with a specific coordinates length', (done) => {
        let ref;
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ x: 10.3, y: 43.9 }}
                    zoom={11}
                >
                    <DrawGeometrySupport
                        active
                        geometryType="Polygon"
                        coordinatesLength={3}
                        getPositionInfo={() => {
                            const cartographic = new Cesium.Cartographic(10, 43, 0);
                            return {
                                cartesian: Cesium.Cartographic.toCartesian(cartographic),
                                cartographic
                            };
                        }}
                        onDrawEnd={({ coordinates, feature }) => {
                            try {
                                expect(coordinates).toBeTruthy();
                                expect(coordinates.length).toBe(4);
                                expect(feature).toBeTruthy();
                                expect(feature.geometry.type).toBe('Polygon');
                                expect(feature.geometry.coordinates[0].length).toBe(4);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </CesiumMap>
                ,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        const mapCanvas = ref.map.canvas;
        const options = { clientX: mapCanvas.clientWidth / 2, clientY: mapCanvas.clientHeight / 2 };

        simulateClick(mapCanvas, options);
        simulateClick(mapCanvas, options);
        simulateClick(mapCanvas, options);
    });
});


