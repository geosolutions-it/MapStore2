/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var ReactDOM = require('react-dom');
var ol = require('openlayers');
var OpenlayersLayer = require('../Layer.jsx');
var expect = require('expect');
var assign = require('object-assign');
require('../../../../utils/openlayers/Layers');
require('../plugins/OSMLayer');
require('../plugins/WMSLayer');
require('../plugins/WMTSLayer');
require('../plugins/GoogleLayer');
require('../plugins/BingLayer');
require('../plugins/MapQuest');
require('../plugins/VectorLayer');
require('../plugins/GraticuleLayer');
require('../plugins/OverlayLayer');

const SecurityUtils = require('../../../../utils/SecurityUtils');
const ConfigUtils = require('../../../../utils/ConfigUtils');

describe('Openlayers layer', () => {
    document.body.innerHTML = '<div id="map"></div>';
    let map;

    beforeEach(() => {
        document.body.innerHTML = '<div id="map"></div><div id="container"></div>';
        map = new ol.Map({
            layers: [
            ],
            controls: ol.control.defaults({
                attributionOptions: /** @type {olx.control.AttributionOptions} */ {
                    collapsible: false
                }
            }),
            target: 'map',
            view: new ol.View({
                center: [0, 0],
                zoom: 5
            })
        });
    });

    afterEach(() => {
        map.setTarget(null);
        document.body.innerHTML = '';
    });

    it('missing layer', () => {
        var source = {
            "P_TYPE": "wrong ptype key"
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer source={source}
                  map={map}/>, document.getElementById("container"));

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
            "url": "http://sample.server/geoserver/wms"
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer source={source}
                 options={options} map={map}/>, document.getElementById("container"));

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
        var layer = ReactDOM.render(
            <OpenlayersLayer source={source}
                 options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(0);
    });
    it('creates a osm layer for openlayers map', () => {
        var options = {};
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="osm"
                 options={options} map={map}/>, document.getElementById("container"));

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
        var layer = ReactDOM.render(
            <OpenlayersLayer type="osm"
                 options={options} map={map}/>, document.getElementById("container"));

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
            "url": "http://sample.server/geoserver/wms"
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="wms"
                 options={options} map={map}/>, document.getElementById("container"));


        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
        expect(map.getLayers().item(0).getSource().urls.length).toBe(1);
    });

    it('creates a wms elevation layer for openlayers map', () => {
        var options = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "application/bil16",
            "useForElevation": true,
            "url": "http://sample.server/geoserver/wms"
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="wms"
                options={options} map={map} />, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
        expect(map.getLayers().item(0).get('getElevation')).toExist();
    });

    it('creates a single tile wms layer for openlayers map', () => {
        var options = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "singleTile": true,
            "url": "http://sample.server/geoserver/wms"
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="wms"
                options={options} map={map} />, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
        expect(map.getLayers().item(0).getSource().getUrl()).toExist();
    });

    it('creates a single tile wms layer for openlayers map ratio', (done) => {
        var options = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "singleTile": true,
            "url": "http://sample.server/geoserver/wms"
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="wms"
                options={options} map={map} />, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
        expect(map.getLayers().item(0).getSource().getUrl()).toExist();
        let width = 0;
        const loadFun = (image, src) => {
            if (width === 0) {
                width = parseInt(src.match(/WIDTH=([0-9]+)/i)[1], 10);
                layer = ReactDOM.render(
                    <OpenlayersLayer type="wms"
                        options={assign({}, options, {
                            ratio: 2
                        })} map={map} />, document.getElementById("container"));
                map.getLayers().item(0).getSource().setImageLoadFunction(loadFun);
                map.getLayers().item(0).getSource().refresh();
            } else {
                const oldWidth = width;
                width = parseInt(src.match(/WIDTH=([0-9]+)/i)[1], 10);
                expect(oldWidth !== width).toBe(true);
                done();
            }
        };
        map.getLayers().item(0).getSource().setImageLoadFunction(loadFun);
        map.getLayers().item(0).getSource().refresh();
    });

    it('creates a wmts layer for openlayers map', () => {
        var options = {
            "type": "wmts",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "tileMatrixSet": [
                {
                    "TileMatrix": [],
                    "ows:Identifier": "EPSG:900913",
                    "ows:SupportedCRS": "urn:ogc:def:crs:EPSG::900913"
                }
            ],
            "url": "http://sample.server/geoserver/gwc/service/wmts"
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="wmts"
                 options={options} map={map}/>, document.getElementById("container"));


        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
        expect(map.getLayers().item(0).getSource().urls.length).toBe(1);
    });

    it('test wmts max and min resolutions', () => {
        var options = {
            "type": "wmts",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "matrixIds": {
                'EPSG:900913': [
                    {
                        identifier: "EPSG:900913:0",
                        ranges: {
                            cols: {min: "0", max: "0"},
                            rows: {min: "0", max: "0"}
                        }

                    },
                    {
                        identifier: "EPSG:900913:1",
                        ranges: {
                            cols: {min: "0", max: "1"},
                            rows: {min: "0", max: "1"}
                        }

                    },
                    {
                        identifier: "EPSG:900913:2",
                        ranges: {
                            cols: {min: "0", max: "3"},
                            rows: {min: "1", max: "2"}
                        }

                    }
                ]

            },

            "tileMatrixSet": [
                {
                    "TileMatrix": [
                        {
                            "MatrixHeight": "1",
                            "MatrixWidth": "1",
                            "ScaleDenominator": "5.590822639508929E8",
                            "TileHeight": "256",
                            "TileWidth": "256",
                            "TopLeftCorner": "-2.003750834E7 2.0037508E7",
                            "ows:Identifier": "EPSG:900913:0"
                        },
                        {
                            "MatrixHeight": "2",
                            "MatrixWidth": "2",
                            "ScaleDenominator": "2.7954113197544646E8",
                            "TileHeight": "256",
                            "TileWidth": "256",
                            "TopLeftCorner": "-2.003750834E7 2.0037508E7",
                            "ows:Identifier": "EPSG:900913:1"
                        },
                        {
                            "MatrixHeight": "4",
                            "MatrixWidth": "4",
                            "ScaleDenominator": "1.3977056598772323E8",
                            "TileHeight": "256",
                            "TileWidth": "256",
                            "TopLeftCorner": "-2.003750834E7 2.0037508E7",
                            "ows:Identifier": "EPSG:900913:2"
                        }
                    ],
                    "ows:Identifier": "EPSG:900913",
                    "ows:SupportedCRS": "urn:ogc:def:crs:EPSG:900913"
                }
            ],
            "url": "http://sample.server/geoserver/gwc/service/wmts"
        };
        // create layers
        const layer = ReactDOM.render(
            <OpenlayersLayer type="wmts"
                 options={options} map={map}/>, document.getElementById("container"));


        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);

        const wmtsLayer = map.getLayers().item(0);
        expect(Math.round(wmtsLayer.getMinResolution())).toBe(39136);
        expect(Math.round(wmtsLayer.getMaxResolution())).toBe(156543);
    });

    it('creates a wmts layer with multiple urls for openlayers map', () => {
        var options = {
            "type": "wmts",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "tileMatrixSet": [
                {
                    "TileMatrix": [],
                    "ows:Identifier": "EPSG:900913",
                    "ows:SupportedCRS": "urn:ogc:def:crs:EPSG::900913"
                }
            ],
            "url": ["http://sample.server/geoserver/gwc/service/wmts", "http://sample.server/geoserver/gwc/service/wmts"]
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="wmts"
                 options={options} map={map}/>, document.getElementById("container"));


        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
        expect(map.getLayers().item(0).getSource().urls.length).toBe(2);
    });

    it('creates a wms layer for openlayers map with custom tileSize', () => {
        var options = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "tileSize": 512,
            "url": "http://sample.server/geoserver/wms"
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="wms"
                 options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
        expect(map.getLayers().item(0).getProperties().source.getTileGrid().getTileSize()).toBe(512);
    });

    it('creates a wms layer with multiple urls for openlayers map', () => {
        var options = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "url": ["http://sample.server/geoserver/wms", "http://sample.server/geoserver/wms"]
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="wms"
                 options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
        expect(map.getLayers().item(0).getSource().urls.length).toBe(2);
    });

    it('creates a wms layer with custom origin', () => {
        var options = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "origin": [0, 0],
            "url": ["http://sample.server/geoserver/wms"]
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="wms"
                 options={options} map={map}/>, document.getElementById("container"));


        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
        expect(map.getLayers().item(0).getSource().getTileGrid().getOrigin()).toEqual([0, 0]);
    });

    it('creates a wms layer with proxy  for openlayers map', () => {
        var options = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "forceProxy": true,
            "url": ["http://sample.server/geoserver/wms", "http://sample.server/geoserver/wms"]
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="wms"
                 options={options} map={map}/>, document.getElementById("container"));


        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
        expect(map.getLayers().item(0).getSource().urls.length).toBe(2);
    });

    it('creates a graticule layer for openlayers map', () => {
        var options = {
            "visibility": true
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="graticule"
                 options={options} map={map}/>, document.getElementById("container"));


        expect(layer).toExist();
        expect(layer.layer).toExist();

        expect(layer.layer.detached).toBe(true);

        layer.layer.remove();
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
        let layer = ReactDOM.render(
            <OpenlayersLayer type="google" options={options} map={map} mapId="map"/>, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        // google maps does not create a real ol layer, it is just injecting a gmaps api layer into DOM
        expect(map.getLayers().getLength()).toBe(0);
    });

    it('creates and overlay layer for openlayers map', () => {
        let container = document.createElement('div');
        container.id = 'ovcontainer';
        document.body.appendChild(container);

        let element = document.createElement('div');
        element.id = 'overlay-1';
        document.body.appendChild(element);

        let options = {
            id: 'overlay-1',
            position: [13, 43]
        };
        // create layers
        let layer = ReactDOM.render(
            <OpenlayersLayer type="overlay"
                 options={options} map={map}/>, document.getElementById('ovcontainer'));

        expect(layer).toExist();

        expect(document.getElementById('overlay-1-overlay')).toExist();
    });

    it('creates and overlay layer for openlayers map with close support', () => {
        let container = document.createElement('div');
        container.id = 'ovcontainer';
        document.body.appendChild(container);

        let element = document.createElement('div');
        element.id = 'overlay-1';
        let closeElement = document.createElement('div');
        closeElement.className = 'close';
        element.appendChild(closeElement);
        document.body.appendChild(element);
        let closed = false;
        let options = {
            id: 'overlay-1',
            position: [13, 43],
            onClose: () => {
                closed = true;
            }
        };
        // create layers
        let layer = ReactDOM.render(
            <OpenlayersLayer type="overlay"
                 options={options} map={map}/>, document.getElementById('ovcontainer'));

        expect(layer).toExist();
        const overlayElement = document.getElementById('overlay-1-overlay');
        expect(overlayElement).toExist();
        const close = overlayElement.getElementsByClassName('close')[0];
        close.click();
        expect(closed).toBe(true);
    });

    it('creates and overlay layer for openlayers map with onLink support', () => {
        let container = document.createElement('div');
        container.id = 'ovcontainer';
        document.body.appendChild(container);

        let element = document.createElement('div');
        element.id = 'overlay-1';
        let linkElement = document.createElement('a');
        linkElement.className = 'link';
        element.appendChild(linkElement);
        document.body.appendChild(element);
        let clicked = false;
        let options = {
            id: 'overlay-1',
            position: [13, 43],
            onLink: () => {
                clicked = true;
            }
        };
        // create layers
        let layer = ReactDOM.render(
            <OpenlayersLayer type="overlay"
                options={options} map={map} />, document.getElementById('ovcontainer'));

        expect(layer).toExist();
        const overlayElement = document.getElementById('overlay-1-overlay');
        expect(overlayElement).toExist();
        const link = overlayElement.getElementsByClassName('link')[0];
        link.click();
        expect(clicked).toBe(true);
    });

    it('creates and overlay layer for openlayers map with no data-reactid attributes', () => {
        let container = document.createElement('div');
        container.id = 'ovcontainer';
        document.body.appendChild(container);

        let element = document.createElement('div');
        element.id = 'overlay-1';
        let closeElement = document.createElement('div');
        closeElement.className = 'close';
        element.appendChild(closeElement);
        document.body.appendChild(element);
        let options = {
            id: 'overlay-1',
            position: [13, 43]
        };
        // create layers
        let layer = ReactDOM.render(
            <OpenlayersLayer type="overlay"
                 options={options} map={map}/>, document.getElementById('ovcontainer'));

        expect(layer).toExist();
        const overlayElement = document.getElementById('overlay-1-overlay');
        expect(overlayElement.getAttribute('data-reactid')).toNotExist();
        const close = overlayElement.getElementsByClassName('close')[0];
        expect(close.getAttribute('data-reactid')).toNotExist();
    });

    it('creates a vector layer for openlayers map', () => {
        var options = {
            crs: 'EPSG:4326',
            features: {
                'type': 'FeatureCollection',
                'crs': {
                    'type': 'name',
                    'properties': {
                        'name': 'EPSG:4326'
                    }
                },
                'features': [
                    {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Polygon',
                            'coordinates': [[
                              [13, 43],
                              [15, 43],
                              [15, 44],
                              [13, 44]
                            ]]
                        }
                    }
                ]
            }
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="vector"
                 options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
    });

    it('creates a vector layer specifying the feature CRS for openlayers map', () => {
        var options = {
            crs: 'EPSG:4326',
            features: {
                'type': 'FeatureCollection',
                'crs': {
                    'type': 'name',
                    'properties': {
                        'name': 'EPSG:4326'
                    }
                },
                'featureCrs': 'EPSG:3857',
                'features': [
                    {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Polygon',
                            'coordinates': [[
                              [1447153.3803125600, 5311971.8469454700],
                              [1669792.3618991000, 5311971.8469454700],
                              [1669792.3618991000, 5465442.1833227500],
                              [1447153.3803125600, 5465442.1833227500]
                            ]]
                        }
                    }
                ]
            }
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="vector"
                 options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
    });

    it('creates a vector layer with a given marker style', () => {
        var options = {
            styleName: "marker",
            style: {
                iconUrl: "test",
                shadowUrl: "test"
            },
            crs: 'EPSG:4326',
            features: {
                'type': 'FeatureCollection',
                'crs': {
                    'type': 'name',
                    'properties': {
                        'name': 'EPSG:4326'
                    }
                },
                'features': [
                    {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [13, 44]
                        }
                    },
                    {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Polygon',
                            'coordinates': [[
                              [13, 43],
                              [15, 43],
                              [15, 44],
                              [13, 44]
                            ]]
                        }
                    }
                ]
            }
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="vector"
                 options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
    });

    it('creates a vector layer with a given point style', () => {
        var options = {
            style: {
                type: "Point",
                stroke: {
                    color: "blue",
                    width: 1
                },
                fill: {
                    color: "blue"
                },
                radius: 4
            },
            crs: 'EPSG:4326',
            features: {
                'type': 'FeatureCollection',
                'crs': {
                    'type': 'name',
                    'properties': {
                        'name': 'EPSG:4326'
                    }
                },
                'features': [
                    {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [13, 44]
                        }
                    }
                ]
            }
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="vector"
                 options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
    });

    it('vector layer with a given polygon style', () => {
        var options = {
            styleName: "Polygon",
            crs: 'EPSG:4326',
            features: {
                'type': 'FeatureCollection',
                'crs': {
                    'type': 'name',
                    'properties': {
                        'name': 'EPSG:4326'
                    }
                },
                'features': [
                    {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Polygon',
                            'coordinates': [[
                              [13, 43],
                              [15, 43],
                              [15, 44],
                              [13, 44]
                            ]]
                        }
                    }
                ]
            }
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="vector"
                 options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
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
        let layer = ReactDOM.render(
            <OpenlayersLayer type="google" options={options} map={map} mapId="map"/>, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        // google maps does not create a real ol layer, it is just injecting a gmaps api layer into DOM
        expect(map.getLayers().getLength()).toBe(0);
        let div = document.getElementById("mapgmaps");
        expect(div).toExist();

        // if only one layer for google exists, the div will be hidden
        let newOpts = assign({}, options, {visibility: false});
        layer = ReactDOM.render(
            <OpenlayersLayer type="google" options={newOpts} map={map} mapId="map"/>, document.getElementById("container"));
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
        let layer = ReactDOM.render(
            <OpenlayersLayer type="google" options={options} map={map} mapId="map"/>, document.getElementById("container"));

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
        var layer = ReactDOM.render(
            <OpenlayersLayer type="bing" options={options} map={map}/>, document.getElementById("container"));

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
        var layer = ReactDOM.render(
            <OpenlayersLayer type="bing" options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(layer.layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.getVisible()).toBe(true);
        layer = ReactDOM.render(
            <OpenlayersLayer type="bing" options={{
                "type": "bing",
                "title": "Bing Aerial",
                "name": "Aerial",
                "group": "background",
                "visibility": true
            }} map={map}/>, document.getElementById("container"));
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.getVisible()).toBe(true);
        layer = ReactDOM.render(
            <OpenlayersLayer type="bing" options={{
                "type": "bing",
                "title": "Bing Aerial",
                "name": "Aerial",
                "group": "background",
                "visibility": false
            }} map={map}/>, document.getElementById("container"));
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
        var layer = ReactDOM.render(
            <OpenlayersLayer type="mapquest" options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        // MapQuest is not supported on Openlayers
        expect(map.getLayers().getLength()).toBe(0);
    });

    it('changes wms layer opacity', () => {
        var options = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "opacity": 1.0,
            "url": "http://sample.server/geoserver/wms"
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="wms"
                 options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);

        expect(layer.layer.getOpacity()).toBe(1.0);

        layer = ReactDOM.render(
            <OpenlayersLayer type="wms"
                 options={assign({}, options, {opacity: 0.5})} map={map}/>, document.getElementById("container"));

        expect(layer.layer.getOpacity()).toBe(0.5);
    });

    it('respects layer ordering', () => {
        var options = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "opacity": 1.0,
            "url": "http://sample.server/geoserver/wms"
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="wms" position={10}
                 options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);

        expect(layer.layer.getZIndex()).toBe(10);

        layer = ReactDOM.render(
            <OpenlayersLayer type="wms" position={2}
                 options={options} map={map}/>, document.getElementById("container"));
        expect(layer.layer.getZIndex()).toBe(2);
    });

    it('changes wms params', () => {
        var options = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "opacity": 1.0,
            "url": "http://sample.server/geoserver/wms",
            "params": {
                "cql_filter": "INCLUDE"
            }
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="wms" observables={["cql_filter"]}
                 options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);

        expect(layer.layer.getSource()).toExist();
        expect(layer.layer.getSource().getParams()).toExist();
        expect(layer.layer.getSource().getParams().cql_filter).toBe("INCLUDE");

        layer = ReactDOM.render(
            <OpenlayersLayer type="wms" observables={["cql_filter"]}
                 options={assign({}, options, {params: {cql_filter: "EXCLUDE"}})} map={map}/>, document.getElementById("container"));
        expect(layer.layer.getSource().getParams().cql_filter).toBe("EXCLUDE");
    });
    it('test wms security token on SLD param', () => {
        const options = {
            type: "wms",
            visibility: true,
            name: "nurc:Arc_Sample",
            group: "Meteo",
            format: "image/png",
            opacity: 1.0,
            url: "http://sample.server/geoserver/wms",
            params: {
                SLD: "http://sample.server/geoserver/rest/sld?test1=aaa"
            }
        };
        ConfigUtils.setConfigProp('useAuthenticationRules', true);
        ConfigUtils.setConfigProp('authenticationRules', [
            {
                urlPattern: '.*geostore.*',
                method: 'bearer'
            }, {
                urlPattern: '\\/geoserver.*',
                authkeyParamName: 'ms2-authkey',
                method: 'authkey'
            }
        ]);

        SecurityUtils.setStore({
            getState: () => ({
                security: {
                    token: "########-####-####-####-###########"
                }
            })
        });
        let layer = ReactDOM.render(<OpenlayersLayer
            type="wms"
            options={options}
            map={map}
            securityToken="########-####-####-####-###########" />, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.getSource()).toExist();
        expect(layer.layer.getSource().getParams()['ms2-authkey']).toBe("########-####-####-####-###########");
        expect(layer.layer.getSource().getParams().SLD).toBe("http://sample.server/geoserver/rest/sld?test1=aaa&ms2-authkey=" + encodeURIComponent("########-####-####-####-###########"));
    });
    it('test wms security token', () => {
        const options = {
            type: "wms",
            visibility: true,
            name: "nurc:Arc_Sample",
            group: "Meteo",
            format: "image/png",
            opacity: 1.0,
            url: "http://sample.server/geoserver/wms"
        };
        ConfigUtils.setConfigProp('useAuthenticationRules', true);
        ConfigUtils.setConfigProp('authenticationRules', [
            {
                urlPattern: '.*geostore.*',
                method: 'bearer'
            }, {
                urlPattern: '\\/geoserver.*',
                authkeyParamName: 'ms2-authkey',
                method: 'authkey'
            }
        ]);

        SecurityUtils.setStore({
            getState: () => ({
                security: {
                    token: "########-####-####-####-###########"
                }
            })
        });
        let layer = ReactDOM.render(<OpenlayersLayer
            type="wms"
            options={options}
            map={map}
            securityToken="########-####-####-####-###########"/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.getSource()).toExist();
        expect(layer.layer.getSource().getParams()['ms2-authkey']).toBe("########-####-####-####-###########");

        layer = ReactDOM.render(<OpenlayersLayer
            type="wms"
            options={options}
            map={map}
            securityToken=""/>, document.getElementById("container"));
        expect(layer.layer.getSource().getParams()['ms2-authkey']).toBe(undefined);

        layer = ReactDOM.render(<OpenlayersLayer
            type="wms"
            options={options}
            map={map}
            securityToken="########-####-$$$$-####-###########"/>, document.getElementById("container"));

        expect(layer.layer.getSource().getParams()['ms2-authkey']).toBe("########-####-$$$$-####-###########");
    });

    it('test wmts initial visibility false', () => {
        const options = {
            type: 'wmts',
            visibility: false,
            name: 'nurc:Arc_Sample',
            group: 'Meteo',
            format: 'image/png',
            tileMatrixSet: [
                {
                    'TileMatrix': [],
                    'ows:Identifier': 'EPSG:900913',
                    'ows:SupportedCRS': 'urn:ogc:def:crs:EPSG::900913'
                }
            ],
            url: 'http://sample.server/geoserver/gwc/service/wmts'
        };

        const layer = ReactDOM.render(<OpenlayersLayer
            type="wmts"
            options={options}
            map={map}
             />, document.getElementById("container"));
        expect(layer.layer.getVisible()).toBe(false);
    });

    it('test wmts initial visibility true', () => {
        const options = {
            type: 'wmts',
            visibility: true,
            name: 'nurc:Arc_Sample',
            group: 'Meteo',
            format: 'image/png',
            tileMatrixSet: [
                {
                    'TileMatrix': [],
                    'ows:Identifier': 'EPSG:900913',
                    'ows:SupportedCRS': 'urn:ogc:def:crs:EPSG::900913'
                }
            ],
            url: 'http://sample.server/geoserver/gwc/service/wmts'
        };

        const layer = ReactDOM.render(<OpenlayersLayer
            type="wmts"
            options={options}
            map={map}
        />, document.getElementById("container"));
        expect(layer.layer.getVisible()).toBe(true);
    });

    it('test wmts security token', () => {
        const options = {
            type: 'wmts',
            visibility: true,
            name: 'nurc:Arc_Sample',
            group: 'Meteo',
            format: 'image/png',
            tileMatrixSet: [
                {
                    'TileMatrix': [],
                    'ows:Identifier': 'EPSG:900913',
                    'ows:SupportedCRS': 'urn:ogc:def:crs:EPSG::900913'
                }
            ],
            url: 'http://sample.server/geoserver/gwc/service/wmts'
        };
        ConfigUtils.setConfigProp('useAuthenticationRules', true);
        ConfigUtils.setConfigProp('authenticationRules', [
            {
                urlPattern: '.*geostore.*',
                method: 'bearer'
            }, {
                urlPattern: '\\/geoserver.*',
                authkeyParamName: 'ms2-authkey',
                method: 'authkey'
            }
        ]);

        SecurityUtils.setStore({
            getState: () => ({
                security: {
                    token: "########-####-####-####-###########"
                }
            })
        });
        let layer = ReactDOM.render(<OpenlayersLayer
            type="wmts"
            options={options}
            map={map}
            securityToken="########-####-####-####-###########"/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.getSource().getUrls().map(u => decodeURIComponent(u))).toEqual(["http://sample.server/geoserver/gwc/service/wmts?ms2-authkey=########-####-####-####-###########"]);

        layer = ReactDOM.render(<OpenlayersLayer
            type="wmts"
            options={options}
            map={map}
            securityToken=""/>, document.getElementById("container"));
        expect(layer).toExist();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.getSource().getUrls().map(u => decodeURIComponent(u))).toEqual(["http://sample.server/geoserver/gwc/service/wmts"]);


        layer = ReactDOM.render(<OpenlayersLayer
            type="wmts"
            options={options}
            map={map}
            securityToken="########-####-$$$$-####-###########"/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.getSource().getUrls().map(u => decodeURIComponent(u))).toEqual(["http://sample.server/geoserver/gwc/service/wmts?ms2-authkey=########-####-$$$$-####-###########"]);


    });
    it('test cql_filter param to be passed to the layer object', () => {
        const options = {
            type: "wms",
            visibility: true,
            name: "nurc:Arc_Sample",
            group: "Meteo",
            format: "image/png",
            opacity: 1.0,
            url: "http://sample.server/geoserver/wms",
            params: {
                CQL_FILTER: "prop = 'value'"
            }
        };

        let layer = ReactDOM.render(<OpenlayersLayer
            type="wms"
            options={options}
            map={map}
        />, document.getElementById("container"));

        expect(layer).toExist();
        expect(layer.layer.getSource().getParams().CQL_FILTER).toBe("prop = 'value'");
    });
    it('test filterObj param to be transformed in cql_filter', () => {
        const options = {
            type: "wms",
            visibility: true,
            name: "nurc:Arc_Sample",
            group: "Meteo",
            format: "image/png",
            opacity: 1.0,
            url: "http://sample.server/geoserver/wms",
            filterObj: {
                filterFields: [
                    {
                        groupId: 1,
                        attribute: "prop2",
                        exception: null,
                        operator: "=",
                        rowId: "3",
                        type: "number",
                        value: "value2"
                    }],
                groupFields: [{
                    id: 1,
                    index: 0,
                    logic: "OR"
                }]
            }
        };

        let layer = ReactDOM.render(<OpenlayersLayer
            type="wms"
            options={options}
            map={map}
        />, document.getElementById("container"));

        expect(layer).toExist();

        expect(layer.layer.getSource().getParams().CQL_FILTER).toBe("(\"prop2\" = 'value2')");
    });
    it('test reset of cql_filter (after filterObj gets removed)', () => {
        const options = {
            type: "wms",
            visibility: true,
            name: "nurc:Arc_Sample",
            group: "Meteo",
            format: "image/png",
            opacity: 1.0,
            url: "http://sample.server/geoserver/wms",
            filterObj: {
                filterFields: [
                    {
                        groupId: 1,
                        attribute: "prop2",
                        exception: null,
                        operator: "=",
                        rowId: "3",
                        type: "number",
                        value: "value2"
                    }],
                groupFields: [{
                    id: 1,
                    index: 0,
                    logic: "OR"
                }]
            }
        };
        let layer = ReactDOM.render(<OpenlayersLayer
            type="wms"
            options={options}
            map={map}
        />, document.getElementById("container"));
        expect(layer).toExist();
        expect(layer.layer.getSource().getParams().CQL_FILTER).toBe("(\"prop2\" = 'value2')");
        layer = ReactDOM.render(<OpenlayersLayer
            type="wms"
            options={{...options, filterObj: undefined}}
            map={map}
        />, document.getElementById("container"));
        expect(layer).toExist();
        expect(layer.layer.getSource().getParams().CQL_FILTER).toBe(undefined);
    });

    it('test filterObj and cql_filter combination (featuregrid active filter use this combination)', () => {
        const options = {
            type: "wms",
            visibility: true,
            name: "nurc:Arc_Sample",
            group: "Meteo",
            format: "image/png",
            opacity: 1.0,
            url: "http://sample.server/geoserver/wms",
            params: {
                CQL_FILTER: "prop = 'value'"
            },
            filterObj: {
                filterFields: [
                    {
                        groupId: 1,
                        attribute: "prop2",
                        exception: null,
                        operator: "=",
                        rowId: "3",
                        type: "number",
                        value: "value2"
                    }],
                groupFields: [{
                    id: 1,
                    index: 0,
                    logic: "OR"
                }]
            }
        };

        let layer = ReactDOM.render(<OpenlayersLayer
            type="wms"
            options={options}
            map={map}
        />, document.getElementById("container"));

        expect(layer).toExist();

        expect(layer.layer.getSource().getParams().CQL_FILTER).toBe("((\"prop2\" = 'value2')) AND (prop = 'value')");
    });
});
