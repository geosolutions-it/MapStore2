/*
 * Copyright 2023, GeoSolutions Sas.
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
import EditGeoJSONSupport from '../EditGeoJSONSupport';
import { simulateDragEvent, simulateEvent, simulatePointerClickEvent } from './OLSimulate';

describe('OpenLayers EditGeoJSONSupport', () => {
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
                    <EditGeoJSONSupport />
                </OLMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.ol-viewport');
        expect(viewer).toBeTruthy();
        expect(ref.map).toBeTruthy();
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
                <OLMap
                    ref={value => { ref  = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={15}
                    style={{
                        position: 'fixed',
                        width: 500,
                        height: 500,
                        top: 0,
                        left: 0
                    }}
                >
                    <EditGeoJSONSupport
                        active
                        geojson={geojson}
                        onEditEnd={(newGeoJSON) => {
                            try {
                                expect(newGeoJSON.type).toBe('Feature');
                                expect(newGeoJSON.id).toBe('feature-01');
                                expect(newGeoJSON.properties).toEqual({
                                    name: 'Location 01'
                                });
                                expect(newGeoJSON.geometry.type).toBe('Point');
                                expect(newGeoJSON.geometry.coordinates.length).toBe(2);
                                expect(newGeoJSON.geometry.coordinates[0] > geojson.geometry.coordinates[0]).toBe(true);
                                expect(newGeoJSON.geometry.coordinates[1] > geojson.geometry.coordinates[1]).toBe(false);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </OLMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.ol-viewport');
        expect(viewer).toBeTruthy();
        expect(ref.map).toBeTruthy();
        ref.map.once('postrender', () => {
            simulateDragEvent({
                from: [0, 0],
                to: [10, 10],
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
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
                <OLMap
                    ref={value => { ref  = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={15}
                    style={{
                        position: 'fixed',
                        width: 500,
                        height: 500,
                        top: 0,
                        left: 0
                    }}
                >
                    <EditGeoJSONSupport
                        active
                        geojson={geojson}
                        onEditEnd={(newGeoJSON) => {
                            try {
                                expect(newGeoJSON.type).toBe('FeatureCollection');
                                expect(newGeoJSON.features.length).toBe(2);
                                const [feature0, feature1] = newGeoJSON.features;
                                expect(feature0.properties).toEqual({
                                    name: 'Location 01'
                                });
                                expect(feature0.geometry.type).toBe('Point');
                                expect(feature0.geometry.coordinates.length).toBe(2);
                                expect(feature0.geometry.coordinates[0] > geojson.features[0].geometry.coordinates[0]).toBe(true);
                                expect(feature0.geometry.coordinates[1] > geojson.features[0].geometry.coordinates[1]).toBe(false);

                                expect(feature1).toEqual(geojson.features[1]);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </OLMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.ol-viewport');
        expect(viewer).toBeTruthy();
        expect(ref.map).toBeTruthy();
        ref.map.once('postrender', () => {
            simulateDragEvent({
                from: [0, 0],
                to: [10, 10],
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
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
                <OLMap
                    ref={value => { ref  = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={15}
                    style={{
                        position: 'fixed',
                        width: 500,
                        height: 500,
                        top: 0,
                        left: 0
                    }}
                >
                    <EditGeoJSONSupport
                        active
                        geojson={geojson}
                        onEditEnd={(newGeoJSON) => {
                            try {
                                expect(newGeoJSON.type).toBe('Feature');
                                expect(newGeoJSON.id).toBe('feature-01');
                                expect(newGeoJSON.properties).toEqual({
                                    name: 'Line 01'
                                });
                                expect(newGeoJSON.geometry.type).toBe('LineString');
                                expect(newGeoJSON.geometry.coordinates[0].length).toBe(2);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </OLMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.ol-viewport');
        expect(viewer).toBeTruthy();
        expect(ref.map).toBeTruthy();
        ref.map.once('postrender', () => {
            simulateDragEvent({
                from: [0, 0],
                to: [10, 10],
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
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
                <OLMap
                    ref={value => { ref  = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={15}
                    style={{
                        position: 'fixed',
                        width: 500,
                        height: 500,
                        top: 0,
                        left: 0
                    }}
                >
                    <EditGeoJSONSupport
                        active
                        geojson={geojson}
                        onEditEnd={(newGeoJSON) => {
                            try {
                                expect(newGeoJSON.type).toBe('Feature');
                                expect(newGeoJSON.id).toBe('feature-01');
                                expect(newGeoJSON.properties).toEqual({
                                    name: 'Line 01'
                                });
                                expect(newGeoJSON.geometry.type).toBe('LineString');
                                expect(newGeoJSON.geometry.coordinates.length).toBe(4);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </OLMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.ol-viewport');
        expect(viewer).toBeTruthy();
        expect(ref.map).toBeTruthy();
        ref.map.once('postrender', () => {
            simulateEvent({
                type: 'singleclick',
                x: 0,
                y: 20,
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
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
                <OLMap
                    ref={value => { ref  = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={15}
                    style={{
                        position: 'fixed',
                        width: 500,
                        height: 500,
                        top: 0,
                        left: 0
                    }}
                >
                    <EditGeoJSONSupport
                        active
                        geojson={geojson}
                        onEditEnd={(newGeoJSON) => {
                            try {
                                expect(newGeoJSON.type).toBe('Feature');
                                expect(newGeoJSON.id).toBe('feature-01');
                                expect(newGeoJSON.properties).toEqual({
                                    name: 'Line 01'
                                });
                                expect(newGeoJSON.geometry.type).toBe('LineString');
                                expect(newGeoJSON.geometry.coordinates.length).toBe(3);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </OLMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.ol-viewport');
        expect(viewer).toBeTruthy();
        expect(ref.map).toBeTruthy();
        ref.map.once('postrender', () => {
            simulateDragEvent({
                from: [30, 0],
                to: [30, 30],
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
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
                <OLMap
                    ref={value => { ref  = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={15}
                    style={{
                        position: 'fixed',
                        width: 500,
                        height: 500,
                        top: 0,
                        left: 0
                    }}
                >
                    <EditGeoJSONSupport
                        active
                        geojson={geojson}
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
                </OLMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.ol-viewport');
        expect(viewer).toBeTruthy();
        expect(ref.map).toBeTruthy();
        ref.map.once('postrender', () => {
            simulateDragEvent({
                from: [0, 0],
                to: [10, 10],
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
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
                <OLMap
                    ref={value => { ref  = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={15}
                    style={{
                        position: 'fixed',
                        width: 500,
                        height: 500,
                        top: 0,
                        left: 0
                    }}
                >
                    <EditGeoJSONSupport
                        active
                        geojson={geojson}
                        onEditEnd={(newGeoJSON) => {
                            try {
                                expect(newGeoJSON.type).toBe('Feature');
                                expect(newGeoJSON.id).toBe('feature-01');
                                expect(newGeoJSON.properties).toEqual({
                                    name: 'Polygon 01'
                                });
                                expect(newGeoJSON.geometry.type).toBe('Polygon');
                                expect(newGeoJSON.geometry.coordinates[0].length).toBe(5);
                                expect(newGeoJSON.geometry.coordinates[0][0]).toEqual(newGeoJSON.geometry.coordinates[0][newGeoJSON.geometry.coordinates.length - 1]);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </OLMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.ol-viewport');
        expect(viewer).toBeTruthy();
        expect(ref.map).toBeTruthy();
        ref.map.once('postrender', () => {
            simulateDragEvent({
                from: [30, 0],
                to: [30, 30],
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
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
                geodesic: false,
                radius: 500
            }
        };
        act(() => {
            ReactDOM.render(
                <OLMap
                    ref={value => { ref  = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={15}
                    style={{
                        position: 'fixed',
                        width: 500,
                        height: 500,
                        top: 0,
                        left: 0
                    }}
                >
                    <EditGeoJSONSupport
                        active
                        geojson={geojson}
                        getGeometryType={(feature) => feature.properties.type}
                        onEditEnd={(newGeoJSON) => {
                            try {
                                expect(newGeoJSON.type).toBe('Feature');
                                expect(newGeoJSON.id).toBe('feature-01');
                                expect(newGeoJSON.properties).toEqual({
                                    name: 'Location 01',
                                    type: 'Circle',
                                    geodesic: false,
                                    radius: 500
                                });
                                expect(newGeoJSON.geometry.type).toBe('Point');
                                expect(newGeoJSON.geometry.coordinates.length).toBe(2);
                                expect(newGeoJSON.geometry.coordinates[0] > geojson.geometry.coordinates[0]).toBe(true);
                                expect(newGeoJSON.geometry.coordinates[1] > geojson.geometry.coordinates[1]).toBe(false);
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </OLMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.ol-viewport');
        expect(viewer).toBeTruthy();
        expect(ref.map).toBeTruthy();
        ref.map.once('postrender', () => {
            simulateDragEvent({
                from: [0, 0],
                to: [100, 100],
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
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
                geodesic: false,
                radius: 700
            }
        };
        act(() => {
            ReactDOM.render(
                <OLMap
                    ref={value => { ref  = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={15}
                    style={{
                        position: 'fixed',
                        width: 500,
                        height: 500,
                        top: 0,
                        left: 0
                    }}
                >
                    <EditGeoJSONSupport
                        active
                        geojson={geojson}
                        getGeometryType={(feature) => feature.properties.type}
                        style={{
                            lineDrawing: {
                                color: '#000000',
                                opacity: 1.0,
                                depthFailColor: '#000000',
                                depthFailOpacity: 1.0,
                                width: 16
                            }
                        }}
                        onEditEnd={(newGeoJSON) => {
                            try {
                                expect(newGeoJSON.type).toBe('Feature');
                                expect(newGeoJSON.id).toBe('feature-01');
                                const { radius, ...properties } = newGeoJSON.properties;
                                expect(properties).toEqual({
                                    name: 'Location 01',
                                    type: 'Circle',
                                    geodesic: false
                                });
                                expect(Math.round(radius)).toBe(244);
                                expect(newGeoJSON.geometry.type).toBe('Point');
                            } catch (e) {
                                done(e);
                            }
                            done();
                        }}
                    />
                </OLMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.ol-viewport');
        expect(viewer).toBeTruthy();
        expect(ref.map).toBeTruthy();
        ref.map.once('postrender', () => {
            simulateDragEvent({
                from: [145, 0],
                to: [50, 10],
                map: ref.map,
                button: 0,
                width: 500,
                height: 500
            });
        });
    });
});
