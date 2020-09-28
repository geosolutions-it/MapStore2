/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const CesiumMap = require('../Map.jsx');
const CesiumLayer = require('../Layer.jsx');
const expect = require('expect');
const Cesium = require('../../../../libs/cesium');
const MapUtils = require('../../../../utils/MapUtils');


require('../../../../utils/cesium/Layers');
require('../plugins/OSMLayer');

window.CESIUM_BASE_URL = "web/client/libs/Cesium/Build/Cesium";

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
        const map = ReactDOM.render(<CesiumMap id="mymap" center={{y: 43.9, x: 10.3}} zoom={11}/>, document.getElementById("container"));
        expect(map).toExist();
        expect(ReactDOM.findDOMNode(map).id).toBe('mymap');
    });

    it('creates a div for cesium map with default id (map)', () => {
        const map = ReactDOM.render(<CesiumMap center={{y: 43.9, x: 10.3}} zoom={11}/>, document.getElementById("container"));
        expect(map).toExist();
        expect(ReactDOM.findDOMNode(map).id).toBe('map');
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
            expect(map).toExist();
            expect(map.querySelectorAll(".cesium-viewer").length).toBe(1);
        } finally {
            popup.close();
        }
    });

    it('creates multiple maps for different containers', () => {
        const container = ReactDOM.render(

            <div>
                <div id="container1"><CesiumMap id="map1" center={{y: 43.9, x: 10.3}} zoom={11}/></div>
                <div id="container2"><CesiumMap id="map2" center={{y: 43.9, x: 10.3}} zoom={11}/></div>
            </div>
            , document.getElementById("container"));
        expect(container).toExist();

        expect(document.getElementById('map1')).toExist();
        expect(document.getElementById('map2')).toExist();
    });

    it('populates the container with cesium objects', () => {
        const map = ReactDOM.render(<CesiumMap center={{y: 43.9, x: 10.3}} zoom={11}/>, document.getElementById("container"));
        expect(map).toExist();
        expect(document.getElementsByClassName('cesium-viewer').length).toBe(1);
        expect(document.getElementsByClassName('cesium-viewer-cesiumWidgetContainer').length).toBe(1);
        expect(document.getElementsByClassName('cesium-widget').length).toBe(1);
    });

    it('check layers init', () => {
        var options = {
            "visibility": true
        };
        const map = ReactDOM.render(<CesiumMap center={{y: 43.9, x: 10.3}} zoom={11}>
            <CesiumLayer type="osm" options={options} />
        </CesiumMap>, document.getElementById("container"));
        expect(map).toExist();
        expect(map.map.imageryLayers.length).toBe(1);
    });

    it('check layers for elevation', () => {
        var options = {
            "url": "http://fake",
            "name": "mylayer",
            "visibility": true,
            "useForElevation": true
        };
        const map = ReactDOM.render(<CesiumMap center={{ y: 43.9, x: 10.3 }} zoom={11}>
            <CesiumLayer type="wms" options={options} />
        </CesiumMap>, document.getElementById("container"));
        expect(map).toExist();
        expect(map.map.terrainProvider).toExist();
        expect(map.map.terrainProvider.layerName).toBe('mylayer');
    });
    it('check if the handler for "moveend" event is called', (done) => {
        const expectedCalls = 1;
        const precision = 1000000000;
        const testHandlers = {
            handler: () => {}
        };
        var spy = expect.spyOn(testHandlers, 'handler');

        const map = ReactDOM.render(
            <CesiumMap
                center={{y: 10, x: 44}}
                zoom={5}
                onMapViewChanges={testHandlers.handler}
                viewerOptions={{
                    orientation: {
                        heading: 0,
                        pitch: -1 * Math.PI / 2,
                        roll: 0
                    }
                }}

            />
            , document.getElementById("container"));

        const cesiumMap = map.map;
        cesiumMap.camera.moveEnd.addEventListener(() => {
            // check arguments
            expect(spy.calls[0].arguments.length).toEqual(7);
            expect(spy.calls.length).toBe(expectedCalls);
            // check camera moved
            expect(Math.round(spy.calls[0].arguments[0].y * precision) / precision).toBe(30);
            expect(Math.round(spy.calls[0].arguments[0].x * precision) / precision).toBe(20);
            expect(spy.calls[0].arguments[1]).toEqual(5);

            expect(spy.calls[0].arguments[6].orientation.heading).toBe(1);

            for (let c = 0; c < spy.calls.length; c++) {
                expect(spy.calls[c].arguments[2].bounds).toExist();
                expect(spy.calls[c].arguments[2].crs).toExist();
                expect(spy.calls[c].arguments[3].height).toExist();
                expect(spy.calls[c].arguments[3].width).toExist();
            }
            done();

        });
        cesiumMap.camera.setView({
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
        var spy = expect.spyOn(testHandlers, 'handler');

        const map = ReactDOM.render(
            <CesiumMap
                center={{y: 43.9, x: 10.3}}
                zoom={11}
                onClick={testHandlers.handler}
            />
            , document.getElementById("container"));
        expect(map.map).toExist();
        map.onClick(map.map, {position: {x: 100, y: 100 }});
        setTimeout(() => {
            expect(spy.calls.length).toEqual(1);
            expect(spy.calls[0].arguments.length).toEqual(1);
            done();
        }, 800);
    });
    it('check if the map changes when receive new props', () => {
        let map = ReactDOM.render(
            <CesiumMap
                center={{y: 43.9, x: 10.3}}
                zoom={10}
            />
            , document.getElementById("container"));

        const cesiumMap = map.map;

        map = ReactDOM.render(
            <CesiumMap
                center={{y: 44, x: 10}}
                zoom={12}
            />
            , document.getElementById("container"));

        expect(Math.round(cesiumMap.camera.positionCartographic.height - map.getHeightFromZoom(12))).toBe(0);
        expect(Math.round(cesiumMap.camera.positionCartographic.latitude * 180.0 / Math.PI)).toBe(44);
        expect(Math.round(cesiumMap.camera.positionCartographic.longitude * 180.0 / Math.PI)).toBe(10);
    });
    it('test ZOOM_TO_EXTENT_HOOK', (done) => {
        // instanciating the map that will be used to compute the bounfing box
        const testHandlers = {
            onMapViewChanges: (args) => {
                expect(args).toExist();
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
        const hook = MapUtils.getHook(MapUtils.ZOOM_TO_EXTENT_HOOK);
        // update the map with the new center and the new zoom so we can check our computed bouding box
        expect(hook).toExist();

        hook([10, 10, 20, 20], {crs: "EPSG:4326", duration: 0});
        // unregister hook
        MapUtils.registerHook(MapUtils.ZOOM_TO_EXTENT_HOOK);
    });
    describe("hookRegister", () => {
        it("default", () => {
            const map = ReactDOM.render(<CesiumMap id="mymap" center={{y: 43.9, x: 10.3}} zoom={11}/>, document.getElementById("container"));
            expect(map).toExist();
            expect(ReactDOM.findDOMNode(map).id).toBe('mymap');
            expect(MapUtils.getHook(MapUtils.ZOOM_TO_EXTENT_HOOK)).toExist();
        });
        it("with custom hookRegister", () => {
            const customHooRegister = MapUtils.createRegisterHooks();
            const map = ReactDOM.render(<CesiumMap hookRegister={customHooRegister} id="mymap" center={{y: 43.9, x: 10.3}} zoom={11}/>, document.getElementById("container"));
            expect(map).toExist();
            expect(ReactDOM.findDOMNode(map).id).toBe('mymap');
            expect(customHooRegister.getHook(MapUtils.ZOOM_TO_EXTENT_HOOK)).toExist();
        });
    });

});
