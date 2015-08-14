/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react/addons');
var L = require('leaflet');
var LeafLetLayer = require('../Layer.jsx');
var expect = require('expect');

describe('Leaflet layer', () => {
    document.body.innerHTML = '<div id="map"></div>';
    let map = L.map('map');


    afterEach((done) => {
        document.body.innerHTML = '<div id="map"></div>';
        map = L.map('map');
        setTimeout(done);
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
        var layer = React.render(
            <LeafLetLayer source={source}
                 options={options} map={map}/>, document.body);
        var lcount = 0;

        expect(layer).toExist();
        // count layers
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(0);
    });
    it('creates a osm layer for leaflet map', () => {
        var options = {};
        // create layers
        var layer = React.render(
            <LeafLetLayer source={{ptype: 'gxp_osmsource'}}
                 options={options} map={map}/>, document.body);
        var lcount = 0;
        expect(layer).toExist();
        // count layers
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(1);
    });
    it('creates a osm layer for leaflet map', () => {
        var options = {
            "source": "osm",
            "title": "Open Street Map",
            "name": "mapnik",
            "group": "background"
        };
        // create layer
        var layer = React.render(
            <LeafLetLayer source={{ptype: 'gxp_osmsource'}}
                 options={options} map={map}/>, document.body);
        var lcount = 0;
        expect(layer).toExist();
        // count layers
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(1);
    });

    it('creates a wms layer for leaflet map', () => {
        var options = {
            "source": "demo",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png"
        };
        var source = {
            "ptype": "gxp_wmssource",
            "url": "http://demo.geo-solutions.it/geoserver/wms"
        };
        // create layers
        var layer = React.render(
            <LeafLetLayer source={source}
                 options={options} map={map}/>, document.body);
        var lcount = 0;

        expect(layer).toExist();
        // count layers
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(1);
    });
    it('creates a google layer for leaflet map', () => {
        var options = {
            "source": "demo",
            "name": "ROADMAP"
        };
        var source = {
            "ptype": "gxp_googlesource"
        };
        // create layers
        var layer = React.render(
            <LeafLetLayer source={source}
                 options={options} map={map}/>, document.body);
        var lcount = 0;

        expect(layer).toExist();
        // count layers
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(1);
    });

    it('creates a bing layer for leaflet map', () => {
        var options = {
            "source": "bing",
            "title": "Bing Aerial",
            "name": "Aerial",
            "group": "background"
        };
        var source = {
            "ptype": "gxp_bingsource"
        };
        // create layers
        var layer = React.render(
            <LeafLetLayer source={source}
                 options={options} map={map}/>, document.body);
        var lcount = 0;

        expect(layer).toExist();
        // count layers
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(1);
    });
});
