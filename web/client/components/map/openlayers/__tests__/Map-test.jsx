/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const OpenlayersMap = require('../Map.jsx');
const OpenlayersLayer = require('../Layer.jsx');
const expect = require('expect');
const assign = require('object-assign');
const ol = require('openlayers');
const mapUtils = require('../../../../utils/MapUtils');

require('../../../../utils/openlayers/Layers');
require('../plugins/OSMLayer');
require('../plugins/VectorLayer');

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
                    feature: new ol.Feature({
                        geometry: new ol.geom.Point([10.3, 43.9]),
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
                    feature: new ol.Feature({
                        geometry: new ol.geom.Polygon([ [0, 0], [0, 1], [1, 1], [1, 0], [0, 0] ]),
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
    it('click on feature for handleClickOnLayer', (done) => {
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
                    feature: new ol.Feature({
                        geometry: new ol.geom.Polygon([ [0, 0], [0, 1], [1, 1], [1, 0], [0, 0] ]),
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
            expect(spy.calls[0].arguments[0].latlng.lat).toBe(43.9);
            expect(spy.calls[0].arguments[0].latlng.lng).toBe(10.3);
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
        olMap.getView().setZoom(12);

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
        olMap.getView().setCenter(ol.proj.transform([10, 44], 'EPSG:4326', 'EPSG:3857'));

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
        const bbox = mapUtils.getBbox({y: 44, x: 10}, 5);
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
        mapUtils.registerHook(mapUtils.GET_PIXEL_FROM_COORDINATES_HOOK, undefined);
        mapUtils.registerHook(mapUtils.GET_COORDINATES_FROM_PIXEL_HOOK, undefined);
        let getPixelFromCoordinates = mapUtils.getHook(mapUtils.GET_PIXEL_FROM_COORDINATES_HOOK);
        let getCoordinatesFromPixel = mapUtils.getHook(mapUtils.GET_COORDINATES_FROM_PIXEL_HOOK);
        expect(getPixelFromCoordinates).toNotExist();
        expect(getCoordinatesFromPixel).toNotExist();

        const map = ReactDOM.render(<OpenlayersMap id="mymap" center={{y: 0, x: 0}} zoom={11} registerHooks/>,
                                    document.getElementById("map"));
        expect(map).toExist();

        getPixelFromCoordinates = mapUtils.getHook(mapUtils.GET_PIXEL_FROM_COORDINATES_HOOK);
        getCoordinatesFromPixel = mapUtils.getHook(mapUtils.GET_COORDINATES_FROM_PIXEL_HOOK);
        expect(getPixelFromCoordinates).toExist();
        expect(getCoordinatesFromPixel).toExist();
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
});
