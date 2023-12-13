/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import * as Cesium from 'cesium';
import expect from 'expect';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import { waitFor } from '@testing-library/react';
import { simulateClick } from './CesiumSimulate';
import CesiumLayer from '../Layer';
import CesiumMap from '../Map';
import '../plugins/OSMLayer';

import '../../../../utils/cesium/Layers';
import {
    getHook,
    ZOOM_TO_EXTENT_HOOK,
    registerHook,
    createRegisterHooks, GET_PIXEL_FROM_COORDINATES_HOOK, GET_COORDINATES_FROM_PIXEL_HOOK
} from '../../../../utils/MapUtils';

describe('CesiumMap', () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        /* eslint-disable */
        try {
            ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        } catch(e) {}
        /* eslint-enable */
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('creates a div for cesium map with given id', () => {
        ReactDOM.render(<CesiumMap id="mymap" center={{y: 43.9, x: 10.3}} zoom={11}/>, document.getElementById("container"));
        expect(document.querySelector('#mymap')).toBeTruthy();
    });

    it('creates a div for cesium map with default id (map)', () => {
        ReactDOM.render(<CesiumMap center={{y: 43.9, x: 10.3}} zoom={11}/>, document.getElementById("container"));
        expect(document.querySelector('#map')).toBeTruthy();
    });

    it('renders a map on an external window', () => {
        const popup = window.open("", "", "width=300,height=300,left=200,top=200");
        try {
            const container = document.createElement("div");
            popup.document.body.appendChild(container);
            const Comp = () => {
                return ReactDOM.createPortal(<CesiumMap center={{ y: 43.9, x: 10.3 }} zoom={11} document={popup.document}
                />, container);
            };
            ReactDOM.render(<Comp/>, document.getElementById("container"));
            const map = popup.document.getElementById("map");
            expect(map).toBeTruthy();
            expect(map.querySelectorAll(".cesium-viewer").length).toBe(1);
        } finally {
            popup.close();
        }
    });

    it('creates multiple maps for different containers', () => {
        ReactDOM.render(
            <div>
                <div id="container1"><CesiumMap id="map1" center={{y: 43.9, x: 10.3}} zoom={11}/></div>
                <div id="container2"><CesiumMap id="map2" center={{y: 43.9, x: 10.3}} zoom={11}/></div>
            </div>
            , document.getElementById("container"));

        expect(document.getElementById('map1')).toBeTruthy();
        expect(document.getElementById('map2')).toBeTruthy();
    });

    it('populates the container with cesium objects', () => {
        ReactDOM.render(<CesiumMap center={{y: 43.9, x: 10.3}} zoom={11}/>, document.getElementById("container"));
        expect(document.querySelector('#map')).toBeTruthy();
        expect(document.getElementsByClassName('cesium-viewer').length).toBe(1);
        expect(document.getElementsByClassName('cesium-viewer-cesiumWidgetContainer').length).toBe(1);
        expect(document.getElementsByClassName('cesium-widget').length).toBe(1);
    });

    it('check layers init', () => {
        const options = {
            "visibility": true
        };
        let ref;
        act(() => {
            ReactDOM.render(<CesiumMap ref={value => { ref = value; } } center={{y: 43.9, x: 10.3}} zoom={11}>
                <CesiumLayer type="osm" options={options} />
            </CesiumMap>, document.getElementById("container"));
        });
        expect(ref.map).toBeTruthy();
        expect(ref.map.imageryLayers.length).toBe(1);
    });

    it('check layers for elevation', () => {
        const options = {
            "url": "http://fake",
            "name": "mylayer",
            "visibility": true,
            "useForElevation": true
        };
        let ref;
        act(() => {
            ReactDOM.render(<CesiumMap ref={value => { ref = value; } } center={{ y: 43.9, x: 10.3 }} zoom={11}>
                <CesiumLayer type="wms" options={options} />
            </CesiumMap>, document.getElementById("container"));
        });
        expect(ref).toBeTruthy();
        expect(ref.map.terrainProvider).toBeTruthy();
        expect(ref.map.terrainProvider.layerName).toBe('mylayer');
    });
    it('check wmts layer for custom attribution', () => {
        const options = {
            format: 'image/png',
            group: 'background',
            name: 'nurc:Arc_Sample',
            description: "arcGridSample",
            title: "arcGridSample",
            type: 'wmts',
            url: "https://gs-stable.geo-solutions.it/geoserver/gwc/service/wmts",
            bbox: {
                crs: "EPSG:4326",
                bounds: {
                    minx: -180.0,
                    miny: -90.0,
                    maxx: 180.0,
                    maxy: 90.0
                }
            },
            visibility: true,
            singleTile: false,
            allowedSRS: {
                "EPSG:4326": true,
                "EPSG:900913": true
            },
            matrixIds: {},
            tileMatrixSet: [],
            credits: {
                title: "<p>This is some Attribution <b>TEXT</b></p>"
            }
        };
        ReactDOM.render(<CesiumMap center={{ y: 43.9, x: 10.3 }} zoom={11}>
            <CesiumLayer type="wmts" options={options} />
        </CesiumMap>, document.getElementById("container"));
        const creditsWidget = document.getElementsByClassName('cesium-widget-credits')[0];
        expect(creditsWidget).toBeTruthy();
    });
    it('check if the handler for "moveend" event is called', (done) => {
        const precision = 1000000000;
        let ref;
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    center={{y: 10, x: 44}}
                    zoom={5}
                    onMapViewChanges={(center, zoom, bbox, size, id, projection, options) => {
                        try {
                            expect(Math.round(Math.round(center.y * precision) / precision)).toBe(30);
                            expect(Math.round(Math.round(center.x * precision) / precision)).toBe(20);
                            expect(Math.round(zoom)).toBe(5);
                            expect(bbox.bounds).toBeTruthy();
                            expect(bbox.crs).toBeTruthy();
                            expect(size.height).toBeTruthy();
                            expect(size.width).toBeTruthy();
                            expect(options.orientation.heading).toBe(1);
                        } catch (e) {
                            done(e);
                        }
                        done();
                    }}
                    viewerOptions={{
                        orientation: {
                            heading: 0,
                            pitch: -1 * Math.PI / 2,
                            roll: 0
                        }
                    }}
                />
                , document.getElementById("container"));
        });
        expect(ref.map).toBeTruthy();
        ref.map.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(
                20,
                30,
                5000000
            ),
            orientation: {
                heading: 1,
                pitch: -1 * Math.PI / 2,
                roll: 0
            }
        });
    });
    it('check mouse click handler', (done) => {
        const testHandlers = {
            handler: () => {}
        };
        const spy = expect.spyOn(testHandlers, 'handler');

        let ref;
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    center={{y: 43.9, x: 10.3}}
                    zoom={11}
                    onClick={testHandlers.handler}
                />
                , document.getElementById("container"));
        });
        expect(ref.map).toBeTruthy();
        ref.onClick(ref.map, {position: {x: 100, y: 100 }});
        setTimeout(() => {
            expect(spy.calls.length).toEqual(1);
            expect(spy.calls[0].arguments.length).toEqual(1);
            done();
        }, 800);
    });
    it('click on layer should return intersected features', (done) => {
        let ref;
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    center={{y: 43.9, x: 10.3}}
                    zoom={11}
                    onClick={({ intersectedFeatures }) => {
                        try {
                            expect(intersectedFeatures).toEqual(
                                [
                                    {
                                        id: 'vector',
                                        features: [
                                            {
                                                type: 'Feature', properties: { category: 'boundary' },
                                                geometry: null
                                            },
                                            {
                                                type: 'Feature', properties: { category: 'area' },
                                                geometry: null
                                            }
                                        ]
                                    }
                                ]
                            );
                        } catch (e) {
                            done(e);
                        }
                        done();
                    }}
                >
                    <CesiumLayer
                        type="vector"
                        options={{
                            id: 'vector',
                            visibility: true,
                            style: {
                                format: 'geostyler',
                                body: {
                                    name: 'fill style',
                                    rules: [
                                        {
                                            ruleId: 'rule-01',
                                            name: 'rule',
                                            symbolizers: [
                                                {
                                                    symbolizerId: 'symbolizer-01',
                                                    kind: 'Fill',
                                                    color: '#ffffff',
                                                    fillOpacity: 0.5,
                                                    outlineColor: '#7EC058',
                                                    outlineOpacity: 1,
                                                    outlineWidth: 3,
                                                    msClassificationType: 'both',
                                                    msClampToGround: false
                                                }
                                            ]
                                        }
                                    ]
                                }
                            },
                            features: [
                                {
                                    "type": "Feature",
                                    "properties": {
                                        "category": "boundary"
                                    },
                                    "geometry": {
                                        "coordinates": [
                                            [
                                                [
                                                    1.0975911519593637,
                                                    48.583411572759644
                                                ],
                                                [
                                                    1.0975911519593637,
                                                    38.03615349112002
                                                ],
                                                [
                                                    19.43550678615742,
                                                    38.03615349112002
                                                ],
                                                [
                                                    19.43550678615742,
                                                    48.583411572759644
                                                ],
                                                [
                                                    1.0975911519593637,
                                                    48.583411572759644
                                                ]
                                            ]
                                        ],
                                        "type": "Polygon"
                                    }
                                },
                                {
                                    "type": "Feature",
                                    "properties": {
                                        "category": "area"
                                    },
                                    "geometry": {
                                        "coordinates": [
                                            [
                                                [
                                                    1.0975911519593637,
                                                    48.583411572759644
                                                ],
                                                [
                                                    1.0975911519593637,
                                                    38.03615349112002
                                                ],
                                                [
                                                    19.43550678615742,
                                                    38.03615349112002
                                                ],
                                                [
                                                    19.43550678615742,
                                                    48.583411572759644
                                                ],
                                                [
                                                    1.0975911519593637,
                                                    48.583411572759644
                                                ]
                                            ]
                                        ],
                                        "type": "Polygon"
                                    }
                                }
                            ]
                        }}
                    />
                </CesiumMap>
                , document.getElementById("container"));
        });
        waitFor(() => expect(ref.map.dataSourceDisplay.ready).toBe(true), {
            timeout: 5000
        })
            .then(() => {
                expect(ref.map.dataSources.length).toBe(1);
                const dataSource = ref.map.dataSources.get(0);
                expect(dataSource).toBeTruthy();
                expect(dataSource.entities.values.length).toBe(2);
                const mapCanvas = ref.map.canvas;
                const { width, height } = mapCanvas.getBoundingClientRect();
                simulateClick(mapCanvas, {
                    clientX: width / 2,
                    clientY: height / 2
                });
            })
            .catch(done);
    }).timeout(5000);
    it('check if the map changes when receive new props', () => {
        let ref;
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    center={{y: 43.9, x: 10.3}}
                    zoom={10}
                />
                , document.getElementById("container"));
        });

        const cesiumMap = ref.map;

        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    center={{y: 44, x: 10}}
                    zoom={12}
                />
                , document.getElementById("container"));
        });
        expect(Math.round(cesiumMap.camera.positionCartographic.height - ref.getHeightFromZoom(12))).toBe(0);
        expect(Math.round(cesiumMap.camera.positionCartographic.latitude * 180.0 / Math.PI)).toBe(44);
        expect(Math.round(cesiumMap.camera.positionCartographic.longitude * 180.0 / Math.PI)).toBe(10);
    });
    it('test ZOOM_TO_EXTENT_HOOK', (done) => {
        // instanciating the map that will be used to compute the bounfing box
        const testHandlers = {
            onMapViewChanges: (args) => {
                expect(args).toBeTruthy();
                expect(args.x).toBeGreaterThan(14);
                expect(args.y).toBeGreaterThan(14);
                expect(args.x).toBeLessThan(16);
                expect(args.y).toBeLessThan(16);
                done();
            }
        };
        ReactDOM.render(<CesiumMap
            center={{ y: 43.9, x: 10.3 }}
            zoom={11}
            onMapViewChanges={testHandlers.onMapViewChanges}
        />, document.getElementById("container"));
        // computing the bounding box for the new center and the new zoom
        const hook = getHook(ZOOM_TO_EXTENT_HOOK);
        // update the map with the new center and the new zoom so we can check our computed bouding box
        expect(hook).toBeTruthy();

        hook([10, 10, 20, 20], {crs: "EPSG:4326", duration: 0});
        // unregister hook
        registerHook(ZOOM_TO_EXTENT_HOOK);
    });
    it('should reorder the layer correctly even if the position property of layer exceed the imageryLayers length', () => {

        let ref;
        act(() => {
            ReactDOM.render(
                <CesiumMap ref={value => { ref = value; } } id="mymap" center={{ y: 43.9, x: 10.3 }} zoom={11}>
                    <CesiumLayer type="wms" position={1} options={{ url: '/wms', name: 'layer01' }} />
                    <CesiumLayer type="wms" position={3} options={{ url: '/wms', name: 'layer02' }} />
                    <CesiumLayer type="wms" position={6} options={{ url: '/wms', name: 'layer03' }} />
                </CesiumMap>,
                document.getElementById('container')
            );
        });

        expect(ref).toBeTruthy();
        expect(ref.map.imageryLayers._layers.map(({ _position }) => _position)).toEqual([1, 3, 6]);
        expect(ref.map.imageryLayers._layers.map(({ imageryProvider }) => imageryProvider.layers)).toEqual([ 'layer01', 'layer02', 'layer03' ]);

        act(() => {
            ReactDOM.render(
                <CesiumMap ref={value => { ref = value; } } id="mymap" center={{ y: 43.9, x: 10.3 }} zoom={11}>
                    <CesiumLayer type="wms" position={1} options={{ url: '/wms', name: 'layer01' }} />
                    <CesiumLayer type="wms" position={3} options={{ url: '/wms', name: 'layer02' }} />
                    <CesiumLayer type="wms" position={4} options={{ url: '/wms', name: 'layer03' }} />
                </CesiumMap>,
                document.getElementById('container')
            );
        });
        expect(ref.map.imageryLayers._layers.map(({ _position }) => _position)).toEqual([1, 3, 4]);
        expect(ref.map.imageryLayers._layers.map(({ imageryProvider }) => imageryProvider.layers)).toEqual([ 'layer01', 'layer02', 'layer03' ]);

        act(() => {
            ReactDOM.render(
                <CesiumMap ref={value => { ref = value; } } id="mymap" center={{ y: 43.9, x: 10.3 }} zoom={11}>
                    <CesiumLayer type="wms" position={1} options={{ url: '/wms', name: 'layer01' }} />
                    <CesiumLayer type="wms" position={3} options={{ url: '/wms', name: 'layer02' }} />
                    <CesiumLayer type="wms" position={2} options={{ url: '/wms', name: 'layer03' }} />
                </CesiumMap>,
                document.getElementById('container')
            );
        });
        expect(ref.map.imageryLayers._layers.map(({ _position }) => _position)).toEqual([1, 2, 3]);
        expect(ref.map.imageryLayers._layers.map(({ imageryProvider }) => imageryProvider.layers)).toEqual([ 'layer01', 'layer03', 'layer02' ]);
    });
    it('should add navigation tools to the map', () => {
        let ref;
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    center={{y: 10, x: 44}}
                    zoom={5}
                    mapOptions={{
                        navigationTools: true
                    }}
                />
                , document.getElementById("container"));
        });
        expect(ref.map).toBeTruthy();
        expect(ref.map.cesiumNavigation).toBeTruthy();
        expect(ref.map.cesiumNavigation.destroy).toBeTruthy();
    });
    it('should set correct orientation on mount', () => {
        let ref;
        act(() => {
            ReactDOM.render(
                <CesiumMap
                    ref={value => { ref = value; } }
                    center={{
                        x: 14,
                        y: 42
                    }}
                    zoom={9}
                    viewerOptions={{
                        cameraPosition: {
                            longitude: 12.390726809383557,
                            latitude: 41.71232944851886,
                            height: 352553
                        },
                        orientation: {
                            heading: 5.677102807289052,
                            pitch: -0.6948024901340912,
                            roll: 0.000016578416068391277
                        }
                    }}
                />
                , document.getElementById("container"));
        });
        expect(ref.map).toBeTruthy();
        expect(ref.map.camera).toBeTruthy();
        expect(Math.round(ref.map.camera.heading)).toBe(6);
        expect(Math.round(ref.map.camera.pitch)).toBe(-1);
        expect(Math.round(ref.map.camera.roll)).toBe(0);
    });
    describe("hookRegister", () => {
        it("default", () => {
            ReactDOM.render(<CesiumMap id="mymap" center={{y: 43.9, x: 10.3}} zoom={11}/>, document.getElementById("container"));
            expect(document.querySelector('#mymap')).toBeTruthy();
            expect(getHook(ZOOM_TO_EXTENT_HOOK)).toBeTruthy();
            expect(getHook(GET_PIXEL_FROM_COORDINATES_HOOK)).toBeFalsy();
            expect(getHook(GET_COORDINATES_FROM_PIXEL_HOOK)).toBeFalsy();
        });
        it("with custom hookRegister", () => {
            const customHooRegister = createRegisterHooks();
            ReactDOM.render(<CesiumMap hookRegister={customHooRegister} id="mymap" center={{y: 43.9, x: 10.3}} zoom={11}/>, document.getElementById("container"));
            expect(document.querySelector('#mymap')).toBeTruthy();
            expect(customHooRegister.getHook(ZOOM_TO_EXTENT_HOOK)).toBeTruthy();
        });
    });

});
