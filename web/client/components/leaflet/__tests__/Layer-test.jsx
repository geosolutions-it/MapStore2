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

    it('creates a osm layer for leaflet map', () => {
        var options = {};
        // create layers
        var layer = React.render(
            <LeafLetLayer type="osm"
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
            <LeafLetLayer type="osm"
                 options={options} map={map}/>, document.body);
        var lcount = 0;
        expect(layer).toExist();
        // count layers
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(1);
    });
    it('creates a wms layer for leaflet map', () => {
        var options = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "url": "http://demo.geo-solutions.it/geoserver/wms"
        };
        // create layers
        var layer = React.render(
            <LeafLetLayer type="wms"
                 options={options} map={map}/>, document.body);
        var lcount = 0;

        expect(layer).toExist();
        // count layers
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(1);
    });
});
