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
import MapViewsSupport from '../MapViewsSupport';
import { ViewSettingsTypes } from '../../../../utils/MapViewsUtils';

describe('Cesium MapViewsSupport', () => {
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
                    <MapViewsSupport />
                </CesiumMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        expect(ref.map.canvas).toBeTruthy();
    });
    it('should provide and apiRef prop', (done) => {
        let ref;
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={11}
                >
                    <MapViewsSupport
                        apiRef={(api) => {
                            expect(api.options).toEqual({
                                settings: [
                                    ViewSettingsTypes.DESCRIPTION,
                                    ViewSettingsTypes.POSITION,
                                    ViewSettingsTypes.ANIMATION,
                                    ViewSettingsTypes.MASK,
                                    ViewSettingsTypes.GLOBE_TRANSLUCENCY,
                                    ViewSettingsTypes.LAYERS_OPTIONS
                                ],
                                unsupportedLayers: [],
                                showClipGeometriesEnabled: true
                            });
                            expect(api.getView).toBeTruthy();
                            expect(api.setView).toBeTruthy();
                            expect(api.computeViewCoordinates).toBeTruthy();
                            done();
                        }}
                    />
                </CesiumMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        expect(ref.map.canvas).toBeTruthy();
    });
    it('should enable globe translucency', () => {
        let ref;
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={11}
                >
                    <MapViewsSupport
                        selectedId="view.1"
                        views={[{
                            center: {
                                longitude: 8.936900,
                                latitude: 44.395224,
                                height: 0
                            },
                            cameraPosition: {
                                longitude: 8.939256,
                                latitude: 44.386982,
                                height: 655
                            },
                            id: 'view.1',
                            title: 'Map view',
                            description: '',
                            duration: 10,
                            flyTo: true,
                            zoom: 16,
                            bbox: [
                                8.920925,
                                44.390840,
                                8.948118,
                                44.405544
                            ],
                            globeTranslucency: {
                                enabled: true
                            }
                        }]}
                    />
                </CesiumMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        expect(ref.map.canvas).toBeTruthy();
        expect(ref.map.scene.globe.translucency.enabled).toBe(true);
    });
    it('should invert classification with mask enabled', () => {
        let ref;
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    id="map"
                    center={{ y: 43.9, x: 10.3 }}
                    zoom={11}
                >
                    <MapViewsSupport
                        selectedId="view.1"
                        views={[{
                            center: {
                                longitude: 8.936900,
                                latitude: 44.395224,
                                height: 0
                            },
                            cameraPosition: {
                                longitude: 8.939256,
                                latitude: 44.386982,
                                height: 655
                            },
                            id: 'view.1',
                            title: 'Map view',
                            description: '',
                            duration: 10,
                            flyTo: true,
                            zoom: 16,
                            bbox: [
                                8.920925,
                                44.390840,
                                8.948118,
                                44.405544
                            ],
                            mask: {
                                enabled: true
                            }
                        }]}
                    />
                </CesiumMap>,
                document.getElementById('container'));
        });
        const viewer = document.querySelector('.cesium-viewer');
        expect(viewer).toBeTruthy();
        expect(ref.map.canvas).toBeTruthy();
        expect(ref.map.scene.invertClassification).toBe(true);
    });
});
