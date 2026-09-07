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
import DrawMeasureSupport from '../DrawMeasureSupport';
import {
    convertUom,
    MeasureTypes,
    defaultUnitOfMeasure
} from '../../../../utils/MeasureUtils';
import { computeArea } from '../../../../utils/cesium/MathUtils';
import * as Cesium from 'cesium';
import {
    simulateClick,
    simulateDoubleClick
} from './CesiumSimulate';

describe('Cesium DrawMeasureSupport', () => {
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
                    <DrawMeasureSupport />
                </CesiumMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        expect(ref.map.canvas).toBeTruthy();
    });
    it('should be to measure with a 3D polyline', (done) => {
        let ref;

        let count = 0;
        const polyline = [
            new Cesium.Cartographic(10, 43, 0),
            new Cesium.Cartographic(11, 44, 0)
        ];

        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ x: 10.3, y: 43.9 }}
                    zoom={11}
                >
                    <DrawMeasureSupport
                        active
                        type={MeasureTypes.POLYLINE_DISTANCE_3D}
                        unitsOfMeasure={defaultUnitOfMeasure}
                        getPositionInfo={() => {
                            const cartographic = polyline[count] ?? polyline[polyline.length - 1];
                            count++;
                            return {
                                cartesian: Cesium.Cartographic.toCartesian(cartographic),
                                cartographic
                            };
                        }}
                        onUpdateCollection={(collection) => {
                            if (collection.features.length > 0) {
                                try {
                                    expect(collection).toBeTruthy();
                                    expect(collection.features.length).toBe(1);
                                    expect(ref.map.scene.primitives.length).toBe(8);
                                    const staticPrimitivesCollection = ref.map.scene.primitives.get(2);
                                    expect(staticPrimitivesCollection.length).toBe(1);
                                    expect(staticPrimitivesCollection.get(0).geometryInstances.geometry instanceof Cesium.PolylineGeometry).toBe(true);
                                    const staticBillboardCollection = ref.map.scene.primitives.get(3);
                                    expect(staticBillboardCollection.length).toBe(0);
                                    const staticLabelsCollection = ref.map.scene.primitives.get(4);
                                    expect(staticLabelsCollection.length).toBe(2);
                                    expect(staticLabelsCollection.get(0).text).toBe('7609361.39 m');
                                    expect(staticLabelsCollection.get(1).text).toBe('7609361.39 m');
                                } catch (e) {
                                    done(e);
                                }
                                done();
                            }
                        }}
                    />
                </CesiumMap>
                ,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        const mapCanvas = ref.map.canvas;

        simulateClick(mapCanvas);
        simulateDoubleClick(mapCanvas);
    });
    it('should be able to measure a 3D area', (done) => {
        let ref;

        let count = 0;
        const polygon = [
            new Cesium.Cartographic(10, 43, 0),
            new Cesium.Cartographic(11, 44, 0),
            new Cesium.Cartographic(10, 44, 0)
        ];

        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ x: 10.3, y: 43.9 }}
                    zoom={11}
                >
                    <DrawMeasureSupport
                        active
                        type={MeasureTypes.AREA_3D}
                        unitsOfMeasure={defaultUnitOfMeasure}
                        getPositionInfo={() => {
                            const cartographic = polygon[count] ?? polygon[polygon.length - 1];
                            count++;
                            return {
                                cartesian: Cesium.Cartographic.toCartesian(cartographic),
                                cartographic
                            };
                        }}
                        onUpdateCollection={(collection) => {
                            if (collection.features.length > 0) {
                                try {
                                    expect(collection).toBeTruthy();
                                    expect(collection.features.length).toBe(1);
                                    expect(ref.map.scene.primitives.length).toBe(8);
                                    const staticPrimitivesCollection = ref.map.scene.primitives.get(2);
                                    expect(staticPrimitivesCollection.length).toBe(2);
                                    expect(staticPrimitivesCollection.get(0).geometryInstances.geometry instanceof Cesium.PolygonGeometry).toBe(true);
                                    expect(staticPrimitivesCollection.get(1).geometryInstances.geometry instanceof Cesium.PolylineGeometry).toBe(true);
                                    const staticBillboardCollection = ref.map.scene.primitives.get(3);
                                    expect(staticBillboardCollection.length).toBe(0);
                                    const staticLabelsCollection = ref.map.scene.primitives.get(4);
                                    expect(staticLabelsCollection.length).toBe(4);
                                    expect(staticLabelsCollection.get(0).text).toBe('7609361.39 m');
                                    expect(staticLabelsCollection.get(1).text).toBe('6114731.67 m');
                                    expect(staticLabelsCollection.get(2).text).toBe('6090587.39 m');
                                    expect(staticLabelsCollection.get(3).text).toBe('18153801383440.54 m²');
                                } catch (e) {
                                    done(e);
                                }
                                done();
                            }
                        }}
                    />
                </CesiumMap>
                ,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        const mapCanvas = ref.map.canvas;

        simulateClick(mapCanvas);
        simulateClick(mapCanvas);
        simulateDoubleClick(mapCanvas);
    });
    it('should convert a completed 3D area when the unit of measure changes', (done) => {
        let ref;
        let count = 0;
        let phase = 'initial';
        let area;
        const polygon = [
            new Cesium.Cartographic(10, 43, 0),
            new Cesium.Cartographic(11, 44, 0),
            new Cesium.Cartographic(10, 44, 0)
        ];
        const squareFeetUnitsOfMeasure = {
            ...defaultUnitOfMeasure,
            [MeasureTypes.AREA_3D]: { unit: 'sqft', label: 'ft²', value: 'sqft' }
        };

        const renderMeasure = (unitsOfMeasure) => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ x: 10.3, y: 43.9 }}
                    zoom={11}
                >
                    <DrawMeasureSupport
                        active
                        type={MeasureTypes.AREA_3D}
                        unitsOfMeasure={unitsOfMeasure}
                        getPositionInfo={() => {
                            const cartographic = polygon[count] ?? polygon[polygon.length - 1];
                            count++;
                            return {
                                cartesian: Cesium.Cartographic.toCartesian(cartographic),
                                cartographic
                            };
                        }}
                        onUpdateCollection={(collection) => {
                            if (!collection.features.length || phase === 'completed') {
                                return;
                            }
                            try {
                                const feature = collection.features[0];
                                const staticLabelsCollection = ref.map.scene.primitives.get(4);
                                const areaLabel = staticLabelsCollection.get(staticLabelsCollection.length - 1).text;
                                if (phase === 'initial') {
                                    area = feature.properties.area;
                                    expect(areaLabel).toBe(`${area.toFixed(2)} m²`);
                                    phase = 'squareFeet';
                                    setTimeout(() => {
                                        act(() => renderMeasure(squareFeetUnitsOfMeasure));
                                    });
                                    return;
                                }
                                if (phase === 'squareFeet') {
                                    const expectedLabel = `${convertUom(area, 'sqm', 'sqft').toFixed(2)} ft²`;
                                    expect(areaLabel).toBe(expectedLabel);
                                    expect(feature.properties.infoLabelText).toBe(expectedLabel);
                                    expect(feature.properties.area).toBe(area);
                                    expect(staticLabelsCollection.get(0).text.endsWith(' ft')).toBe(true);
                                    phase = 'squareMetresAgain';
                                    setTimeout(() => {
                                        act(() => renderMeasure(defaultUnitOfMeasure));
                                    });
                                    return;
                                }
                                expect(areaLabel).toBe(`${area.toFixed(2)} m²`);
                                expect(feature.properties.area).toBe(area);
                                phase = 'completed';
                                done();
                            } catch (e) {
                                phase = 'completed';
                                done(e);
                            }
                        }}
                    />
                </CesiumMap>,
                document.getElementById('container')
            );
        };

        act(() => renderMeasure(defaultUnitOfMeasure));
        const mapCanvas = ref.map.canvas;

        simulateClick(mapCanvas);
        simulateClick(mapCanvas);
        simulateDoubleClick(mapCanvas);
    });
    it('should convert the live 3D area label to the selected unit of measure', () => {
        let ref;
        let count = 0;
        const polygon = [
            new Cesium.Cartographic(10, 43, 0),
            new Cesium.Cartographic(11, 44, 0),
            new Cesium.Cartographic(10, 44, 0)
        ];
        const squareFeetUnitsOfMeasure = {
            ...defaultUnitOfMeasure,
            [MeasureTypes.AREA_3D]: { unit: 'sqft', label: 'ft²', value: 'sqft' }
        };

        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ x: 10.3, y: 43.9 }}
                    zoom={11}
                >
                    <DrawMeasureSupport
                        active
                        type={MeasureTypes.AREA_3D}
                        unitsOfMeasure={squareFeetUnitsOfMeasure}
                        getPositionInfo={() => {
                            const cartographic = polygon[count] ?? polygon[polygon.length - 1];
                            count++;
                            return {
                                cartesian: Cesium.Cartographic.toCartesian(cartographic),
                                cartographic
                            };
                        }}
                    />
                </CesiumMap>,
                document.getElementById('container')
            );
        });
        const mapCanvas = ref.map.canvas;

        simulateClick(mapCanvas);
        simulateClick(mapCanvas);
        simulateClick(mapCanvas);

        const dynamicLabelsCollection = ref.map.scene.primitives.get(7);
        const area = computeArea(polygon.map((cartographic) => Cesium.Cartographic.toCartesian(cartographic)));
        const expectedLabel = `${convertUom(area, 'sqm', 'sqft').toFixed(2)} ft²`;
        expect(dynamicLabelsCollection.get(dynamicLabelsCollection.length - 1).text).toBe(expectedLabel);
    });
    it('should be able to measure a point coordinates', (done) => {
        let ref;
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ x: 10.3, y: 43.9 }}
                    zoom={11}
                >
                    <DrawMeasureSupport
                        active
                        type={MeasureTypes.POINT_COORDINATES}
                        unitsOfMeasure={defaultUnitOfMeasure}
                        getPositionInfo={() => {
                            const cartographic = new Cesium.Cartographic(10, 43, 0);
                            return {
                                cartesian: Cesium.Cartographic.toCartesian(cartographic),
                                cartographic
                            };
                        }}
                        onUpdateCollection={(collection) => {
                            if (collection.features.length > 0) {
                                try {
                                    expect(collection).toBeTruthy();
                                    expect(collection.features.length).toBe(1);
                                    expect(ref.map.scene.primitives.length).toBe(8);
                                    const staticPrimitivesCollection = ref.map.scene.primitives.get(2);
                                    expect(staticPrimitivesCollection.length).toBe(0);
                                    const staticBillboardCollection = ref.map.scene.primitives.get(3);
                                    expect(staticBillboardCollection.length).toBe(1);
                                    const staticLabelsCollection = ref.map.scene.primitives.get(4);
                                    expect(staticLabelsCollection.length).toBe(1);
                                    expect(staticLabelsCollection.get(0).text).toBe('latitude: -56.281481\nlongitude: -147.042205\naltitude: 0.00 m');
                                } catch (e) {
                                    done(e);
                                }
                                done();
                            }
                        }}
                    />
                </CesiumMap>
                ,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        const mapCanvas = ref.map.canvas;

        simulateClick(mapCanvas);
    });
    it('should be able to measure a height from terrain', (done) => {
        let ref;
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ x: 10.3, y: 43.9 }}
                    zoom={11}
                >
                    <DrawMeasureSupport
                        active
                        type={MeasureTypes.HEIGHT_FROM_TERRAIN}
                        unitsOfMeasure={defaultUnitOfMeasure}
                        getPositionInfo={() => {
                            const cartographic = new Cesium.Cartographic(10, 43, 10);
                            return {
                                cartesian: Cesium.Cartographic.toCartesian(cartographic),
                                cartographic
                            };
                        }}
                        onUpdateCollection={(collection) => {
                            if (collection.features.length > 0) {
                                try {
                                    expect(collection).toBeTruthy();
                                    expect(collection.features.length).toBe(1);
                                    expect(ref.map.scene.primitives.length).toBe(8);
                                    const staticPrimitivesCollection = ref.map.scene.primitives.get(2);
                                    expect(staticPrimitivesCollection.length).toBe(1);
                                    expect(staticPrimitivesCollection.get(0).geometryInstances.geometry instanceof Cesium.PolylineGeometry).toBe(true);
                                    const staticBillboardCollection = ref.map.scene.primitives.get(3);
                                    expect(staticBillboardCollection.length).toBe(1);
                                    const staticLabelsCollection = ref.map.scene.primitives.get(4);
                                    expect(staticLabelsCollection.length).toBe(1);
                                    expect(staticLabelsCollection.get(0).text).toBe('10.00 m');
                                } catch (e) {
                                    done(e);
                                }
                                done();
                            }
                        }}
                    />
                </CesiumMap>
                ,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        const mapCanvas = ref.map.canvas;

        simulateClick(mapCanvas);

    });
    it('should be able to measure a 3D angle', (done) => {
        let ref;
        let count = 0;
        const polyline = [
            new Cesium.Cartographic(1, 1, 0),
            new Cesium.Cartographic(1, -1, 0),
            new Cesium.Cartographic(-1, -1, 0)
        ];
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ x: 10.3, y: 43.9 }}
                    zoom={11}
                >
                    <DrawMeasureSupport
                        active
                        type={MeasureTypes.ANGLE_3D}
                        unitsOfMeasure={defaultUnitOfMeasure}
                        getPositionInfo={() => {
                            const cartographic = polyline[count] ?? polyline[polyline.length - 1];
                            count++;
                            return {
                                cartesian: Cesium.Cartographic.toCartesian(cartographic),
                                cartographic
                            };
                        }}
                        onUpdateCollection={(collection) => {
                            if (collection.features.length > 0) {
                                try {
                                    expect(collection).toBeTruthy();
                                    expect(collection.features.length).toBe(1);
                                    expect(ref.map.scene.primitives.length).toBe(8);
                                    const staticPrimitivesCollection = ref.map.scene.primitives.get(2);
                                    expect(staticPrimitivesCollection.length).toBe(2);
                                    expect(staticPrimitivesCollection.get(0).geometryInstances.geometry instanceof Cesium.PolylineGeometry).toBe(true);
                                    expect(staticPrimitivesCollection.get(1).geometryInstances.geometry instanceof Cesium.PolylineGeometry).toBe(true);
                                    const staticBillboardCollection = ref.map.scene.primitives.get(3);
                                    expect(staticBillboardCollection.length).toBe(0);
                                    const staticLabelsCollection = ref.map.scene.primitives.get(4);
                                    expect(staticLabelsCollection.length).toBe(1);
                                    expect(staticLabelsCollection.get(0).text).toBe('90.00 °');
                                } catch (e) {
                                    done(e);
                                }
                                done();
                            }
                        }}
                    />
                </CesiumMap>
                ,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        const mapCanvas = ref.map.canvas;

        simulateClick(mapCanvas);
        simulateClick(mapCanvas);
        simulateClick(mapCanvas);

    });
    it('should be able to measure a slope', (done) => {
        let ref;
        let count = 0;
        const polyline = [
            new Cesium.Cartographic(1, 1, 10),
            new Cesium.Cartographic(1, -1, 10),
            new Cesium.Cartographic(-1, -1, 0)
        ];
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ x: 10.3, y: 43.9 }}
                    zoom={11}
                >
                    <DrawMeasureSupport
                        active
                        type={MeasureTypes.SLOPE}
                        unitsOfMeasure={defaultUnitOfMeasure}
                        getPositionInfo={() => {
                            const cartographic = polyline[count] ?? polyline[polyline.length - 1];
                            count++;
                            return {
                                cartesian: Cesium.Cartographic.toCartesian(cartographic),
                                cartographic
                            };
                        }}
                        onUpdateCollection={(collection) => {
                            if (collection.features.length > 0) {
                                try {
                                    expect(collection).toBeTruthy();
                                    expect(collection.features.length).toBe(1);
                                    expect(ref.map.scene.primitives.length).toBe(8);
                                    const staticPrimitivesCollection = ref.map.scene.primitives.get(2);
                                    expect(staticPrimitivesCollection.length).toBe(2);
                                    expect(staticPrimitivesCollection.get(0).geometryInstances.geometry instanceof Cesium.PolygonGeometry).toBe(true);
                                    expect(staticPrimitivesCollection.get(1).geometryInstances.geometry instanceof Cesium.PolylineGeometry).toBe(true);
                                    const staticBillboardCollection = ref.map.scene.primitives.get(3);
                                    expect(staticBillboardCollection.length).toBe(0);
                                    const staticLabelsCollection = ref.map.scene.primitives.get(4);
                                    expect(staticLabelsCollection.length).toBe(1);
                                    expect(staticLabelsCollection.get(0).text).toBe('72.94 °');
                                } catch (e) {
                                    done(e);
                                }
                                done();
                            }
                        }}
                    />
                </CesiumMap>
                ,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        const mapCanvas = ref.map.canvas;

        simulateClick(mapCanvas);
        simulateClick(mapCanvas);
        simulateClick(mapCanvas);

    });
});
