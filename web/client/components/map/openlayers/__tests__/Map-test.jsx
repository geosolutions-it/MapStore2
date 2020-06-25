/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import {find} from 'lodash';
import OpenlayersLayer from '../Layer';
import OpenlayersMap from '../Map';
import { DEFAULT_INTERACTION_OPTIONS } from '../../../../utils/openlayers/DrawUtils';

import assign from 'object-assign';

import proj from 'proj4';
import MapUtils from '../../../../utils/MapUtils';

import '../../../../utils/openlayers/Layers';
import '../plugins/OSMLayer';
import '../plugins/VectorLayer';

import {get, transform} from 'ol/proj';

import Feature from 'ol/Feature';
import {Point, Polygon} from 'ol/geom';

describe('OpenlayersMap', () => {

    var normalizeFloat = function(f, places) {
        return parseFloat(f.toFixed(places));
    };

    beforeEach(() => {
        document.body.innerHTML = '<div id="map"></div>';
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById("map"));
        document.body.innerHTML = '';
    });

    it('creates a div for openlayers map with given id', () => {
        const map = ReactDOM.render(<OpenlayersMap id="mymap" center={{y: 43.9, x: 10.3}} zoom={11}/>, document.getElementById("map"));
        expect(map).toExist();
        expect(ReactDOM.findDOMNode(map).id).toBe('mymap');
    });

    it('creates a div for openlayers map with default id (map)', () => {
        const map = ReactDOM.render(<OpenlayersMap center={{y: 43.9, x: 10.3}} zoom={11}/>, document.getElementById("map"));
        expect(map).toExist();
        expect(ReactDOM.findDOMNode(map).id).toBe('map');
    });

    it('creates multiple maps for different containers', () => {
        const container = ReactDOM.render(

            <div>
                <div id="container1"><OpenlayersMap id="map1" center={{y: 43.9, x: 10.3}} zoom={11}/></div>
                <div id="container2"><OpenlayersMap id="map2" center={{y: 43.9, x: 10.3}} zoom={11}/></div>
            </div>
            , document.getElementById("map"));
        expect(container).toExist();

        expect(document.getElementById('map1')).toExist();
        expect(document.getElementById('map2')).toExist();
    });

    it('populates the container with openlayers objects', () => {
        const map = ReactDOM.render(<OpenlayersMap center={{y: 43.9, x: 10.3}} zoom={11}/>, document.getElementById("map"));
        expect(map).toExist();
        expect(document.getElementsByClassName('ol-viewport').length).toBe(1);
        expect(document.getElementsByClassName('ol-overlaycontainer').length).toBe(1);
        expect(document.getElementsByTagName('canvas').length).toBe(1);
    });

    it('enables openlayers controls', (done) => {
        const map = ReactDOM.render(<OpenlayersMap center={{y: 43.9, x: 10.3}} zoom={11}/>, document.getElementById("map"));
        expect(map).toExist();
        expect(document.getElementsByClassName('ol-zoom-in').length).toBe(1);

        const olMap = map.map;
        expect(olMap).toExist();
        const zoomIn = document.getElementsByClassName('ol-zoom-in')[0];
        zoomIn.click();
        setTimeout(() => {
            expect(olMap.getView().getZoom()).toBe(12);
            const zoomOut = document.getElementsByClassName('ol-zoom-out')[0];
            zoomOut.click();
            setTimeout(() => {
                expect(olMap.getView().getZoom()).toBe(11);
                done();
            }, 500);
        }, 500);
    });

    it('normalized CRS', () => {
        const comp = (<OpenlayersMap projection="EPSG:900913" center={{y: 43.9, x: 10.3}} zoom={11}
        />);

        const map = ReactDOM.render(comp, document.getElementById("map"));
        expect(map).toExist();
        expect(map.map.getView().getProjection().getCode()).toBe('EPSG:3857');
    });

    it('custom projection', () => {
        proj.defs("EPSG:25830", "+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
        const projectionDefs = [{
            code: "EPSG:25830",
            extent: [-1300000, 4000000, 1900000, 7500000],
            worldExtent: [-6.0000, 35.9500, 0.0000, 63.9500]
        }];
        const comp = (<OpenlayersMap projection="EPSG:25830" projectionDefs={projectionDefs} center={{ y: 43.9, x: 10.3 }} zoom={11}
        />);

        const map = ReactDOM.render(comp, document.getElementById("map"));
        expect(map).toExist();
        expect(map.map.getView().getProjection().getCode()).toBe('EPSG:25830');
        expect(get('EPSG:25830')).toExist();
    });

    it('custom projection with axisOrientation', () => {
        proj.defs("EPSG:31468", "+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs");
        const projectionDefs = [{
            code: "EPSG:31468",
            axisOrientation: "neu",
            "extent": [
                4036308.74,
                5255076.75,
                4617579.38,
                6108355.90
            ],
            "worldExtent": [
                5.87,
                47.27,
                13.84,
                55.09
            ]
        }];
        const comp = (<OpenlayersMap projection="EPSG:31468" projectionDefs={projectionDefs} center={{ y: 43.9, x: 10.3 }} zoom={11}
        />);

        const map = ReactDOM.render(comp, document.getElementById("map"));
        expect(map).toExist();
        expect(map.map.getView().getProjection().getCode()).toBe('EPSG:31468');
        expect(get('EPSG:31468')).toExist();
        expect(get('EPSG:31468').getAxisOrientation()).toBe('neu');
    });

    it('renders a map on an external window', () => {
        const popup = window.open("", "", "width=300,height=300,left=200,top=200");
        try {
            const container = document.createElement("div");
            popup.document.body.appendChild(container);
            const Comp = () => {
                return ReactDOM.createPortal(<OpenlayersMap center={{ y: 43.9, x: 10.3 }} zoom={11} document={popup.document}
                />, container);
            };
            ReactDOM.render(<Comp/>, document.getElementById("map"));
            const map = popup.document.getElementById("map");
            expect(map).toExist();
            expect(map.querySelectorAll(".ol-viewport").length).toBe(1);
        } finally {
            popup.close();
        }
    });

    it('check if the handler for "click" event is called with elevation', () => {
        const testHandlers = {
            handler: () => { }
        };
        var spy = expect.spyOn(testHandlers, 'handler');

        var options = {
            "url": "http://fake",
            "name": "mylayer",
            "visibility": true,
            "useForElevation": true
        };
        const map = ReactDOM.render(
            <OpenlayersMap
                center={{ y: 43.9, x: 10.3 }}
                zoom={11}
                onClick={testHandlers.handler}
            ><OpenlayersLayer type="wms" options={options} /></OpenlayersMap>
            , document.getElementById("map"));
        map.map.dispatchEvent({
            type: 'singleclick',
            coordinate: [10, 43],
            pixel: [100, 100],
            originalEvent: {
                altKey: false,
                ctrlKey: false,
                shiftKey: false
            }
        });
        expect(spy.calls.length).toBe(1);
        expect(spy.calls[0].arguments.length).toBe(2);
        expect(spy.calls[0].arguments[0].pixel).toExist();
        expect(spy.calls[0].arguments[0].latlng).toExist();
        expect(spy.calls[0].arguments[0].latlng.z).toExist();
        expect(spy.calls[0].arguments[0].modifiers).toExist();
        expect(spy.calls[0].arguments[0].modifiers.alt).toBe(false);
        expect(spy.calls[0].arguments[0].modifiers.ctrl).toBe(false);
        expect(spy.calls[0].arguments[0].modifiers.shift).toBe(false);
    });

    it('check if the handler for "mousemove" event is called', () => {
        const testHandlers = {
            handler: () => { }
        };
        var spy = expect.spyOn(testHandlers, 'handler');

        const map = ReactDOM.render(
            <OpenlayersMap
                center={{ y: 43.9, x: 10.3 }}
                zoom={11}
                onMouseMove={testHandlers.handler}
            />
            , document.getElementById("map"));

        map.map.dispatchEvent({
            type: 'pointermove',
            coordinate: [10, 43],
            pixel: [100, 100],
            originalEvent: {
                altKey: false,
                ctrlKey: false,
                shiftKey: false
            }
        });
        expect(spy.calls.length).toBe(1);
        expect(spy.calls[0].arguments.length).toBe(1);
        expect(spy.calls[0].arguments[0].pixel).toExist();
        expect(spy.calls[0].arguments[0].x).toExist();
        expect(spy.calls[0].arguments[0].y).toExist();
        expect(spy.calls[0].arguments[0].z).toNotExist();
    });

    it('check if the handler for "mousemove" event is called with elevation', () => {
        const testHandlers = {
            handler: () => { }
        };
        var spy = expect.spyOn(testHandlers, 'handler');

        var options = {
            "url": "http://fake",
            "name": "mylayer",
            "visibility": true,
            "useForElevation": true
        };
        const map = ReactDOM.render(
            <OpenlayersMap
                center={{ y: 43.9, x: 10.3 }}
                zoom={11}
                onMouseMove={testHandlers.handler}
            ><OpenlayersLayer type="wms" options={options} /></OpenlayersMap>
            , document.getElementById("map"));

        map.map.dispatchEvent({
            type: 'pointermove',
            coordinate: [10, 43],
            pixel: [100, 100],
            originalEvent: {
                altKey: false,
                ctrlKey: false,
                shiftKey: false
            }
        });
        expect(spy.calls.length).toBe(1);
        expect(spy.calls[0].arguments.length).toBe(1);
        expect(spy.calls[0].arguments[0].pixel).toExist();
        expect(spy.calls[0].arguments[0].x).toExist();
        expect(spy.calls[0].arguments[0].y).toExist();
        expect(spy.calls[0].arguments[0].z).toExist();
    });

    it('click on feature', (done) => {
        const testHandlers = {
            handler: () => {}
        };
        const spy = expect.spyOn(testHandlers, 'handler');
        const comp = (<OpenlayersMap projection="EPSG:4326" center={{y: 43.9, x: 10.3}} zoom={11}
            onClick={testHandlers.handler}/>);
        const map = ReactDOM.render(comp, document.getElementById("map"));
        expect(map).toExist();
        setTimeout(() => {
            map.map.forEachFeatureAtPixel = (pixel, callback) => {
                callback.call(null, {
                    feature: new Feature({
                        geometry: new Point([10.3, 43.9]),
                        name: 'My Point'
                    }),
                    getGeometry: () => {
                        return {
                            getFirstCoordinate: () => [10.3, 43.9],
                            getType: () => {
                                return 'Point';
                            }
                        };
                    }
                });
            };
            map.map.dispatchEvent({
                type: 'singleclick',
                coordinate: [10.3, 43.9],
                pixel: map.map.getPixelFromCoordinate([10.3, 43.9]),
                originalEvent: {}
            });
            expect(spy.calls.length).toEqual(1);
            done();
        }, 500);
    });
    it('disable single click', (done) => {
        const testHandlers = {
            handler: () => {}
        };
        const spy = expect.spyOn(testHandlers, 'handler');
        const comp = (<OpenlayersMap projection="EPSG:4326" center={{y: 43.9, x: 10.3}} zoom={11}
            onClick={testHandlers.handler}/>);
        const map = ReactDOM.render(comp, document.getElementById("map"));
        expect(map).toExist();
        map.map.disableEventListener('singleclick');
        setTimeout(() => {
            map.map.forEachFeatureAtPixel = (pixel, callback) => {
                callback.call(null, {
                    feature: new Feature({
                        geometry: new Point([10.3, 43.9]),
                        name: 'My Point'
                    }),
                    getGeometry: () => {
                        return {
                            getFirstCoordinate: () => [10.3, 43.9],
                            getType: () => {
                                return 'Point';
                            }
                        };
                    }
                });
            };
            map.map.dispatchEvent({
                type: 'singleclick',
                coordinate: [10.3, 43.9],
                pixel: map.map.getPixelFromCoordinate([10.3, 43.9]),
                originalEvent: {}
            });
            expect(spy.calls.length).toEqual(0);
            done();
        }, 500);
    });
    it('click on feature preserves clicked point', (done) => {
        const testHandlers = {
            handler: () => {}
        };
        const spy = expect.spyOn(testHandlers, 'handler');
        const comp = (<OpenlayersMap projection="EPSG:4326" center={{y: 43.9, x: 10.3}} zoom={11}
            onClick={testHandlers.handler}/>);
        const map = ReactDOM.render(comp, document.getElementById("map"));
        expect(map).toExist();
        setTimeout(() => {
            map.map.forEachFeatureAtPixel = (pixel, callback) => {
                callback.call(null, {
                    feature: new Feature({
                        geometry: new Polygon([ [0, 0], [0, 1], [1, 1], [1, 0], [0, 0] ]),
                        name: 'My Point'
                    }),
                    getGeometry: () => {
                        return {
                            getFirstCoordinate: () => [10.3, 43.9],
                            getType: () => {
                                return 'Polygon';
                            }
                        };
                    }
                }, {
                    get: (key) => key === "handleClickOnLayer" ? false : "ID"
                });
            };
            map.map.dispatchEvent({
                type: 'singleclick',
                coordinate: [0.5, 0.5],
                pixel: map.map.getPixelFromCoordinate([0.5, 0.5]),
                originalEvent: {}
            });
            expect(spy.calls.length).toEqual(1);
            expect(spy.calls[0].arguments[0].latlng.lat).toBe(0.5);
            expect(spy.calls[0].arguments[0].latlng.lng).toBe(0.5);
            done();
        }, 500);
    });
    it('click on feature for handleClickOnLayer ignore not markers', (done) => {
        const testHandlers = {
            handler: () => {}
        };
        const spy = expect.spyOn(testHandlers, 'handler');
        const comp = (<OpenlayersMap projection="EPSG:4326" center={{y: 43.9, x: 10.3}} zoom={11}
            onClick={testHandlers.handler}/>);
        const map = ReactDOM.render(comp, document.getElementById("map"));
        expect(map).toExist();
        setTimeout(() => {
            map.map.forEachFeatureAtPixel = (pixel, callback) => {
                callback.call(null, {
                    feature: new Feature({
                        geometry: new Polygon([ [0, 0], [0, 1], [1, 1], [1, 0], [0, 0] ]),
                        name: 'My Point'
                    }),
                    getGeometry: () => {
                        return {
                            getFirstCoordinate: () => [10.3, 43.9], // this makes sense only for points, maybe centroid is more appropriate
                            getType: () => {
                                return 'Polygon';
                            }
                        };
                    }
                }, {
                    get: (key) => key === "handleClickOnLayer" ? true : "ID"
                });
            };
            map.map.dispatchEvent({
                type: 'singleclick',
                coordinate: [0.5, 0.5],
                pixel: map.map.getPixelFromCoordinate([0.5, 0.5]),
                originalEvent: {}
            });
            expect(spy.calls.length).toEqual(1);
            expect(spy.calls[0].arguments[0].latlng.lat).toBe(0.5);
            expect(spy.calls[0].arguments[0].latlng.lng).toBe(0.5);
            expect(spy.calls[0].arguments[1]).toBe(undefined);
            done();
        }, 500);
    });
    it('click on layer with handleClickOnLayer with marker change clicked point coordinate', (done) => {
        const testHandlers = {
            handler: () => { }
        };
        const spy = expect.spyOn(testHandlers, 'handler');
        const comp = (<OpenlayersMap projection="EPSG:4326" center={{ y: 43.9, x: 10.3 }} zoom={11}
            onClick={testHandlers.handler} />);
        const map = ReactDOM.render(comp, document.getElementById("map"));
        expect(map).toExist();
        setTimeout(() => {
            map.map.forEachFeatureAtPixel = (pixel, callback) => {
                callback.call(null, {
                    feature: new Feature({
                        geometry: new Point([43.0, 10]),
                        name: 'My Point'
                    }),
                    getGeometry: () => {
                        return {
                            getFirstCoordinate: () => [43.0, 10], // this makes sense only for points, maybe centroid is more appropriate
                            getType: () => {
                                return 'Point';
                            }
                        };
                    }
                }, {
                    get: (key) => key === "handleClickOnLayer" ? true : "ID"
                });
            };
            map.map.dispatchEvent({
                type: 'singleclick',
                coordinate: [43.3, 10.3],
                pixel: map.map.getPixelFromCoordinate([0.5, 0.5]),
                originalEvent: {}
            });
            expect(spy.calls.length).toEqual(1);
            // check the point
            expect(spy.calls[0].arguments[0].latlng.lat).toBe(10);
            expect(spy.calls[0].arguments[0].latlng.lng).toBe(43);
            // also layer id is passed (e.g. used as flag for hide GFI marker)
            expect(spy.calls[0].arguments[1]).toBe("ID");

            done();
        }, 500);
    });

    it('check layers init', () => {
        var options = {
            "visibility": true
        };
        const map = ReactDOM.render(<OpenlayersMap center={{y: 43.9, x: 10.3}} zoom={11}>
            <OpenlayersLayer type="osm" options={options} />
        </OpenlayersMap>, document.getElementById("map"));
        expect(map).toExist();
        expect(map.map.getLayers().getLength()).toBe(1);
    });

    it('check layers for elevation', () => {
        var options = {
            "url": "http://fake",
            "name": "mylayer",
            "visibility": true,
            "useForElevation": true
        };
        const map = ReactDOM.render(<OpenlayersMap center={{y: 43.9, x: 10.3}} zoom={11}>
            <OpenlayersLayer type="wms" srs="EPSG:3857" options={options} />
        </OpenlayersMap>, document.getElementById("map"));
        expect(map).toExist();
        expect(map.map.get('elevationLayer')).toExist();
    });

    it('check if the handler for "moveend" event is called after setZoom', (done) => {
        const testHandlers = {
            handler: () => {}
        };
        var spy = expect.spyOn(testHandlers, 'handler');

        const map = ReactDOM.render(
            <OpenlayersMap
                center={{y: 43.9, x: 10.3}}
                zoom={11}
                onMapViewChanges={testHandlers.handler}
            />
            , document.getElementById("map"));

        const olMap = map.map;
        olMap.on('moveend', () => {
            // The first call is triggered as soon as the map component is mounted, the second one is as a result of setZoom
            expect(spy.calls.length).toEqual(2);
            expect(spy.calls[1].arguments.length).toEqual(6);
            expect(normalizeFloat(spy.calls[1].arguments[0].y, 1)).toBe(43.9);
            expect(normalizeFloat(spy.calls[1].arguments[0].x, 1)).toBe(10.3);
            expect(spy.calls[1].arguments[1]).toBe(12);
            expect(spy.calls[1].arguments[2].bounds).toExist();
            expect(spy.calls[1].arguments[2].crs).toExist();
            expect(spy.calls[1].arguments[3].height).toExist();
            expect(spy.calls[1].arguments[3].width).toExist();
            done();
        });
        olMap.getView().setZoom(12);
        olMap.dispatchEvent('moveend');
    });

    it('check if the handler for "moveend" event is called after setCenter', (done) => {
        const testHandlers = {
            handler: () => {}
        };
        var spy = expect.spyOn(testHandlers, 'handler');

        const map = ReactDOM.render(
            <OpenlayersMap
                center={{y: 43.9, x: 10.3}}
                zoom={11}
                onMapViewChanges={testHandlers.handler}
            />
            , document.getElementById("map"));

        const olMap = map.map;
        olMap.on('moveend', () => {
            // The first call is triggered as soon as the map component is mounted, the second one is as a result of setCenter
            expect(spy.calls.length).toEqual(2);
            expect(spy.calls[1].arguments.length).toEqual(6);
            expect(normalizeFloat(spy.calls[1].arguments[0].y, 1)).toBe(44);
            expect(normalizeFloat(spy.calls[1].arguments[0].x, 1)).toBe(10);
            expect(spy.calls[1].arguments[1]).toBe(11);
            expect(spy.calls[1].arguments[2].bounds).toExist();
            expect(spy.calls[1].arguments[2].crs).toExist();
            expect(spy.calls[1].arguments[3].height).toExist();
            expect(spy.calls[1].arguments[3].width).toExist();
            done();
        });
        olMap.getView().setCenter(transform([10, 44], 'EPSG:4326', 'EPSG:3857'));
        olMap.dispatchEvent('moveend');
    });

    it('check if the map changes when receive new props', () => {
        let map = ReactDOM.render(
            <OpenlayersMap
                center={{y: 43.9, x: 10.3}}
                zoom={11.6}
                measurement={{}}
            />
            , document.getElementById("map"));

        const olMap = map.map;
        expect(olMap.getView().getZoom()).toBe(12);
        map = ReactDOM.render(
            <OpenlayersMap
                center={{y: 44, x: 10}}
                zoom={9.4}
                measurement={{}}
            />
            , document.getElementById("map"));
        expect(olMap.getView().getZoom()).toBe(9);
        let center = map.normalizeCenter(olMap.getView().getCenter());
        expect(center[1].toFixed(1)).toBe('44.0');
        expect(center[0].toFixed(1)).toBe('10.0');
    });

    it('check if the map reprojects the view coordinates when the projection is changed', () => {
        proj.defs("EPSG:25830", "+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
        const projectionDefs = [{
            code: "EPSG:25830",
            extent: [-1300000, 4000000, 1900000, 7500000],
            worldExtent: [-6.0000, 35.9500, 0.0000, 63.9500]
        }];

        let map = ReactDOM.render(
            <OpenlayersMap
                projection="EPSG:900913"
                projectionDefs={projectionDefs}
                center={{y: 43.9, x: 10.3}}
                zoom={11}
                measurement={{}}
            />
            , document.getElementById("map"));
        const firstView = map.map.getView().calculateExtent(map.map.getSize());
        map = ReactDOM.render(
            <OpenlayersMap
                projection="EPSG:25830"
                projectionDefs={projectionDefs}
                center={{y: 43.9, x: 10.3}}
                zoom={11}
                measurement={{}}
            />
            , document.getElementById("map"));
        const secondView = map.map.getView().calculateExtent(map.map.getSize());
        expect(firstView.length).toBe(4);
        expect(secondView.length).toBe(4);
        expect(firstView[0].toFixed(0)).toNotEqual(secondView[0].toFixed(0));

    });

    it('check result of "haveResolutionsChanged()" when receiving new props', () => {
        let map = ReactDOM.render(
            <OpenlayersMap
                center={{y: 43.9, x: 10.3}}
                zoom={11.6}
                measurement={{}}
            />
            , document.getElementById("map"));

        let origProps = assign({}, map.props);
        function testProps(newProps) {
            // update original props with newProps
            return assign({}, origProps, newProps);
        }

        map = ReactDOM.render(
            <OpenlayersMap
                center={{y: 43.9, x: 10.3}}
                zoom={11.6}
                measurement={{}}
                mapOptions={undefined}
            />
            , document.getElementById("map"));

        expect( map.haveResolutionsChanged(testProps({mapOptions: undefined})) ).toBe(false);
        expect( map.haveResolutionsChanged(testProps({mapOptions: {}})) ).toBe(false);
        expect( map.haveResolutionsChanged(testProps({mapOptions: {view: {}}})) ).toBe(false);
        expect( map.haveResolutionsChanged(testProps({mapOptions: {view: {resolutions: []}}})) ).toBe(true);
        expect( map.haveResolutionsChanged(testProps({mapOptions: {view: {resolutions: [10, 5, 2, 1]}}})) ).toBe(true);
        expect( map.haveResolutionsChanged(testProps({mapOptions: {view: {resolutions: [100, 50, 25]}}})) ).toBe(true);

        map = ReactDOM.render(
            <OpenlayersMap
                center={{y: 43.9, x: 10.3}}
                zoom={11.6}
                measurement={{}}
                mapOptions={{}}
            />
            , document.getElementById("map"));
        expect( map.haveResolutionsChanged(testProps({mapOptions: undefined})) ).toBe(false);
        expect( map.haveResolutionsChanged(testProps({mapOptions: {}})) ).toBe(false);
        expect( map.haveResolutionsChanged(testProps({mapOptions: {view: {}}})) ).toBe(false);
        expect( map.haveResolutionsChanged(testProps({mapOptions: {view: {resolutions: []}}})) ).toBe(true);
        expect( map.haveResolutionsChanged(testProps({mapOptions: {view: {resolutions: [10, 5, 2, 1]}}})) ).toBe(true);
        expect( map.haveResolutionsChanged(testProps({mapOptions: {view: {resolutions: [100, 50, 25]}}})) ).toBe(true);

        map = ReactDOM.render(
            <OpenlayersMap
                center={{y: 43.9, x: 10.3}}
                zoom={11.6}
                measurement={{}}
                mapOptions={{view: {}}}
            />
            , document.getElementById("map"));
        expect( map.haveResolutionsChanged(testProps({mapOptions: undefined})) ).toBe(false);
        expect( map.haveResolutionsChanged(testProps({mapOptions: {}})) ).toBe(false);
        expect( map.haveResolutionsChanged(testProps({mapOptions: {view: {}}})) ).toBe(false);
        expect( map.haveResolutionsChanged(testProps({mapOptions: {view: {resolutions: []}}})) ).toBe(true);
        expect( map.haveResolutionsChanged(testProps({mapOptions: {view: {resolutions: [10, 5, 2, 1]}}})) ).toBe(true);
        expect( map.haveResolutionsChanged(testProps({mapOptions: {view: {resolutions: [100, 50, 25]}}})) ).toBe(true);
        map = ReactDOM.render(
            <OpenlayersMap
                center={{y: 43.9, x: 10.3}}
                zoom={11.6}
                measurement={{}}
                mapOptions={{view: {resolutions: [10, 5, 2, 1]}}}
                maxExtent= {[-180, -90, 180, 80]}
            />
            , document.getElementById("map"));
        expect( map.haveResolutionsChanged(testProps({mapOptions: undefined})) ).toBe(true);
        expect( map.haveResolutionsChanged(testProps({mapOptions: {}})) ).toBe(true);
        expect( map.haveResolutionsChanged(testProps({mapOptions: {view: {}}})) ).toBe(true);
        expect( map.haveResolutionsChanged(testProps({mapOptions: {view: {resolutions: []}}})) ).toBe(true);
        expect( map.haveResolutionsChanged(testProps({mapOptions: {view: {resolutions: [10, 5, 2, 1]}}})) ).toBe(false);
        expect( map.haveResolutionsChanged(testProps({mapOptions: {view: {resolutions: [100, 50, 25]}}})) ).toBe(true);
    });

    it('check if the map has "auto" cursor as default', () => {
        const map = ReactDOM.render(
            <OpenlayersMap
                center={{y: 43.9, x: 10.3}}
                zoom={11}
            />
            , document.getElementById("map"));

        const olMap = map.map;
        const mapDiv = olMap.getViewport();
        expect(mapDiv.style.cursor).toBe("auto");
    });

    it('check if the map can be created with a custom cursor', () => {
        const map = ReactDOM.render(
            <OpenlayersMap
                center={{y: 43.9, x: 10.3}}
                zoom={11}
                mousePointer="pointer"
            />
            , document.getElementById("map"));

        const olMap = map.map;
        const mapDiv = olMap.getViewport();
        expect(mapDiv.style.cursor).toBe("pointer");
    });


    it('test COMPUTE_BBOX_HOOK hook execution', () => {
        // instanciating the map that will be used to compute the bounfing box
        let map = ReactDOM.render(<OpenlayersMap id="mymap" center={{y: 43.9, x: 10.3}} zoom={11}/>, document.getElementById("map"));
        // computing the bounding box for the new center and the new zoom
        const bbox = MapUtils.getBbox({y: 44, x: 10}, 5);
        // update the map with the new center and the new zoom so we can check our computed bouding box
        map = ReactDOM.render(<OpenlayersMap id="mymap" center={{y: 44, x: 10}} zoom={5}/>, document.getElementById("map"));
        const mapBbox = map.map.getView().calculateExtent(map.map.getSize());
        // check our computed bounding box agains the map computed one
        expect(bbox).toExist();
        expect(mapBbox).toExist();
        expect(bbox.bounds).toExist();
        expect(Math.abs(bbox.bounds.minx - mapBbox[0])).toBeLessThan(0.0001);
        expect(Math.abs(bbox.bounds.miny - mapBbox[1])).toBeLessThan(0.0001);
        expect(Math.abs(bbox.bounds.maxx - mapBbox[2])).toBeLessThan(0.0001);
        expect(Math.abs(bbox.bounds.maxy - mapBbox[3])).toBeLessThan(0.0001);
        expect(bbox.crs).toExist();
        // by default ol3 will use the "EPSG:3857" crs and rotation in this case should be zero
        expect(bbox.crs).toBe("EPSG:3857");
        expect(bbox.rotation).toBe(0);
    });

    it('test GET_PIXEL_FROM_COORDINATES_HOOK/GET_COORDINATES_FROM_PIXEL_HOOK hook registration', () => {
        MapUtils.registerHook(MapUtils.GET_PIXEL_FROM_COORDINATES_HOOK, undefined);
        MapUtils.registerHook(MapUtils.GET_COORDINATES_FROM_PIXEL_HOOK, undefined);
        let getPixelFromCoordinates = MapUtils.getHook(MapUtils.GET_PIXEL_FROM_COORDINATES_HOOK);
        let getCoordinatesFromPixel = MapUtils.getHook(MapUtils.GET_COORDINATES_FROM_PIXEL_HOOK);
        expect(getPixelFromCoordinates).toNotExist();
        expect(getCoordinatesFromPixel).toNotExist();

        const map = ReactDOM.render(<OpenlayersMap id="mymap" center={{y: 0, x: 0}} zoom={11} registerHooks/>,
            document.getElementById("map"));
        expect(map).toExist();

        getPixelFromCoordinates = MapUtils.getHook(MapUtils.GET_PIXEL_FROM_COORDINATES_HOOK);
        getCoordinatesFromPixel = MapUtils.getHook(MapUtils.GET_COORDINATES_FROM_PIXEL_HOOK);
        expect(getPixelFromCoordinates).toExist();
        expect(getCoordinatesFromPixel).toExist();
    });
    it('test ZOOM_TO_EXTENT_HOOK', (done) => {
        MapUtils.registerHook(MapUtils.ZOOM_TO_EXTENT_HOOK, undefined);

        const testHandlers = {
            onMapViewChanges: () => { }
        };
        // fix size
        document.querySelector('#map').setAttribute('style', "width: 200px; height: 200px");
        const spy = expect.spyOn(testHandlers, 'onMapViewChanges');
        const map = ReactDOM.render(<OpenlayersMap
            id="mymap"
            center={{ y: 0, x: 0 }}
            zoom={11}
            registerHooks
            mapOptions={{ zoomAnimation: false }}
            onMapViewChanges={testHandlers.onMapViewChanges} />,
        document.getElementById("map"));
        const olMap = map.map;
        let bbox1;
        olMap.on('moveend', () => {
            expect(spy.calls[1]).toExist();

            expect(spy.calls[1].arguments[0].x).toBeGreaterThan(9);
            expect(spy.calls[1].arguments[0].y).toBeGreaterThan(9);
            expect(spy.calls[1].arguments[0].x).toBeLessThan(11);
            expect(spy.calls[1].arguments[0].y).toBeLessThan(11);
            if (spy.calls[2]) {
                // center should be almost the same
                expect(spy.calls[2].arguments[0].x).toBeGreaterThan(9);
                expect(spy.calls[2].arguments[0].y).toBeGreaterThan(9);
                expect(spy.calls[2].arguments[0].x).toBeLessThan(11);
                expect(spy.calls[2].arguments[0].y).toBeLessThan(11);
                let size = olMap.getSize();
                let bbox2 = olMap.getView().calculateExtent(size);
                // bbox2 should have a bigger extent that bbox1
                expect(bbox1[2] - bbox1[0]).toBeLessThan(bbox2[2] - bbox2[0]);
                expect(bbox1[3] - bbox1[1]).toBeLessThan(bbox2[3] - bbox2[1]);

                done();
            } else {
                let size = olMap.getSize();
                bbox1 = olMap.getView().calculateExtent(size);
            }

        });
        expect(map).toExist();
        const hook = MapUtils.getHook(MapUtils.ZOOM_TO_EXTENT_HOOK);
        expect(hook).toExist();
        hook([0, 0, 20, 20], { crs: "EPSG:4326", duration: 0 });
        olMap.dispatchEvent('moveend');
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[0]).toExist(); // first is called by initial render

        hook([0, 0, 20, 20], {
            crs: "EPSG:4326", padding: {
                left: 50,
                top: 50,
                right: 50,
                bottom: 50
            }
        });
        olMap.dispatchEvent('moveend');
    });
    it('test ZOOM_TO_EXTENT_HOOK with full extent', (done) => {
        /*
         * Converting [-180, -90, 180, 90] in EPSG:3857 caused a bounds array of [0,0,0,0],
         * and so a zoom to maxZoom in the 0,0 coordinates
         * To avoid this, zoom to max resolution extent.
         * TODO: improve this to manage all degenerated bounding boxes.
         */
        MapUtils.registerHook(MapUtils.ZOOM_TO_EXTENT_HOOK, undefined);

        const testHandlers = {
            onMapViewChanges: () => { }
        };
        // fix size
        document.querySelector('#map').setAttribute('style', "width: 200px; height: 200px");
        const spy = expect.spyOn(testHandlers, 'onMapViewChanges');
        const map = ReactDOM.render(<OpenlayersMap
            id="mymap"
            center={{ y: 0, x: 0 }}
            zoom={11}
            registerHooks
            mapOptions={{ zoomAnimation: false }}
            onMapViewChanges={testHandlers.onMapViewChanges} />,
        document.getElementById("map"));
        const olMap = map.map;
        olMap.on('moveend', () => {
            expect(spy.calls[1]).toExist();
            expect(spy.calls[1].arguments[0].x).toEqual(0);
            expect(spy.calls[1].arguments[0].y).toEqual(0);
            // Bbox should be max.
            expect(spy.calls[1].arguments[1]).toEqual(0);
            expect(spy.calls[1].arguments[2].bounds.maxx).toBeGreaterThan(15654300);
            expect(spy.calls[1].arguments[2].bounds.maxy).toBeGreaterThan(7827150);
            expect(spy.calls[1].arguments[2].bounds.minx).toBeLessThan(-15654300);
            expect(spy.calls[1].arguments[2].bounds.miny).toBeLessThan(-7827150);
            done();

        });
        expect(map).toExist();
        const hook = MapUtils.getHook(MapUtils.ZOOM_TO_EXTENT_HOOK);
        expect(hook).toExist();
        hook([-180, -90, 180, 90], { crs: "EPSG:4326", duration: 0 });
        olMap.dispatchEvent('moveend');
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[0]).toExist(); // first is called by initial render
    });

    it('test ZOOM_TO_EXTENT_HOOK with full extent', (done) => {
        /*
         * Converting [-180, -90, 180, 90] in EPSG:3857 caused a bounds array of [0,0,0,0],
         * and so a zoom to maxZoom in the 0,0 coordinates
         * To avoid this, zoom to max resolution extent.
         * TODO: improve this to manage all degenerated bounding boxes.
         */
        MapUtils.registerHook(MapUtils.ZOOM_TO_EXTENT_HOOK, undefined);

        const testHandlers = {
            onMapViewChanges: () => { }
        };
        // fix size
        document.querySelector('#map').setAttribute('style', "width: 200px; height: 200px");
        const spy = expect.spyOn(testHandlers, 'onMapViewChanges');
        const map = ReactDOM.render(<OpenlayersMap
            id="mymap"
            center={{ y: 0, x: 0 }}
            zoom={11}
            registerHooks
            mapOptions={{ zoomAnimation: false }}
            onMapViewChanges={testHandlers.onMapViewChanges} />,
        document.getElementById("map"));
        const olMap = map.map;
        olMap.on('moveend', () => {
            expect(spy.calls[1]).toExist();
            expect(spy.calls[1].arguments[0].x).toBeGreaterThan(0);
            expect(spy.calls[1].arguments[0].y).toBeGreaterThan(0);
            expect(spy.calls[1].arguments[0].x).toBeLessThan(2);
            expect(spy.calls[1].arguments[0].y).toBeLessThan(2);
            // Bbox should not be max.
            expect(spy.calls[1].arguments[1]).toBe(21);
            expect(spy.calls[1].arguments[2].bounds.maxx).toBeGreaterThan(111319);
            expect(spy.calls[1].arguments[2].bounds.maxy).toBeGreaterThan(111325);
            expect(spy.calls[1].arguments[2].bounds.minx).toBeLessThan(111320);
            expect(spy.calls[1].arguments[2].bounds.miny).toBeLessThan(111326);
            done();

        });
        expect(map).toExist();
        const hook = MapUtils.getHook(MapUtils.ZOOM_TO_EXTENT_HOOK);
        expect(hook).toExist();
        hook([1, 1, 1, 1], { crs: "EPSG:4326", duration: 0 });
        olMap.dispatchEvent('moveend');
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[0]).toExist(); // first is called by initial render
    });

    it('create attribution with container', () => {
        let map = ReactDOM.render(<OpenlayersMap id="ol-map" center={{y: 43.9, x: 10.3}} zoom={11} mapOptions={{attribution: {container: 'body'}}}/>, document.getElementById("map"));
        expect(map).toExist();
        const domMap = document.getElementById('ol-map');
        let attributions = domMap.getElementsByClassName('ol-attribution');
        expect(attributions.length).toBe(0);
        attributions = document.body.getElementsByClassName('ol-attribution');
        expect(attributions.length).toBe(1);
    });

    it('remove attribution from container', () => {
        let map = ReactDOM.render(<OpenlayersMap id="ol-map" center={{y: 43.9, x: 10.3}} zoom={11} mapOptions={{attribution: {container: 'body'}}}/>, document.getElementById("map"));
        expect(map).toExist();
        const domMap = document.getElementById('ol-map');
        let attributions = domMap.getElementsByClassName('ol-attribution');
        expect(attributions.length).toBe(0);
        attributions = document.body.getElementsByClassName('ol-attribution');
        document.body.removeChild(attributions[0]);
        attributions = document.body.getElementsByClassName('ol-attribution');
        expect(attributions.length).toBe(0);
    });
    it('test getResolutions default', () => {
        const maxResolution = 2 * 20037508.34;
        const tileSize = 256;
        const expectedResolutions = Array.from(Array(29).keys()).map( k=> maxResolution / tileSize / Math.pow(2, k));
        let map = ReactDOM.render(<OpenlayersMap id="ol-map" center={{ y: 43.9, x: 10.3 }} zoom={11} mapOptions={{ attribution: { container: 'body' } }} />, document.getElementById("map"));
        expect(map.getResolutions().length).toBe(expectedResolutions.length);
        // NOTE: round
        expect(map.getResolutions().map(a => a.toFixed(4))).toEqual(expectedResolutions.map(a => a.toFixed(4)));

    });
    it('test getResolutions with custom projection', () => {
        const projectionDefs = [
            {
                "code": "EPSG:3003",
                "def": "+proj=tmerc +lat_0=0 +lon_0=9 +k=0.9996 +x_0=1500000 +y_0=0 +ellps=intl+towgs84=-104.1,-49.1,-9.9,0.971,-2.917,0.714,-11.68 +units=m +no_defs",
                "extent": [
                    1241482.0019432348,
                    972767.2605398067,
                    1847542.2626266503,
                    5215189.085323715
                ],
                "worldExtent": [
                    6.6500,
                    8.8000,
                    12.0000,
                    47.0500
                ]
            }
        ];
        proj.defs(projectionDefs[0].code, projectionDefs[0].def);
        const maxResolution = 1847542.2626266503 - 1241482.0019432348;
        const tileSize = 256;
        const expectedResolutions = Array.from(Array(29).keys()).map(k => maxResolution / tileSize / Math.pow(2, k));
        let map = ReactDOM.render(<OpenlayersMap
            id="ol-map"
            center={{
                x: 10.710054361528954,
                y: 43.69814562139725,
                crs: 'EPSG:4326'
            }}
            projectionDefs={projectionDefs}
            zoom={11}
            mapOptions={{ attribution: { container: 'body' } }}
            projection={projectionDefs[0].code}
        />, document.getElementById("map"));

        expect(map.getResolutions()).toExist();
        expect(map.getResolutions().length).toBe(expectedResolutions.length);
        // NOTE: round
        expect(map.getResolutions().map(a => a.toFixed(4))).toEqual(expectedResolutions.map(a => a.toFixed(4)));
    });
    it('test double attribution on document', () => {
        let map = ReactDOM.render(
            <span>
                <div className="ol-attribution"></div>
                <div id="map-attribution"></div>
                <OpenlayersMap id="ol-map" center={{y: 43.9, x: 10.3}} zoom={11} mapOptions={{attribution: {container: '#map-attribution'}}}/>
            </span>
            , document.getElementById("map"));
        expect(map).toExist();
        const domMap = document.getElementById('ol-map');
        let attributions = domMap.getElementsByClassName('ol-attribution');
        expect(attributions.length).toBe(0);
        attributions = document.getElementsByClassName('ol-attribution');
        expect(attributions.length).toBe(2);
    });

    it('test updateMapInfoState with custom projection 3003 (not listed in wrappedProjections)', () => {

        const CENTER_OUTSIDE_OF_MAX_EXTENT = {
            x: 50,
            y: 70,
            crs: 'EPSG:4326'
        };
        const testHandlers = {
            onMapViewChanges: () => { }
        };
        const spyOnMapViewChanges = expect.spyOn(testHandlers, 'onMapViewChanges');
        const projectionDefs = [
            {
                "code": "EPSG:3003",
                "def": "+proj=tmerc +lat_0=0 +lon_0=9 +k=0.9996 +x_0=1500000 +y_0=0 +ellps=intl+towgs84=-104.1,-49.1,-9.9,0.971,-2.917,0.714,-11.68 +units=m +no_defs",
                "extent": [
                    1241482.0019432348,
                    972767.2605398067,
                    1847542.2626266503,
                    5215189.085323715
                ],
                "worldExtent": [
                    6.6500,
                    8.8000,
                    12.0000,
                    47.0500
                ]
            }
        ];
        proj.defs(projectionDefs[0].code, projectionDefs[0].def);
        ReactDOM.render(<OpenlayersMap
            id="ol-map"
            center={CENTER_OUTSIDE_OF_MAX_EXTENT}
            projectionDefs={projectionDefs}
            onMapViewChanges={testHandlers.onMapViewChanges}
            zoom={11}
            mapOptions={{ attribution: { container: 'body' } }}
            projection={projectionDefs[0].code}
        />, document.getElementById("map"));

        expect(spyOnMapViewChanges.calls.length).toBe(0);
    });

    it('test updateMapInfoState projection 3857', () => {

        const CENTER_OUTSIDE_OF_MAX_EXTENT = {
            x: -200,
            y: -100,
            crs: 'EPSG:4326'
        };
        const testHandlers = {
            onMapViewChanges: () => { }
        };
        const spyOnMapViewChanges = expect.spyOn(testHandlers, 'onMapViewChanges');

        ReactDOM.render(<OpenlayersMap
            id="ol-map"
            center={CENTER_OUTSIDE_OF_MAX_EXTENT}
            onMapViewChanges={testHandlers.onMapViewChanges}
            zoom={11}
            mapOptions={{ attribution: { container: 'body' } }}
            projection={'EPSG:3857'}
        />, document.getElementById("map"));

        expect(spyOnMapViewChanges.calls.length).toBe(1);
    });

    it('test updateMapInfoState projection 4326', () => {

        const CENTER_OUTSIDE_OF_MAX_EXTENT = {
            x: 200,
            y: 100,
            crs: 'EPSG:4326'
        };
        const testHandlers = {
            onMapViewChanges: () => { }
        };
        const spyOnMapViewChanges = expect.spyOn(testHandlers, 'onMapViewChanges');

        ReactDOM.render(<OpenlayersMap
            id="ol-map"
            center={CENTER_OUTSIDE_OF_MAX_EXTENT}
            onMapViewChanges={testHandlers.onMapViewChanges}
            zoom={11}
            mapOptions={{ attribution: { container: 'body' } }}
            projection={'EPSG:4326'}
        />, document.getElementById("map"));

        expect(spyOnMapViewChanges.calls.length).toBe(1);
    });

    it('test updateMapInfoState projection 900913', () => {

        const CENTER_OUTSIDE_OF_MAX_EXTENT = {
            x: 200,
            y: -100,
            crs: 'EPSG:4326'
        };
        const testHandlers = {
            onMapViewChanges: () => { }
        };
        const spyOnMapViewChanges = expect.spyOn(testHandlers, 'onMapViewChanges');

        ReactDOM.render(<OpenlayersMap
            id="ol-map"
            center={CENTER_OUTSIDE_OF_MAX_EXTENT}
            onMapViewChanges={testHandlers.onMapViewChanges}
            zoom={11}
            mapOptions={{ attribution: { container: 'body' } }}
            projection={'EPSG:900913'}
        />, document.getElementById("map"));

        expect(spyOnMapViewChanges.calls.length).toBe(1);
    });
    describe('map interactions', () => {

        it('test map without interactions, interactive=false', () => {
            const {map} = ReactDOM.render(
                <OpenlayersMap
                    center={{y: 43.9, x: 10.3}}
                    zoom={11}
                    interactive={false}
                />, document.getElementById("map"));
            expect(map).toExist();
            expect(document.getElementsByClassName('ol-zoom-in').length).toBe(1);
            expect(map.getInteractions).toExist();
            expect(map.getInteractions().getArray().length).toBe(0);
        });
        it('test map with default interactions, interactive=true', () => {
            const {map} = ReactDOM.render(
                <OpenlayersMap
                    center={{y: 43.9, x: 10.3}}
                    zoom={11}
                    interactive
                />, document.getElementById("map"));
            expect(map).toExist();
            expect(document.getElementsByClassName('ol-zoom-in').length).toBe(1);
            expect(map.getInteractions).toExist();
            const mapInteractions = map.getInteractions().getArray();
            expect(mapInteractions.length).toBe(9);

            // checking all 9 basic interaction
            mapInteractions.forEach(interaction => {
                let present = Object.keys(DEFAULT_INTERACTION_OPTIONS).reduce((p, c) => {
                    return p || interaction instanceof DEFAULT_INTERACTION_OPTIONS[c].Instance;
                }, false);
                expect(present).toBe(true);
            });
        });
        it('test map with mouseWheelZoom interaction being disabled ', () => {
            let Comp = ReactDOM.render(
                <OpenlayersMap
                    center={{y: 43.9, x: 10.3}}
                    zoom={11}
                    mapOptions= {{
                        interactions: {
                            mouseWheelZoom: true
                        }
                    }}
                    interactive
                />, document.getElementById("map"));
            let map = Comp.map;
            expect(map).toExist();
            const mapInteractions = map.getInteractions().getArray();
            expect(map.getInteractions).toExist();
            expect(mapInteractions.length).toBe(9);
            let mouseWheelPresent = find(mapInteractions, interaction => interaction instanceof DEFAULT_INTERACTION_OPTIONS.mouseWheelZoom.Instance);
            expect(mouseWheelPresent).toExist();
            expect(mouseWheelPresent.getActive()).toBe(true);
            Comp = ReactDOM.render(
                <OpenlayersMap
                    center={{y: 43.9, x: 10.3}}
                    zoom={11}
                    mapOptions= {{
                        interactions: {
                            mouseWheelZoom: false
                        }
                    }}
                    interactive
                />, document.getElementById("map"));
            map = Comp.map;
            expect(map).toExist();
            expect(map.getInteractions).toExist();
            expect(mapInteractions.length).toBe(9);
            mouseWheelPresent = find(mapInteractions, interaction => interaction instanceof DEFAULT_INTERACTION_OPTIONS.mouseWheelZoom.Instance);
            expect(mouseWheelPresent).toExist();
            expect(mouseWheelPresent.getActive()).toBe(false);
        });
        it('test map with no interaction and then with some interactions being enabled ', () => {
            const MouseWheelInstance = DEFAULT_INTERACTION_OPTIONS.mouseWheelZoom.Instance;
            let Comp = ReactDOM.render(
                <OpenlayersMap
                    center={{y: 43.9, x: 10.3}}
                    zoom={11}
                    interactive={false}
                />, document.getElementById("map"));
            let map = Comp.map;
            expect(map).toExist();
            const mapInteractions = map.getInteractions().getArray();
            expect(map.getInteractions).toExist();
            expect(mapInteractions.length).toBe(0);
            let mouseWheelPresent = find(mapInteractions, interaction => interaction instanceof MouseWheelInstance);
            expect(mouseWheelPresent).toNotExist();
            Comp = ReactDOM.render(
                <OpenlayersMap
                    center={{y: 43.9, x: 10.3}}
                    zoom={11}
                    mapOptions= {{
                        interactions: {
                            mouseWheelZoom: true,
                            dragPan: true
                        }
                    }}
                />, document.getElementById("map"));
            map = Comp.map;
            expect(map).toExist();
            expect(map.getInteractions).toExist();
            expect(mapInteractions.length).toBe(2);
            mouseWheelPresent = find(mapInteractions, interaction => interaction instanceof MouseWheelInstance);
            expect(mouseWheelPresent).toExist();
            expect(mouseWheelPresent.getActive()).toBe(true);
        });
    });
    describe("hookRegister", () => {
        it("default", () => {
            const map = ReactDOM.render(<OpenlayersMap id="mymap" center={{y: 43.9, x: 10.3}} zoom={11}/>, document.getElementById("map"));
            expect(map).toExist();
            expect(ReactDOM.findDOMNode(map).id).toBe('mymap');
            expect(MapUtils.getHook(MapUtils.ZOOM_TO_EXTENT_HOOK)).toExist();
        });
        it("with custom hookRegister", () => {
            const customHooRegister = MapUtils.createRegisterHooks();
            const map = ReactDOM.render(<OpenlayersMap hookRegister={customHooRegister} id="mymap" center={{y: 43.9, x: 10.3}} zoom={11}/>, document.getElementById("map"));
            expect(map).toExist();
            expect(ReactDOM.findDOMNode(map).id).toBe('mymap');
            expect(customHooRegister.getHook(MapUtils.ZOOM_TO_EXTENT_HOOK)).toExist();
        });
    });
});
