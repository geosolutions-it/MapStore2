/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react/addons');
var LeafletMap = require('../Map.jsx');
var LeafLetLayer = require('../Layer.jsx');
var expect = require('expect');

require('../../../utils/leaflet/Layers');
require('../plugins/OSMLayer');

describe('LeafletMap', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates a div for leaflet map with given id', () => {
        const map = React.render(<LeafletMap id="mymap" center={{y: 43.9, x: 10.3}} zoom={11}/>, document.body);
        expect(map).toExist();
        expect(React.findDOMNode(map).id).toBe('mymap');
    });

    it('creates a div for leaflet map with default id (map)', () => {
        const map = React.render(<LeafletMap center={{y: 43.9, x: 10.3}} zoom={11}/>, document.body);
        expect(map).toExist();
        expect(React.findDOMNode(map).id).toBe('map');
    });

    it('creates multiple maps for different containers', () => {
        const container = React.render(
        (
            <div>
                <div id="container1"><LeafletMap id="map1" center={{y: 43.9, x: 10.3}} zoom={11}/></div>
                <div id="container2"><LeafletMap id="map2" center={{y: 43.9, x: 10.3}} zoom={11}/></div>
            </div>
        ), document.body);
        expect(container).toExist();

        expect(document.getElementById('map1')).toExist();
        expect(document.getElementById('map2')).toExist();
    });

    it('populates the container with leaflet objects', () => {
        const map = React.render(<LeafletMap center={{y: 43.9, x: 10.3}} zoom={11}/>, document.body);
        expect(map).toExist();
        expect(document.getElementsByClassName('leaflet-map-pane').length).toBe(1);
        expect(document.getElementsByClassName('leaflet-tile-pane').length).toBe(1);
        expect(document.getElementsByClassName('leaflet-objects-pane').length).toBe(1);
        expect(document.getElementsByClassName('leaflet-control-container').length).toBe(1);
    });

    it('enables leaflet controls', () => {
        const map = React.render(<LeafletMap center={{y: 43.9, x: 10.3}} zoom={11}/>, document.body);
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
        const map = React.render(<LeafletMap center={{y: 43.9, x: 10.3}} zoom={11}>
            <LeafLetLayer type="osm" options={options} />
        </LeafletMap>, document.body);
        expect(map).toExist();
        expect(document.getElementsByClassName('leaflet-layer').length).toBe(1);
    });

    it('check if the handler for "moveend" event is called', () => {
        const expectedCalls = 2;
        const testHandlers = {
            handler: () => {}
        };
        var spy = expect.spyOn(testHandlers, 'handler');

        const map = React.render(
            <LeafletMap
                center={{y: 43.9, x: 10.3}}
                zoom={11}
                onMapViewChanges={testHandlers.handler}
            />
        , document.body);

        const leafletMap = map.map;

        leafletMap.on('moveend', () => {
            expect(spy.calls.length).toEqual(expectedCalls);
            expect(spy.calls[0].arguments.length).toEqual(4);

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

        const map = React.render(
            <LeafletMap
                center={{y: 43.9, x: 10.3}}
                zoom={11}
                onClick={testHandlers.handler}
            />
        , document.body);

        const leafletMap = map.map;
        const mapDiv = leafletMap.getContainer();

        mapDiv.click();

        expect(spy.calls.length).toEqual(1);

        expect(spy.calls[0].arguments.length).toEqual(1);
        expect(spy.calls[0].arguments[0].x).toExist();
        expect(spy.calls[0].arguments[0].y).toExist();
    });

    it('check if the map changes when receive new props', () => {
        const map = React.render(
            <LeafletMap
                center={{y: 43.9, x: 10.3}}
                zoom={11}
            />
        , document.body);

        const leafletMap = map.map;

        map.setProps({zoom: 12, center: {y: 44, x: 10}});
        expect(leafletMap.getZoom()).toBe(12);
        expect(leafletMap.getCenter().lat).toBe(44);
        expect(leafletMap.getCenter().lng).toBe(10);
    });
});
