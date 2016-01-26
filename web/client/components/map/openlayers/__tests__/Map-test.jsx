/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react/addons');
var ReactDOM = require('react-dom');
var OpenlayersMap = require('../Map.jsx');
var OpenlayersLayer = require('../Layer.jsx');
var expect = require('expect');
var ol = require('openlayers');

require('../../../../utils/openlayers/Layers');
require('../plugins/OSMLayer');

describe('OpenlayersMap', () => {

    var normalizeFloat = function(f, places) {
        return parseFloat(f.toFixed(places));
    };

    beforeEach((done) => {
        document.body.innerHTML = '<div id="map"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("map"));
        document.body.innerHTML = '';
        setTimeout(done);
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
        (
            <div>
                <div id="container1"><OpenlayersMap id="map1" center={{y: 43.9, x: 10.3}} zoom={11}/></div>
                <div id="container2"><OpenlayersMap id="map2" center={{y: 43.9, x: 10.3}} zoom={11}/></div>
            </div>
        ), document.getElementById("map"));
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

    it('enables openlayers controls', () => {
        const map = ReactDOM.render(<OpenlayersMap center={{y: 43.9, x: 10.3}} zoom={11}/>, document.getElementById("map"));
        expect(map).toExist();
        expect(document.getElementsByClassName('ol-zoom-in').length).toBe(1);

        const olMap = map.map;
        expect(olMap).toExist();

        const zoomIn = document.getElementsByClassName('ol-zoom-in')[0];
        zoomIn.click();
        expect(olMap.getView().getZoom()).toBe(12);

        const zoomOut = document.getElementsByClassName('ol-zoom-out')[0];
        zoomOut.click();
        expect(olMap.getView().getZoom()).toBe(11);
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
            expect(spy.calls.length).toEqual(1);
            expect(spy.calls[0].arguments.length).toEqual(6);
            expect(normalizeFloat(spy.calls[0].arguments[0].y, 1)).toBe(43.9);
            expect(normalizeFloat(spy.calls[0].arguments[0].x, 1)).toBe(10.3);
            expect(spy.calls[0].arguments[1]).toBe(12);
            expect(spy.calls[0].arguments[2].bounds).toExist();
            expect(spy.calls[0].arguments[2].crs).toExist();
            expect(spy.calls[0].arguments[3].height).toExist();
            expect(spy.calls[0].arguments[3].width).toExist();
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
            expect(spy.calls.length).toEqual(1);
            expect(spy.calls[0].arguments.length).toEqual(6);
            expect(normalizeFloat(spy.calls[0].arguments[0].y, 1)).toBe(44);
            expect(normalizeFloat(spy.calls[0].arguments[0].x, 1)).toBe(10);
            expect(spy.calls[0].arguments[1]).toBe(11);
            expect(spy.calls[0].arguments[2].bounds).toExist();
            expect(spy.calls[0].arguments[2].crs).toExist();
            expect(spy.calls[0].arguments[3].height).toExist();
            expect(spy.calls[0].arguments[3].width).toExist();
            done();
        });
    });

    it('check if the map changes when receive new props', () => {
        const map = ReactDOM.render(
            <OpenlayersMap
                center={{y: 43.9, x: 10.3}}
                zoom={11}
                measurement={{}}
            />
        , document.getElementById("map"));

        const olMap = map.map;

        map.setProps({zoom: 12, center: {y: 44, x: 10}});
        expect(olMap.getView().getZoom()).toBe(12);
        let center = map.normalizeCenter(olMap.getView().getCenter());
        expect(center[1].toFixed(1)).toBe('44.0');
        expect(center[0].toFixed(1)).toBe('10.0');
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
});
