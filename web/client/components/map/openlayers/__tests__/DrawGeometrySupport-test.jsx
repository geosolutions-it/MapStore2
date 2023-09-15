/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import OLMap from '../Map';
import expect from 'expect';
import { act } from 'react-dom/test-utils';
import DrawGeometrySupport from '../DrawGeometrySupport';
import isNumber from 'lodash/isNumber';
import { simulatePointerClickEvent } from './OLSimulate';

describe('OpenLayers DrawGeometrySupport', () => {
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
                <OLMap
                    ref={value => { ref  = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={11}
                >
                    <DrawGeometrySupport />
                </OLMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.ol-viewport');
        expect(viewer).toBeTruthy();
        expect(ref.map).toBeTruthy();
    });
    it('should be able to draw a point', (done) => {
        let ref;
        act(() => {
            ReactDOM.render(
                <OLMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ x: 10.3, y: 43.9 }}
                    zoom={11}
                    style={{
                        position: 'fixed',
                        width: 500,
                        height: 500,
                        top: 0,
                        left: 0
                    }}
                >
                    <DrawGeometrySupport
                        active
                        geometryType="Point"
                        onDrawEnd={({ feature }) => {
                            try {
                                expect(feature).toBeTruthy();
                                expect(feature.geometry.type).toBe('Point');
                                expect(feature.geometry.coordinates.length).toBe(2);
                                expect(!!feature.properties.geodesic).toBe(false);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </OLMap>
                ,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.ol-viewport');
        expect(viewer).toBeTruthy();
        expect(ref.map).toBeTruthy();
        ref.map.once('postrender', () => {
            simulatePointerClickEvent({
                x: 0,
                y: 20,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
        });
    });
    it('should be able to draw a point with geodesic true', (done) => {
        let ref;
        act(() => {
            ReactDOM.render(
                <OLMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ x: 10.3, y: 43.9 }}
                    zoom={11}
                    style={{
                        position: 'fixed',
                        width: 500,
                        height: 500,
                        top: 0,
                        left: 0
                    }}
                >
                    <DrawGeometrySupport
                        active
                        geodesic
                        geometryType="Point"
                        onDrawEnd={({ feature }) => {
                            try {
                                expect(feature).toBeTruthy();
                                expect(feature.geometry.type).toBe('Point');
                                expect(feature.geometry.coordinates.length).toBe(2);
                                expect(!!feature.properties.geodesic).toBe(true);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </OLMap>
                ,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.ol-viewport');
        expect(viewer).toBeTruthy();
        expect(ref.map).toBeTruthy();
        ref.map.once('postrender', () => {
            simulatePointerClickEvent({
                x: 0,
                y: 20,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
        });
    });
    it('should be able to draw a line', (done) => {
        let ref;
        act(() => {
            ReactDOM.render(
                <OLMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ x: 10.3, y: 43.9 }}
                    zoom={11}
                    style={{
                        position: 'fixed',
                        width: 500,
                        height: 500,
                        top: 0,
                        left: 0
                    }}
                >
                    <DrawGeometrySupport
                        active
                        geometryType="LineString"
                        onDrawEnd={({ feature }) => {
                            try {
                                expect(feature).toBeTruthy();
                                expect(feature.geometry.type).toBe('LineString');
                                expect(feature.geometry.coordinates.length).toBe(2);
                                expect(!!feature.properties.geodesic).toBe(false);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </OLMap>
                ,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.ol-viewport');
        expect(viewer).toBeTruthy();
        expect(ref.map).toBeTruthy();
        ref.map.once('postrender', () => {
            simulatePointerClickEvent({
                x: 0,
                y: 20,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
            simulatePointerClickEvent({
                x: 0,
                y: 30,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
            simulatePointerClickEvent({
                x: 0,
                y: 30,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });

        });
    });
    it('should be able to draw a line with geodesic true', (done) => {
        let ref;
        act(() => {
            ReactDOM.render(
                <OLMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ x: 10.3, y: 43.9 }}
                    zoom={11}
                    style={{
                        position: 'fixed',
                        width: 500,
                        height: 500,
                        top: 0,
                        left: 0
                    }}
                >
                    <DrawGeometrySupport
                        active
                        geodesic
                        geometryType="LineString"
                        onDrawEnd={({ feature }) => {
                            try {
                                expect(feature).toBeTruthy();
                                expect(feature.geometry.type).toBe('LineString');
                                expect(feature.geometry.coordinates.length).toBe(2);
                                expect(!!feature.properties.geodesic).toBe(true);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </OLMap>
                ,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.ol-viewport');
        expect(viewer).toBeTruthy();
        expect(ref.map).toBeTruthy();
        ref.map.once('postrender', () => {
            simulatePointerClickEvent({
                x: 0,
                y: 20,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
            simulatePointerClickEvent({
                x: 0,
                y: 30,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
            simulatePointerClickEvent({
                x: 0,
                y: 30,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });

        });
    });
    it('should be able to draw a line with a specific coordinates length', (done) => {
        let ref;
        act(() => {
            ReactDOM.render(
                <OLMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ x: 10.3, y: 43.9 }}
                    zoom={11}
                    style={{
                        position: 'fixed',
                        width: 500,
                        height: 500,
                        top: 0,
                        left: 0
                    }}
                >
                    <DrawGeometrySupport
                        active
                        geometryType="LineString"
                        coordinatesLength={3}
                        onDrawEnd={({ feature }) => {
                            try {
                                expect(feature).toBeTruthy();
                                expect(feature.geometry.type).toBe('LineString');
                                expect(feature.geometry.coordinates.length).toBe(3);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </OLMap>
                ,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.ol-viewport');
        expect(viewer).toBeTruthy();
        expect(ref.map).toBeTruthy();
        ref.map.once('postrender', () => {
            simulatePointerClickEvent({
                x: 0,
                y: 20,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
            simulatePointerClickEvent({
                x: 0,
                y: 30,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
            simulatePointerClickEvent({
                x: 10,
                y: 40,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
        });
    });
    it('should be able to draw a polygon', (done) => {
        let ref;
        act(() => {
            ReactDOM.render(
                <OLMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ x: 10.3, y: 43.9 }}
                    zoom={11}
                    style={{
                        position: 'fixed',
                        width: 500,
                        height: 500,
                        top: 0,
                        left: 0
                    }}
                >
                    <DrawGeometrySupport
                        active
                        geometryType="Polygon"
                        onDrawEnd={({ feature }) => {
                            try {
                                expect(feature).toBeTruthy();
                                expect(feature.geometry.type).toBe('Polygon');
                                expect(feature.geometry.coordinates[0].length).toBe(4);
                                expect(!!feature.properties.geodesic).toBe(false);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </OLMap>
                ,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.ol-viewport');
        expect(viewer).toBeTruthy();
        expect(ref.map).toBeTruthy();
        ref.map.once('postrender', () => {
            simulatePointerClickEvent({
                x: 0,
                y: 20,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
            simulatePointerClickEvent({
                x: 0,
                y: 30,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
            simulatePointerClickEvent({
                x: 10,
                y: 40,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
            simulatePointerClickEvent({
                x: 10,
                y: 40,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
        });
    });
    it('should be able to draw a polygon with geodesic true', (done) => {
        let ref;
        act(() => {
            ReactDOM.render(
                <OLMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ x: 10.3, y: 43.9 }}
                    zoom={11}
                    style={{
                        position: 'fixed',
                        width: 500,
                        height: 500,
                        top: 0,
                        left: 0
                    }}
                >
                    <DrawGeometrySupport
                        active
                        geodesic
                        geometryType="Polygon"
                        onDrawEnd={({ feature }) => {
                            try {
                                expect(feature).toBeTruthy();
                                expect(feature.geometry.type).toBe('Polygon');
                                expect(feature.geometry.coordinates[0].length).toBe(4);
                                expect(!!feature.properties.geodesic).toBe(true);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                        style={{
                            position: 'fixed',
                            width: 500,
                            height: 500,
                            top: 0,
                            left: 0
                        }}
                    />
                </OLMap>
                ,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.ol-viewport');
        expect(viewer).toBeTruthy();
        expect(ref.map).toBeTruthy();
        ref.map.once('postrender', () => {
            simulatePointerClickEvent({
                x: 0,
                y: 20,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
            simulatePointerClickEvent({
                x: 0,
                y: 30,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
            simulatePointerClickEvent({
                x: 10,
                y: 40,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
            simulatePointerClickEvent({
                x: 10,
                y: 40,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
        });
    });
    it('should be able to draw a polygon with a specific coordinates length', (done) => {
        let ref;
        act(() => {
            ReactDOM.render(
                <OLMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ x: 10.3, y: 43.9 }}
                    zoom={11}
                    style={{
                        position: 'fixed',
                        width: 500,
                        height: 500,
                        top: 0,
                        left: 0
                    }}
                >
                    <DrawGeometrySupport
                        active
                        geometryType="Polygon"
                        coordinatesLength={3}
                        onDrawEnd={({ feature }) => {
                            try {
                                expect(feature).toBeTruthy();
                                expect(feature.geometry.type).toBe('Polygon');
                                expect(feature.geometry.coordinates[0].length).toBe(4);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </OLMap>
                ,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.ol-viewport');
        expect(viewer).toBeTruthy();
        expect(ref.map).toBeTruthy();
        ref.map.once('postrender', () => {
            simulatePointerClickEvent({
                x: 0,
                y: 20,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
            simulatePointerClickEvent({
                x: 0,
                y: 30,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
            simulatePointerClickEvent({
                x: 10,
                y: 40,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
        });
    });
    it('should be able to draw a circle', (done) => {
        let ref;
        act(() => {
            ReactDOM.render(
                <OLMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ x: 10.3, y: 43.9 }}
                    zoom={11}
                    style={{
                        position: 'fixed',
                        width: 500,
                        height: 500,
                        top: 0,
                        left: 0
                    }}
                >
                    <DrawGeometrySupport
                        active
                        geometryType="Circle"
                        onDrawEnd={({ feature }) => {
                            try {
                                expect(feature).toBeTruthy();
                                expect(feature.geometry.type).toBe('Point');
                                expect(feature.geometry.coordinates.length).toBe(2);
                                expect(isNumber(feature.properties.radius)).toBe(true);
                                expect(!!feature.properties.geodesic).toBe(false);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </OLMap>
                ,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.ol-viewport');
        expect(viewer).toBeTruthy();
        expect(ref.map).toBeTruthy();
        ref.map.once('postrender', () => {
            simulatePointerClickEvent({
                x: 0,
                y: 0,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
            simulatePointerClickEvent({
                x: 0,
                y: 100,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
            simulatePointerClickEvent({
                x: 0,
                y: 100,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
        });
    });
    it('should be able to draw a circle with geodesic true', (done) => {
        let ref;
        act(() => {
            ReactDOM.render(
                <OLMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ x: 10.3, y: 43.9 }}
                    zoom={11}
                    style={{
                        position: 'fixed',
                        width: 500,
                        height: 500,
                        top: 0,
                        left: 0
                    }}
                >
                    <DrawGeometrySupport
                        active
                        geometryType="Circle"
                        geodesic
                        onDrawEnd={({ feature }) => {
                            try {
                                expect(feature).toBeTruthy();
                                expect(feature.geometry.type).toBe('Point');
                                expect(feature.geometry.coordinates.length).toBe(2);
                                expect(isNumber(feature.properties.radius)).toBe(true);
                                expect(!!feature.properties.geodesic).toBe(true);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </OLMap>
                ,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.ol-viewport');
        expect(viewer).toBeTruthy();
        expect(ref.map).toBeTruthy();
        ref.map.once('postrender', () => {
            simulatePointerClickEvent({
                x: 0,
                y: 0,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
            simulatePointerClickEvent({
                x: 0,
                y: 100,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
            simulatePointerClickEvent({
                x: 0,
                y: 100,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
        });
    });
});
