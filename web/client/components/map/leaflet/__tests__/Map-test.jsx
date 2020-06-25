/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const LeafletMap = require('../Map.jsx');
const LeafLetLayer = require('../Layer.jsx');
const expect = require('expect');
const mapUtils = require('../../../../utils/MapUtils');
const {isNumber} = require('lodash');
const MapUtils = require('../../../../utils/MapUtils');

require('leaflet-draw');

require('../../../../utils/leaflet/Layers');
require('../plugins/OSMLayer');

// required for elevation tests
require('../plugins/WMSLayer');

describe('LeafletMap', () => {

    let mapStyle;
    beforeEach(() => {
        document.body.innerHTML = '<div id="container"></div>';
        // assign size to map component to get width and height of map
        mapStyle = document.createElement('style');
        mapStyle.innerHTML = `
        #container {
            position: relative;
            width: 500px;
            height: 500px;
        }
        #container > * {
            position: absolute;
            width: 100%;
            height: 100%;
        }`;
        document.head.appendChild(mapStyle);
    });
    afterEach(() => {
        try {
            ReactDOM.unmountComponentAtNode(document.getElementById("container"));
            const attributions = document.body.getElementsByClassName('leaflet-control-attribution');
            if (attributions.length > 0) {
                document.body.removeChild(attributions[0]);
            }
            document.body.innerHTML = '';
        } catch (e) {
            // ignore
        }

        if (mapStyle) {
            document.head.removeChild(mapStyle);
            mapStyle = undefined;
        }
        MapUtils.clearHooks();
    });

    it('creates a div for leaflet map with given id', () => {
        const map = ReactDOM.render(<LeafletMap id="mymap" center={{y: 43.9, x: 10.3}} zoom={11} mapOptions={{zoomAnimation: false}}/>, document.getElementById("container"));
        expect(map).toExist();
        expect(ReactDOM.findDOMNode(map).id).toBe('mymap');
    });

    it('creates a div for leaflet map with default id (map)', () => {
        const map = ReactDOM.render(<LeafletMap center={{y: 43.9, x: 10.3}} zoom={11} mapOptions={{zoomAnimation: false}}/>, document.getElementById("container"));
        expect(map).toExist();
        expect(ReactDOM.findDOMNode(map).id).toBe('map');
    });

    it('creates multiple maps for different containers', () => {
        const container = ReactDOM.render(

            <div>
                <div id="container1"><LeafletMap id="map1" center={{y: 43.9, x: 10.3}} zoom={11} mapOptions={{zoomAnimation: false}}/></div>
                <div id="container2"><LeafletMap id="map2" center={{y: 43.9, x: 10.3}} zoom={11} mapOptions={{zoomAnimation: false}}/></div>
            </div>
            , document.getElementById("container"));
        expect(container).toExist();

        expect(document.getElementById('map1')).toExist();
        expect(document.getElementById('map2')).toExist();
    });

    it('populates the container with leaflet objects', () => {
        const map = ReactDOM.render(<LeafletMap center={{y: 43.9, x: 10.3}} zoom={11} mapOptions={{zoomAnimation: false}}/>, document.getElementById("container"));
        expect(map).toExist();
        expect(document.getElementsByClassName('leaflet-map-pane').length).toBe(1);
        expect(document.getElementsByClassName('leaflet-tile-pane').length).toBe(1);
        expect(document.getElementsByClassName('leaflet-popup-pane').length).toBe(1);
        expect(document.getElementsByClassName('leaflet-control-container').length).toBe(1);
    });

    it('enables leaflet controls', () => {
        const map = ReactDOM.render(<LeafletMap center={{y: 43.9, x: 10.3}} zoom={11} mapOptions={{zoomAnimation: false}}/>, document.getElementById("container"));
        expect(map).toExist();
        expect(document.getElementsByClassName('leaflet-control-zoom-in').length).toBe(1);

        const leafletMap = map.map;
        expect(leafletMap).toExist();

        const zoomIn = document.getElementsByClassName('leaflet-control-zoom-in')[0];
        zoomIn.click();
        expect(leafletMap.getZoom()).toBe(12);

        const zoomOut = document.getElementsByClassName('leaflet-control-zoom-out')[0];
        zoomOut.click();
        expect(leafletMap.getZoom()).toBe(11);
    });

    it('check layers init', () => {
        var options = {
            "visibility": true
        };
        const map = ReactDOM.render(<LeafletMap center={{y: 43.9, x: 10.3}} zoom={11} mapOptions={{zoomAnimation: false}}>
            <LeafLetLayer type="osm" options={options} />
        </LeafletMap>, document.getElementById("container"));
        expect(map).toExist();
        expect(document.getElementsByClassName('leaflet-layer').length).toBe(1);
    });

    it('renders a map on an external window', () => {
        const popup = window.open("", "", "width=300,height=300,left=200,top=200");
        try {
            const container = document.createElement("div");
            popup.document.body.appendChild(container);
            const Comp = () => {
                return ReactDOM.createPortal(<LeafletMap center={{ y: 43.9, x: 10.3 }} zoom={11} document={popup.document}
                />, container);
            };
            ReactDOM.render(<Comp/>, document.getElementById("container"));
            const map = popup.document.getElementById("map");
            expect(map).toExist();
            expect(map.querySelectorAll(".leaflet-map-pane").length).toBe(1);
        } finally {
            popup.close();
        }
    });

    it('check layers for elevation', () => {
        var options = {
            "url": "http://fake",
            "name": "mylayer",
            "visibility": true,
            "useForElevation": true
        };
        const map = ReactDOM.render(<LeafletMap center={{ y: 43.9, x: 10.3 }} zoom={11} mapOptions={{ zoomAnimation: false }}>
            <LeafLetLayer type="wms" options={options} />
        </LeafletMap>, document.getElementById("container"));
        expect(map).toExist();
        expect(map.elevationLayer).toExist();
        expect(document.getElementsByClassName('leaflet-layer').length).toBe(1);
    });

    it('check if the handler for "moveend" event is called', () => {
        const expectedCalls = 2;
        const testHandlers = {
            handler: () => {}
        };
        var spy = expect.spyOn(testHandlers, 'handler');

        const map = ReactDOM.render(
            <LeafletMap
                center={{y: 43.9, x: 10.3}}
                zoom={11}
                onMapViewChanges={testHandlers.handler}
            />
            , document.getElementById("container"));

        const leafletMap = map.map;

        leafletMap.on('moveend', () => {
            expect(spy.calls.length).toEqual(expectedCalls);
            expect(spy.calls[0].arguments.length).toEqual(6);

            expect(spy.calls[0].arguments[0].y).toEqual(43.9);
            expect(spy.calls[0].arguments[0].x).toEqual(10.3);
            expect(spy.calls[0].arguments[1]).toEqual(11);

            expect(spy.calls[1].arguments[0].y).toEqual(44);
            expect(spy.calls[1].arguments[0].x).toEqual(10);
            expect(spy.calls[1].arguments[1]).toEqual(12);

            for (let c = 0; c < expectedCalls; c++) {
                expect(spy.calls[c].arguments[2].bounds).toExist();
                expect(spy.calls[c].arguments[2].crs).toExist();
                expect(spy.calls[c].arguments[3].height).toExist();
                expect(spy.calls[c].arguments[3].width).toExist();
            }
        });
        leafletMap.setView({lat: 44, lng: 10}, 12);
    });

    it('check if the handler for "click" event is called', () => {
        const testHandlers = {
            handler: () => {}
        };
        var spy = expect.spyOn(testHandlers, 'handler');

        const map = ReactDOM.render(
            <LeafletMap
                center={{y: 43.9, x: 10.3}}
                zoom={11}
                onClick={testHandlers.handler}
                mapOptions={{zoomAnimation: false}}
            />
            , document.getElementById("container"));

        const leafletMap = map.map;
        leafletMap.fire('singleclick', {
            containerPoint: {
                x: 100,
                y: 100
            },
            latlng: {
                lat: 43,
                lng: 10
            },
            originalEvent: {
                altKey: false,
                ctrlKey: false,
                shiftKey: false
            }
        });
        expect(spy.calls.length).toBe(1);
        expect(spy.calls[0].arguments.length).toBe(1);
        expect(spy.calls[0].arguments[0].pixel).toExist();
        expect(spy.calls[0].arguments[0].latlng).toExist();
        expect(spy.calls[0].arguments[0].latlng.z).toNotExist();
        expect(spy.calls[0].arguments[0].modifiers).toExist();
        expect(spy.calls[0].arguments[0].modifiers.alt).toBe(false);
        expect(spy.calls[0].arguments[0].modifiers.ctrl).toBe(false);
        expect(spy.calls[0].arguments[0].modifiers.shift).toBe(false);
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
            <LeafletMap
                center={{ y: 43.9, x: 10.3 }}
                zoom={11}
                onClick={testHandlers.handler}
                mapOptions={{ zoomAnimation: false }}
            ><LeafLetLayer type="wms" options={options} /></LeafletMap>
            , document.getElementById("container"));

        const leafletMap = map.map;
        leafletMap.fire('singleclick', {
            containerPoint: {
                x: 100,
                y: 100
            },
            latlng: {
                lat: 43,
                lng: 10
            },
            originalEvent: {
                altKey: false,
                ctrlKey: false,
                shiftKey: false
            }
        });
        expect(spy.calls.length).toBe(1);
        expect(spy.calls[0].arguments.length).toBe(1);
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
            <LeafletMap
                center={{ y: 43.9, x: 10.3 }}
                zoom={11}
                onMouseMove={testHandlers.handler}
                mapOptions={{ zoomAnimation: false }}
            />
            , document.getElementById("container"));

        const leafletMap = map.map;
        leafletMap.fire('mousemove', {
            containerPoint: {
                x: 100,
                y: 100
            },
            latlng: {
                wrap: () => ({
                    lat: 43,
                    lng: 10
                })
            },
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
            <LeafletMap
                center={{ y: 43.9, x: 10.3 }}
                zoom={11}
                onMouseMove={testHandlers.handler}
                mapOptions={{ zoomAnimation: false }}
            ><LeafLetLayer type="wms" options={options} /></LeafletMap>
            , document.getElementById("container"));

        const leafletMap = map.map;
        leafletMap.fire('mousemove', {
            containerPoint: {
                x: 100,
                y: 100
            },
            latlng: {
                wrap: () => ({
                    lat: 43,
                    lng: 10
                })
            },
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

    it('check if the map changes when receive new props', () => {
        let map = ReactDOM.render(
            <LeafletMap
                center={{y: 43.9, x: 10.3}}
                zoom={11.6}
                measurement={{}}
                mapOptions={{zoomAnimation: false}}
            />
            , document.getElementById("container"));

        const leafletMap = map.map;
        expect(leafletMap.getZoom()).toBe(12);
        map = ReactDOM.render(
            <LeafletMap
                center={{y: 44, x: 10}}
                zoom={10.4}
                measurement={{}}
                mapOptions={{zoomAnimation: false}}
            />
            , document.getElementById("container"));
        expect(leafletMap.getZoom()).toBe(10);
        expect(leafletMap.getCenter().lat).toBe(44);
        expect(leafletMap.getCenter().lng).toBe(10);
    });

    it('check if the map has "auto" cursor as default', () => {
        const map = ReactDOM.render(
            <LeafletMap
                center={{y: 43.9, x: 10.3}}
                zoom={11}
                mapOptions={{zoomAnimation: false}}
            />
            , document.getElementById("container"));

        const leafletMap = map.map;
        const mapDiv = leafletMap.getContainer();
        expect(mapDiv.style.cursor).toBe("auto");
    });

    it('check if the map can be created with a custom cursor', () => {
        const map = ReactDOM.render(
            <LeafletMap
                center={{y: 43.9, x: 10.3}}
                zoom={11}
                mousePointer="pointer"
                mapOptions={{zoomAnimation: false}}
            />
            , document.getElementById("container"));

        const leafletMap = map.map;
        const mapDiv = leafletMap.getContainer();
        expect(mapDiv.style.cursor).toBe("pointer");
    });

    it('test COMPUTE_BBOX_HOOK hook execution', () => {
        // instanciating the map that will be used to compute the bounfing box
        let map = ReactDOM.render(<LeafletMap id="mymap" center={{y: 43.9, x: 10.3}} zoom={11} mapOptions={{zoomAnimation: false}}/>, document.getElementById("container"));
        // computing the bounding box for the new center and the new zoom
        const bbox = mapUtils.getBbox({y: 44, x: 10}, 5);
        // update the map with the new center and the new zoom so we can check our computed bouding box
        map = ReactDOM.render(<LeafletMap id="mymap" center={{y: 44, x: 10}} zoom={5}/>, document.getElementById("container"));
        const mapBbox = map.map.getBounds().toBBoxString().split(',');
        // check our computed bounding box agains the map computed one
        expect(bbox).toExist();
        expect(mapBbox).toExist();
        expect(bbox.bounds).toExist();

        expect(isNumber(bbox.bounds.minx)).toBe(true);
        expect(isNumber(bbox.bounds.miny)).toBe(true);
        expect(isNumber(bbox.bounds.maxx)).toBe(true);
        expect(isNumber(bbox.bounds.maxy)).toBe(true);

        expect(Math.round(bbox.bounds.minx)).toBe(Math.round(parseFloat(mapBbox[0])));
        expect(Math.round(bbox.bounds.miny)).toBe(Math.round(parseFloat(mapBbox[1])));
        expect(Math.round(bbox.bounds.maxx)).toBe(Math.round(parseFloat(mapBbox[2])));
        expect(Math.round(bbox.bounds.maxy)).toBe(Math.round(parseFloat(mapBbox[3])));

        expect(bbox.crs).toExist();
        // in the case of leaflet the bounding box CRS should always be "EPSG:4326" and the roation 0
        expect(bbox.crs).toBe("EPSG:4326");
        expect(bbox.rotation).toBe(0);
    });

    it('check that new props, current props and map state values are used', () => {

        // instanciate the leaflet map
        let map = ReactDOM.render(<LeafletMap id="mymap" center={{y: 40.0, x: 10.0}} zoom={10} mapOptions={{zoomAnimation: false}}/>,
            document.getElementById("container"));

        // updating leaflet map view without updating the props
        map.map.setView([50.0, 20.0], 15);
        expect(map.map.getZoom()).toBe(15);
        expect(map.map.getCenter().lng).toBe(20.0);
        expect(map.map.getCenter().lat).toBe(50.0);

        // setup some spyes to detect changes in leaflet map view
        const setViewSpy = expect.spyOn(map.map, "setView").andCallThrough();

        // since the props are the same no view changes should happend
        map = ReactDOM.render(<LeafletMap id="mymap" center={{y: 40.0, x: 10.0}} zoom={10}/>,
            document.getElementById("container"));
        expect(setViewSpy.calls.length).toBe(0);

        // the view view should not be updated since new props are equal to map values
        map = ReactDOM.render(<LeafletMap id="mymap" center={{y: 50.0, x: 20.0}} zoom={15}/>,
            document.getElementById("container"));
        expect(setViewSpy.calls.length).toBe(0);

        // the zoom and center values should be udpated
        map = ReactDOM.render(<LeafletMap id="mymap" center={{y: 40.0, x: 10.0}} zoom={10}/>,
            document.getElementById("container"));
        expect(setViewSpy.calls.length).toBe(1);
        expect(map.map.getZoom()).toBe(10);
        expect(map.map.getCenter().lng).toBe(10.0);
        expect(map.map.getCenter().lat).toBe(40.0);
    });

    it('test GET_PIXEL_FROM_COORDINATES_HOOK/GET_COORDINATES_FROM_PIXEL_HOOK hook registration', () => {
        mapUtils.registerHook(mapUtils.GET_PIXEL_FROM_COORDINATES_HOOK, undefined);
        mapUtils.registerHook(mapUtils.GET_COORDINATES_FROM_PIXEL_HOOK, undefined);
        let getPixelFromCoordinates = mapUtils.getHook(mapUtils.GET_PIXEL_FROM_COORDINATES_HOOK);
        let getCoordinatesFromPixel = mapUtils.getHook(mapUtils.GET_COORDINATES_FROM_PIXEL_HOOK);
        expect(getPixelFromCoordinates).toNotExist();
        expect(getCoordinatesFromPixel).toNotExist();

        const map = ReactDOM.render(<LeafletMap id="mymap" center={{y: 0, x: 0}} zoom={11} registerHooks mapOptions={{zoomAnimation: false}}/>,
            document.getElementById("container"));
        expect(map).toExist();

        getPixelFromCoordinates = mapUtils.getHook(mapUtils.GET_PIXEL_FROM_COORDINATES_HOOK);
        getCoordinatesFromPixel = mapUtils.getHook(mapUtils.GET_COORDINATES_FROM_PIXEL_HOOK);
        expect(getPixelFromCoordinates).toExist();
        expect(getCoordinatesFromPixel).toExist();
    });
    it('test ZOOM_TO_EXTENT_HOOK', () => {
        mapUtils.registerHook(mapUtils.ZOOM_TO_EXTENT_HOOK, undefined);

        const testHandlers = {
            onMapViewChanges: () => {}
        };
        // fix size
        document.querySelector('#container').setAttribute('style', "width: 200px; height: 160px");
        const spy = expect.spyOn(testHandlers, 'onMapViewChanges');
        const map = ReactDOM.render(<LeafletMap
            id="mymap"
            center={{ y: 0, x: 0 }}
            zoom={11}
            registerHooks
            mapOptions={{ zoomAnimation: false,
                // had to add maxZoom to avoid https://github.com/Leaflet/Leaflet/issues/5153 in the second hook call
                maxZoom: 21 }}
            onMapViewChanges={testHandlers.onMapViewChanges} />,
        document.getElementById("container"));
        expect(map).toExist();
        const hook = mapUtils.getHook(mapUtils.ZOOM_TO_EXTENT_HOOK);
        expect(hook).toExist();
        hook([0, 0, 20, 20], {crs: "EPSG:4326"});
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[1]).toExist(); // first is called by initial render
        expect(spy.calls[1].arguments[0].x).toBeGreaterThan(9);
        expect(spy.calls[1].arguments[0].y).toBeGreaterThan(9);
        expect(spy.calls[1].arguments[0].x).toBeLessThan(11);
        expect(spy.calls[1].arguments[0].y).toBeLessThan(11);
        const bounds1 = map.map.getBounds();
        // center should be the same
        expect(bounds1.getCenter().lng).toBeGreaterThan(9);
        expect(bounds1.getCenter().lat).toBeGreaterThan(9);
        expect(bounds1.getCenter().lng).toBeLessThan(11);
        expect(bounds1.getCenter().lat).toBeLessThan(11);

        hook([0, 0, 20, 20], {
            crs: "EPSG:4326",
            duration: 0,
            padding: {
                left: 50,
                top: 50,
                right: 50,
                bottom: 50
            }
        });
        const bounds2 = map.map.getBounds();
        // center should be almost the same
        expect(bounds2.getCenter().lng).toBeGreaterThan(9);
        expect(bounds2.getCenter().lat).toBeGreaterThan(9);
        expect(bounds2.getCenter().lng).toBeLessThan(11);
        expect(bounds2.getCenter().lat).toBeLessThan(11);

        // but bounds different
        expect(bounds2.getEast()).toNotEqual(bounds1.getEast());
        expect(bounds2.getWest()).toNotEqual(bounds1.getWest());
        expect(bounds2.getNorth()).toNotEqual(bounds1.getNorth());
        expect(bounds2.getSouth()).toNotEqual(bounds1.getSouth());

        // bounds2 size must be greater than bounds1
        expect(bounds2.getWest() - bounds2.getEast()).toNotEqual(bounds1.getWest() - bounds1.getEast());
        expect(bounds2.getNorth() - bounds2.getSouth()).toNotEqual(bounds1.getNorth() - bounds1.getSouth());
    });

    it('create attribution with container', () => {
        let map = ReactDOM.render(<LeafletMap center={{y: 43.9, x: 10.3}} zoom={11} mapOptions={{attribution: {container: 'body'}}}/>, document.getElementById("container"));
        expect(map).toExist();
        const domMap = document.getElementById('container');
        let attributions = domMap.getElementsByClassName('leaflet-control-attribution');
        expect(attributions.length).toBe(0);
        attributions = document.body.getElementsByClassName('leaflet-control-attribution');
        expect(attributions.length).toBe(1);
    });

    it('remove attribution from container', () => {
        let map = ReactDOM.render(<LeafletMap center={{y: 43.9, x: 10.3}} zoom={11} mapOptions={{attribution: {container: 'body'}}}/>, document.getElementById("container"));
        expect(map).toExist();
        const domMap = document.getElementById('container');
        let attributions = domMap.getElementsByClassName('leaflet-control-attribution');
        expect(attributions.length).toBe(0);
        attributions = document.body.getElementsByClassName('leaflet-control-attribution');
        expect(attributions.length).toBe(1);
        document.body.removeChild(attributions[0]);
        attributions = document.body.getElementsByClassName('leaflet-control-attribution');
        expect(attributions.length).toBe(0);
    });

    it('add layer observable', () => {

        let map = ReactDOM.render(
            <LeafletMap center={{y: 43.9, x: 10.3}} zoom={11}/>,
            document.getElementById("container"));

        expect(map).toExist();
        let event = {
            layer: {
                layerId: 2,
                on: () => {},
                _ms2LoadingTileCount: 1
            }
        };

        map.addLayerObservable(event, false);
        expect(event.layer.layerLoadingStream$).toNotExist();
        expect(event.layer.layerErrorStream$).toNotExist();
        expect(event.layer.layerLoadStream$).toNotExist();

    });

    it('add layer observable no tile error', () => {

        const actions = {
            onLayerError: () => {}
        };

        const spyLayerError = expect.spyOn(actions, 'onLayerError');

        let map = ReactDOM.render(
            <LeafletMap center={{y: 43.9, x: 10.3}} zoom={11} onLayerError={actions.onLayerError}/>,
            document.getElementById("container"));

        expect(map).toExist();
        let event = {
            layer: {
                layerId: 2,
                on: () => {},
                _ms2LoadingTileCount: 1
            }
        };

        map.addLayerObservable(event, true);

        event.layer.layerLoadingStream$.next();
        event.layer.layerLoadStream$.next();
        expect(spyLayerError).toNotHaveBeenCalled();
    });

    it('add layer observable with tile error', () => {

        const actions = {
            onLayerError: () => {}
        };

        const spyLayerError = expect.spyOn(actions, 'onLayerError');

        let map = ReactDOM.render(
            <LeafletMap center={{y: 43.9, x: 10.3}} zoom={11} onLayerError={actions.onLayerError}/>,
            document.getElementById("container"));

        expect(map).toExist();
        let event = {
            layer: {
                layerId: 2,
                on: () => {},
                _ms2LoadingTileCount: 1
            }
        };

        map.addLayerObservable(event, true);

        event.layer.layerLoadingStream$.next();
        event.layer.layerErrorStream$.next({ target: { layerId: 2 }});
        event.layer.layerLoadStream$.next();
        expect(spyLayerError).toHaveBeenCalled();
    });
    describe("hookRegister", () => {
        it("default", () => {
            const map = ReactDOM.render(<LeafletMap id="mymap" center={{y: 43.9, x: 10.3}} zoom={11} mapOptions={{zoomAnimation: false}}/>, document.getElementById("container"));
            expect(map).toExist();
            expect(ReactDOM.findDOMNode(map).id).toBe('mymap');
            expect(MapUtils.getHook(MapUtils.ZOOM_TO_EXTENT_HOOK)).toExist();
        });
        it("with custom hookRegister", () => {
            const customHooRegister = MapUtils.createRegisterHooks();
            const map = ReactDOM.render(<LeafletMap hookRegister={customHooRegister} id="mymap" center={{y: 43.9, x: 10.3}} zoom={11} mapOptions={{zoomAnimation: false}}/>, document.getElementById("container"));
            expect(map).toExist();
            expect(ReactDOM.findDOMNode(map).id).toBe('mymap');
            expect(customHooRegister.getHook(MapUtils.ZOOM_TO_EXTENT_HOOK)).toExist();
        });
    });
});
