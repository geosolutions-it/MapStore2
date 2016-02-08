/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react/addons');
var ReactDOM = require('react-dom');
var CesiumLayer = require('../Layer.jsx');
var expect = require('expect');
var Cesium = require('../../../../libs/cesium');

require('../../../../utils/cesium/Layers');
require('../plugins/OSMLayer');
require('../plugins/WMSLayer');
require('../plugins/BingLayer');
require('../plugins/GraticuleLayer');

window.CESIUM_BASE_URL = "web/client/libs/Cesium/Build/Cesium";

describe('Cesium layer', () => {
    let map;

    beforeEach((done) => {
        document.body.innerHTML = '<div id="map"></div><div id="container"></div><div id="container2"></div>';
        map = new Cesium.Viewer("map");
        map.imageryLayers.removeAll();
        setTimeout(done);
    });

    afterEach((done) => {
        /*eslint-disable */
        try {
            ReactDOM.unmountComponentAtNode(document.getElementById("map"));
            ReactDOM.unmountComponentAtNode(document.getElementById("container"));
            ReactDOM.unmountComponentAtNode(document.getElementById("container2"));
        } catch(e) {}
        /*eslint-enable */
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('missing layer', () => {
        var source = {
            "P_TYPE": "wrong ptype key"
        };
        // create layers
        var layer = ReactDOM.render(
            <CesiumLayer source={source}
                  map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.imageryLayers.length).toBe(0);
    });

    it('creates a unknown source layer', () => {
        var options = {
            "name": "FAKE"
        };
        var source = {
            "ptype": "FAKE",
            "url": "http://demo.geo-solutions.it/geoserver/wms"
        };
        // create layers
        var layer = ReactDOM.render(
            <CesiumLayer source={source}
                 options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.imageryLayers.length).toBe(0);
    });

    it('creates source with missing ptype', () => {
        var options = {
            "name": "FAKE"
        };
        var source = {
            "P_TYPE": "wrong ptype key"
        };
        // create layers
        var layer = ReactDOM.render(
            <CesiumLayer source={source}
                 options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.imageryLayers.length).toBe(0);
    });

    it('creates a osm layer for cesium map', () => {
        var options = {};
        // create layers
        var layer = ReactDOM.render(
            <CesiumLayer type="osm"
                 options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.imageryLayers.length).toBe(1);
    });

    it('creates a osm layer for cesium map', () => {
        var options = {
            "source": "osm",
            "title": "Open Street Map",
            "name": "mapnik",
            "group": "background"
        };
        // create layer
        var layer = ReactDOM.render(
            <CesiumLayer type="osm"
                 options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.imageryLayers.length).toBe(1);
    });

    it('creates a wms layer for CesiumLayer map', () => {
        var options = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "url": "http://demo.geo-solutions.it/geoserver/wms"
        };
        // create layers
        var layer = ReactDOM.render(
            <CesiumLayer type="wms"
                 options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.imageryLayers.length).toBe(1);
        expect(map.imageryLayers._layers[0]._imageryProvider._url).toBe('{s}');
        expect(map.imageryLayers._layers[0]._imageryProvider._tileProvider._subdomains.length).toBe(1);
    });

    it('creates a wms layer with multiple urls for CesiumLayer map', () => {
        var options = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "url": ["http://demo.geo-solutions.it/geoserver/wms", "http://demo.geo-solutions.it/geoserver/wms"]
        };
        // create layers
        var layer = ReactDOM.render(
            <CesiumLayer type="wms"
                 options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.imageryLayers.length).toBe(1);
        expect(map.imageryLayers._layers[0]._imageryProvider._url).toBe('{s}');
        expect(map.imageryLayers._layers[0]._imageryProvider._tileProvider._subdomains.length).toBe(2);
    });

    it('creates a bing layer for leaflet map', () => {
        var options = {
            "type": "bing",
            "title": "Bing Aerial",
            "name": "Aerial",
            "group": "background"
        };
        // create layers
        var layer = ReactDOM.render(
            <CesiumLayer type="bing" options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.imageryLayers.length).toBe(1);
    });

    it('switch osm layer visibility', () => {
        var options = {};
        // create layers
        var layer = ReactDOM.render(
            <CesiumLayer type="osm"
                 options={{options}} position={0} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.imageryLayers.length).toBe(1);
        // not visibile layers are removed from the leaflet maps
        layer.setProps({options: {visibility: false}, position: 0});
        expect(map.imageryLayers.length).toBe(0);
        layer.setProps({options: {visibility: true}, position: 0});
        expect(map.imageryLayers.length).toBe(1);
    });

    it('changes wms layer opacity', () => {
        var options = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "opacity": 1.0,
            "url": "http://demo.geo-solutions.it/geoserver/wms"
        };
        // create layers
        var layer = ReactDOM.render(
            <CesiumLayer type="wms"
                 options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.imageryLayers.length).toBe(1);

        expect(layer.provider.alpha).toBe(1.0);

        layer.setProps({options: {opacity: 0.5}, position: 0});
        expect(layer.provider.alpha).toBe(0.5);
    });

    it('respects layer ordering', () => {
        var options1 = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample1",
            "group": "Meteo",
            "format": "image/png",
            "opacity": 1.0,
            "url": "http://demo.geo-solutions.it/geoserver/wms"
        };
        var options2 = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample2",
            "group": "Meteo",
            "format": "image/png",
            "opacity": 1.0,
            "url": "http://demo.geo-solutions.it/geoserver/wms"
        };
        // create layers
        const layer1 = ReactDOM.render(
            <CesiumLayer type="wms"
             options={options1} map={map} position={1}/>
                , document.getElementById("container"));

        expect(layer1).toExist();
        expect(map.imageryLayers.length).toBe(1);

        const layer2 = ReactDOM.render(
            <CesiumLayer type="wms"
             options={options2} map={map} position={2}/>
         , document.getElementById("container2"));

        expect(layer2).toExist();
        expect(map.imageryLayers.length).toBe(2);


        layer1.setProps({position: 2});
        layer2.setProps({position: 1});

        expect(map.imageryLayers.get(0)).toBe(layer2.provider);
        expect(map.imageryLayers.get(1)).toBe(layer1.provider);
    });

    it('creates a graticule layer for cesium map', () => {
        var options = {
            "visibility": true
        };
        // create layers
        var layer = ReactDOM.render(
            <CesiumLayer type="graticule"
                 options={options} map={map}/>, document.getElementById("container"));


        expect(layer).toExist();
        expect(map.imageryLayers.length).toBe(1);
    });
});
