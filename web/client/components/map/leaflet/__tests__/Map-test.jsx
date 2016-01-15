/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react/addons');
var ReactDOM = require('react-dom');
var LeafletMap = require('../Map.jsx');
var LeafLetLayer = require('../Layer.jsx');
var expect = require('expect');

require('../../../../utils/leaflet/Layers');
require('../plugins/OSMLayer');

describe('LeafletMap', () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates a div for leaflet map with given id', () => {
        const map = ReactDOM.render(<LeafletMap id="mymap" center={{y: 43.9, x: 10.3}} zoom={11}/>, document.getElementById("container"));
        expect(map).toExist();
        expect(ReactDOM.findDOMNode(map).id).toBe('mymap');
    });

    it('creates a div for leaflet map with default id (map)', () => {
        const map = ReactDOM.render(<LeafletMap center={{y: 43.9, x: 10.3}} zoom={11}/>, document.getElementById("container"));
        expect(map).toExist();
        expect(ReactDOM.findDOMNode(map).id).toBe('map');
    });

    it('creates multiple maps for different containers', () => {
        const container = ReactDOM.render(
        (
            <div>
                <div id="container1"><LeafletMap id="map1" center={{y: 43.9, x: 10.3}} zoom={11}/></div>
                <div id="container2"><LeafletMap id="map2" center={{y: 43.9, x: 10.3}} zoom={11}/></div>
            </div>
        ), document.getElementById("container"));
        expect(container).toExist();

        expect(document.getElementById('map1')).toExist();
        expect(document.getElementById('map2')).toExist();
    });

    it('populates the container with leaflet objects', () => {
        const map = ReactDOM.render(<LeafletMap center={{y: 43.9, x: 10.3}} zoom={11}/>, document.getElementById("container"));
        expect(map).toExist();
        expect(document.getElementsByClassName('leaflet-map-pane').length).toBe(1);
        expect(document.getElementsByClassName('leaflet-tile-pane').length).toBe(1);
        expect(document.getElementsByClassName('leaflet-objects-pane').length).toBe(1);
        expect(document.getElementsByClassName('leaflet-control-container').length).toBe(1);
    });

    it('enables leaflet controls', () => {
        const map = ReactDOM.render(<LeafletMap center={{y: 43.9, x: 10.3}} zoom={11}/>, document.getElementById("container"));
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
        const map = ReactDOM.render(<LeafletMap center={{y: 43.9, x: 10.3}} zoom={11}>
            <LeafLetLayer type="osm" options={options} />
        </LeafletMap>, document.getElementById("container"));
        expect(map).toExist();
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

    it('check if the handler for "click" event is called', (done) => {
        const testHandlers = {
            handler: () => {}
        };
        var spy = expect.spyOn(testHandlers, 'handler');

        const map = ReactDOM.render(
            <LeafletMap
                center={{y: 43.9, x: 10.3}}
                zoom={11}
                onClick={testHandlers.handler}
            />
        , document.getElementById("container"));

        const leafletMap = map.map;
        const mapDiv = leafletMap.getContainer();

        mapDiv.click();
        setTimeout(() => {
            expect(spy.calls.length).toEqual(1);
            expect(spy.calls[0].arguments.length).toEqual(1);
            expect(spy.calls[0].arguments[0].pixel).toExist();
            expect(spy.calls[0].arguments[0].latlng).toExist();
            done();
        }, 600);


    });

    it('check if the map changes when receive new props', () => {
        const map = ReactDOM.render(
            <LeafletMap
                center={{y: 43.9, x: 10.3}}
                zoom={11}
                measurement={{}}
            />
        , document.getElementById("container"));

        const leafletMap = map.map;

        map.setProps({zoom: 12, center: {y: 44, x: 10}});
        expect(leafletMap.getZoom()).toBe(12);
        expect(leafletMap.getCenter().lat).toBe(44);
        expect(leafletMap.getCenter().lng).toBe(10);
    });

    it('check if the map has "auto" cursor as default', () => {
        const map = ReactDOM.render(
            <LeafletMap
                center={{y: 43.9, x: 10.3}}
                zoom={11}
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
            />
        , document.getElementById("container"));

        const leafletMap = map.map;
        const mapDiv = leafletMap.getContainer();
        expect(mapDiv.style.cursor).toBe("pointer");
    });
});
