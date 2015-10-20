/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react/addons');
var ol = require('openlayers');
var OpenlayersLayer = require('../Layer.jsx');
var expect = require('expect');
var assign = require('object-assign');
require('../../../../utils/openlayers/Layers');
require('../plugins/OSMLayer');
require('../plugins/WMSLayer');
require('../plugins/GoogleLayer');
require('../plugins/BingLayer');
require('../plugins/MapQuest');

describe('Openlayers layer', () => {
    document.body.innerHTML = '<div id="map"></div>';
    let map = new ol.Map({
      layers: [
      ],
      controls: ol.control.defaults({
        attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
          collapsible: false
        })
      }),
      target: 'map',
      view: new ol.View({
        center: [0, 0],
        zoom: 5
      })
    });


    afterEach((done) => {
        document.body.innerHTML = '<div id="map"></div>';
        map = new ol.Map({
          layers: [
          ],
          controls: ol.control.defaults({
            attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
              collapsible: false
            })
          }),
          target: 'map',
          view: new ol.View({
            center: [0, 0],
            zoom: 5
          })
        });
        setTimeout(done);
    });

    it('missing layer', () => {
        var source = {
            "P_TYPE": "wrong ptype key"
        };
        // create layers
        var layer = React.render(
            <OpenlayersLayer source={source}
                  map={map}/>, document.body);

        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(0);
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
            <OpenlayersLayer source={source}
                 options={options} map={map}/>, document.body);

        expect(layer).toExist();
        // count layers
        // count layers
        expect(map.getLayers().getLength()).toBe(0);
    });

    it('creates source with missing ptype', () => {
        var options = {
            "name": "FAKE"
        };
        var source = {
            "P_TYPE": "wrong ptype key"
        };
        // create layers
        var layer = React.render(
            <OpenlayersLayer source={source}
                 options={options} map={map}/>, document.body);

        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(0);
    });
    it('creates a osm layer for openlayers map', () => {
        var options = {};
        // create layers
        var layer = React.render(
            <OpenlayersLayer type="osm"
                 options={options} map={map}/>, document.body);

        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
    });
    it('creates a osm layer for openlayers map', () => {
        var options = {
            "source": "osm",
            "title": "Open Street Map",
            "name": "mapnik",
            "group": "background"
        };
        // create layer
        var layer = React.render(
            <OpenlayersLayer type="osm"
                 options={options} map={map}/>, document.body);

        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
    });

    it('creates a wms layer for openlayers map', () => {
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
            <OpenlayersLayer type="wms"
                 options={options} map={map}/>, document.body);


        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
    });
    it('creates a google layer for openlayers map', () => {
        var google = {
            maps: {
                MapTypeId: {
                    HYBRID: 'hybrid',
                    SATELLITE: 'satellite',
                    ROADMAP: 'roadmap',
                    TERRAIN: 'terrain'
                },
                Map: function() {
                    this.setMapTypeId = function() {};
                    this.setCenter = function() {};
                    this.setZoom = function() {};
                    this.setTilt = function() {};
                },
                LatLng: function() {

                }
            }
        };
        var options = {
            "type": "google",
            "name": "ROADMAP",
            "visibility": true
        };
        window.google = google;

        // create layers
        let layer = React.render(
            <OpenlayersLayer type="google" options={options} map={map} mapId="map"/>, document.body);

        expect(layer).toExist();
        // count layers
        // google maps does not create a real ol layer, it is just injecting a gmaps api layer into DOM
        expect(map.getLayers().getLength()).toBe(0);
    });

    it('change layer visibility for Google Layer', () => {
        var google = {
            maps: {
                MapTypeId: {
                    HYBRID: 'hybrid',
                    SATELLITE: 'satellite',
                    ROADMAP: 'roadmap',
                    TERRAIN: 'terrain'
                },
                Map: function() {
                    this.setMapTypeId = function() {};
                    this.setCenter = function() {};
                    this.setZoom = function() {};
                    this.setTilt = function() {};
                },
                LatLng: function() {

                }
            }
        };
        var options = {
            "type": "google",
            "name": "ROADMAP",
            "visibility": true
        };
        window.google = google;

        // create layers
        let layer = React.render(
            <OpenlayersLayer type="google" options={options} map={map} mapId="map"/>, document.body);

        expect(layer).toExist();
        // count layers
        // google maps does not create a real ol layer, it is just injecting a gmaps api layer into DOM
        expect(map.getLayers().getLength()).toBe(0);
        let div = document.getElementById("mapgmaps");
        expect(div).toExist();

        // if only one layer for google exists, the div will be hidden
        let newOpts = assign({}, options, {visibility: false});
        layer.setProps({options: newOpts});
        expect(div.style.visibility).toBe('hidden');
    });

    it('rotates google layer when ol map is', () => {
        var google = {
            maps: {
                MapTypeId: {
                    HYBRID: 'hybrid',
                    SATELLITE: 'satellite',
                    ROADMAP: 'roadmap',
                    TERRAIN: 'terrain'
                },
                Map: function() {
                    this.setMapTypeId = function() {};
                    this.setCenter = function() {};
                    this.setZoom = function() {};
                    this.setTilt = function() {};
                },
                LatLng: function() {

                },
                event: {
                    trigger() {}
                }
            }
        };
        var options = {
            "type": "google",
            "name": "ROADMAP",
            "visibility": true
        };
        window.google = google;

        // create layers
        let layer = React.render(
            <OpenlayersLayer type="google" options={options} map={map} mapId="map"/>, document.body);

        expect(layer).toExist();
        map.getView().setRotation(Math.PI / 2.0);

        let viewport = map.getViewport();
        viewport.dispatchEvent(new MouseEvent('mousedown'));
        viewport.dispatchEvent(new MouseEvent('mousemove'));
        viewport.dispatchEvent(new MouseEvent('mouseup'));

        let dom = document.getElementById("mapgmaps");
        expect(dom).toExist();
        expect(dom.style.transform).toBe('rotate(90deg)');
    });

    it('creates a bing layer for openlayers map', () => {
        var options = {
            "type": "bing",
            "title": "Bing Aerial",
            "name": "Aerial",
            "group": "background"
        };
        // create layers
        var layer = React.render(
            <OpenlayersLayer type="bing" options={options} map={map}/>, document.body);

        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
    });

    it('change a bing layer visibility', () => {
        var options = {
            "type": "bing",
            "title": "Bing Aerial",
            "name": "Aerial",
            "group": "background"
        };
        // create layers
        var layer = React.render(
            <OpenlayersLayer type="bing" options={options} map={map}/>, document.body);

        expect(layer).toExist();
        expect(layer.layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.getVisible()).toBe(true);
        layer.setProps({options: assign({}, {
            "type": "bing",
            "title": "Bing Aerial",
            "name": "Aerial",
            "group": "background"
        }, {
            "visibility": true
        })});
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.getVisible()).toBe(true);
        layer.setProps({options: assign({}, {
            "type": "bing",
            "title": "Bing Aerial",
            "name": "Aerial",
            "group": "background"
        }, {
            "visibility": false
        })});
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.getVisible()).toBe(false);

    });

    it('creates a mapquest layer for openlayers map', () => {
        var options = {
            "type": "mapquest",
            "title": "MapQuest",
            "name": "osm",
            "group": "background"
        };
        // create layers
        var layer = React.render(
            <OpenlayersLayer type="mapquest" options={options} map={map}/>, document.body);

        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
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
        var layer = React.render(
            <OpenlayersLayer type="wms"
                 options={options} map={map}/>, document.body);

        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);

        expect(layer.layer.getOpacity()).toBe(1.0);

        layer.setProps({options: {opacity: 0.5}, position: 0});
        expect(layer.layer.getOpacity()).toBe(0.5);
    });
});
