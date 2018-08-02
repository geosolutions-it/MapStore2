/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const L = require('leaflet');
const React = require('react');
const ReactDOM = require('react-dom');
const LeafLetLayer = require('../Layer.jsx');
const Feature = require('../Feature.jsx');
const expect = require('expect');

const assign = require('object-assign');

require('../../../../utils/leaflet/Layers');
require('../plugins/OSMLayer');
require('../plugins/GraticuleLayer');
require('../plugins/WMSLayer');
require('../plugins/WMTSLayer');
require('../plugins/GoogleLayer');
require('../plugins/BingLayer');
require('../plugins/MapQuest');
require('../plugins/VectorLayer');

const SecurityUtils = require('../../../../utils/SecurityUtils');
const ConfigUtils = require('../../../../utils/ConfigUtils');

describe('Leaflet layer', () => {
    let map;

    beforeEach((done) => {
        document.body.innerHTML = '<div id="map"></div><div id="container"></div>';
        map = L.map('map');
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("map"));
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('missing layer', () => {
        var source = {
            "P_TYPE": "wrong ptype key"
        };
        // create layers
        var layer = ReactDOM.render(
            <LeafLetLayer source={source}
                  map={map}/>, document.getElementById("container"));
        var lcount = 0;

        expect(layer).toExist();
        // count layers
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(0);
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
            <LeafLetLayer source={source}
                 options={options} map={map}/>, document.getElementById("container"));
        var lcount = 0;

        expect(layer).toExist();
        // count layers
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(0);
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
            <LeafLetLayer source={source}
                 options={options} map={map}/>, document.getElementById("container"));
        var lcount = 0;

        expect(layer).toExist();
        // count layers
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(0);
    });
    it('creates a osm layer for leaflet map', () => {
        var options = {};
        // create layers
        var layer = ReactDOM.render(
            <LeafLetLayer type="osm"
                 options={options} map={map}/>, document.getElementById("container"));
        var lcount = 0;
        expect(layer).toExist();
        // count layers
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(1);
    });

    it('creates a graticule layer for leaflet map', () => {
        var options = {};
        // create layers
        var layer = ReactDOM.render(
            <LeafLetLayer type="graticule"
                 options={options} map={map}/>, document.getElementById("container"));
        var lcount = 0;
        expect(layer).toExist();
        // count layers
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(1);
    });

    it('creates a mapquest layer for leaflet map without API key', () => {
        var options = {
            "source": "mapquest",
            "title": "MapQuest OpenStreetMap",
            "name": "osm",
            "group": "background"
        };
        // create layer
        var layer = ReactDOM.render(
            <LeafLetLayer type="mapquest"
                 options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        let lcount = 0;
        map.eachLayer(function() {lcount++; });
        // No API key is defined, no layer should be added.
        expect(lcount).toBe(0);
    });

    it('creates a osm layer for leaflet map', () => {
        var options = {
            "source": "osm",
            "title": "Open Street Map",
            "name": "mapnik",
            "group": "background"
        };
        // create layer
        var layer = ReactDOM.render(
            <LeafLetLayer type="osm"
                 options={options} map={map}/>, document.getElementById("container"));
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
            "url": "http://sample.server/geoserver/wms"
        };
        // create layers
        var layer = ReactDOM.render(
            <LeafLetLayer type="wms"
                 options={options} map={map}/>, document.getElementById("container"));
        var lcount = 0;

        expect(layer).toExist();
        // count layers
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(1);
        let urls;
        map.eachLayer((l) => urls = l._urls);
        expect(urls.length).toBe(1);
    });

    it('creates a wms elevation layer for leaflet map', () => {
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
            <LeafLetLayer type="wms"
                options={options} map={map} />, document.getElementById("container"));
        var lcount = 0;

        expect(layer).toExist();
        // count layers
        map.eachLayer(function() { lcount++; });
        expect(lcount).toBe(1);
        let elevationFunc;
        map.eachLayer((l) => elevationFunc = l.getElevation);
        expect(elevationFunc).toExist();
    });

    it('creates a wmts layer for leaflet map', () => {
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
            <LeafLetLayer type="wmts"
                 options={options} map={map}/>, document.getElementById("container"));
        var lcount = 0;

        expect(layer).toExist();
        // count layers
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(1);
        let urls;
        map.eachLayer((l) => urls = l._urls);
        expect(urls.length).toBe(1);
    });

    it('creates a wmts layer with multiple urls for leaflet map', () => {
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
            <LeafLetLayer type="wmts"
                 options={options} map={map}/>, document.getElementById("container"));
        var lcount = 0;

        expect(layer).toExist();
        // count layers
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(1);
        let urls;
        map.eachLayer((l) => urls = l._urls);
        expect(urls.length).toBe(2);
    });

    it('creates a vector layer for leaflet map', () => {
        var options = {
            "type": "wms",
            "visibility": true,
            "name": "vector_sample",
            "group": "sample",
            "styleName": "marker",
            "features": [
                { "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": [102.0, 0.5]},
                    "properties": {"prop0": "value0"}
                },
                { "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                        [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]
                        ]
                    },
                    "properties": {
                        "prop0": "value0",
                        "prop1": 0.0
                    }
                },
                { "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [
                            [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
                           [100.0, 1.0], [100.0, 0.0] ]
                        ]
                    },
                    "properties": {
                        "prop0": "value0",
                        "prop1": {"this": "that"}
                    }
                },
                { "type": "Feature",
                    "geometry": { "type": "MultiPoint",
                        "coordinates": [ [100.0, 0.0], [101.0, 1.0] ]
                    },
                    "properties": {
                        "prop0": "value0",
                        "prop1": {"this": "that"}
                    }
                },
                { "type": "Feature",
                    "geometry": { "type": "MultiLineString",
                        "coordinates": [
                            [ [100.0, 0.0], [101.0, 1.0] ],
                            [ [102.0, 2.0], [103.0, 3.0] ]
                        ]
                    },
                    "properties": {
                        "prop0": "value0",
                        "prop1": {"this": "that"}
                    }
                },
                { "type": "Feature",
                    "geometry": { "type": "MultiPolygon",
                        "coordinates": [
                          [[[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]],
                            [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
                           [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]]
                        ]
                    },
                    "properties": {
                        "prop0": "value0",
                        "prop1": {"this": "that"}
                    }
                },
                { "type": "Feature",
                    "geometry": { "type": "GeometryCollection",
                        "geometries": [
                            { "type": "Point",
                                "coordinates": [100.0, 0.0]
                            },
                            { "type": "LineString",
                                "coordinates": [ [101.0, 0.0], [102.0, 1.0] ]
                            }
                        ]
                    },
                    "properties": {
                        "prop0": "value0",
                        "prop1": {"this": "that"}
                    }
                }
            ]
        };
        // create layers
        var layer = ReactDOM.render(
            <LeafLetLayer type="vector"
                 options={options} map={map}>
                {options.features.map((feature) => <Feature
                    key={feature.id}
                    type={feature.type}
                    geometry={feature.geometry}
                    msId={feature.id}
                    featuresCrs={ 'EPSG:4326' }
                        />)}</LeafLetLayer>, document.getElementById("container"));
        expect(layer).toExist();
        let l2 = ReactDOM.render(
            <LeafLetLayer type="vector"
                 options={options} map={map}>
                {options.features.map((feature) => <Feature
                    key={feature.id}
                    type={feature.type}
                    geometry={feature.geometry}
                    msId={feature.id}
                    featuresCrs={ 'EPSG:4326' }
                        />)}</LeafLetLayer>, document.getElementById("container"));
        expect(l2).toExist();
    });

    it('creates a wms layer for leaflet map with custom tileSize', () => {
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
            <LeafLetLayer type="wms"
                 options={options} map={map}/>, document.getElementById("container"));
        var lcount = 0;

        expect(layer).toExist();
        // count layers
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(1);
        let width;
        map.eachLayer((l) => width = l.wmsParams.width);
        expect(width).toBe(512);
    });

    it('creates a wms layer with multiple urls for leaflet map', () => {
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
            <LeafLetLayer type="wms"
                 options={options} map={map}/>, document.getElementById("container"));
        var lcount = 0;

        expect(layer).toExist();
        // count layers
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(1);
        let urls;
        map.eachLayer((l) => urls = l._urls);
        expect(urls.length).toBe(2);
    });

    it('creates a google layer for leaflet map', () => {
        var options = {
            "type": "google",
            "name": "ROADMAP"
        };
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
        window.google = google;

        // create layers
        let layer = ReactDOM.render(
            <LeafLetLayer type="google" options={options} map={map}/>, document.getElementById("container"));
        let lcount = 0;

        expect(layer).toExist();
        // count layers
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(1);
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
            <LeafLetLayer type="bing" options={options} map={map}/>, document.getElementById("container"));
        var lcount = 0;

        expect(layer).toExist();
        // count layers
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(1);
    });

    it('switch osm layer visibility', () => {
        // create layers
        var layer = ReactDOM.render(
            <LeafLetLayer type="osm"
                 options={{}} position={0} map={map}/>, document.getElementById("container"));
        var lcount = 0;
        expect(layer).toExist();
        // count layers
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(1);
        // not visibile layers are removed from the leaflet maps
        layer = ReactDOM.render(
            <LeafLetLayer type="osm"
                 options={{visibility: false}} position={0} map={map}/>, document.getElementById("container"));
        expect(map.hasLayer(layer.layer)).toBe(false);
        layer = ReactDOM.render(
            <LeafLetLayer type="osm"
                 options={{visibility: true}} position={0} map={map}/>, document.getElementById("container"));
        expect(map.hasLayer(layer.layer)).toBe(true);
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
            <LeafLetLayer type="wms"
                 options={options} map={map}/>, document.getElementById("container"));
        var lcount = 0;

        expect(layer).toExist();
        // count layers
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(1);

        expect(layer.layer.options.opacity).toBe(1.0);

        layer = ReactDOM.render(
            <LeafLetLayer type="wms"
                 options={assign({}, options, {opacity: 0.5})} map={map}/>, document.getElementById("container"));
        expect(layer.layer.options.opacity).toBe(0.5);
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
            <LeafLetLayer type="wms"
                 options={options} map={map} position={10}/>, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        let lcount = 0;
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(1);

        expect(layer.layer.options.zIndex).toBe(10);
        layer = ReactDOM.render(
            <LeafLetLayer type="wms"
                 options={options} map={map} position={2}/>, document.getElementById("container"));
        expect(layer.layer.options.zIndex).toBe(2);
    });

    it('creates a wms layer singleTile  for leaflet map', () => {
        var options = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "url": "http://sample.server/geoserver/wms",
            "singleTile": true
        };
        // create layers
        var layer = ReactDOM.render(
            <LeafLetLayer type="wms"
                 options={options} map={map}/>, document.getElementById("container"));
        var lcount = 0;

        expect(layer).toExist();
        // count layers
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(1);

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
        let layer = ReactDOM.render(<LeafLetLayer
            type="wms"
            options={options}
            map={map}
            securityToken="########-####-####-####-###########" />, document.getElementById("container"));

        expect(layer).toExist();
        let lcount = 0;
        map.eachLayer(function() { lcount++; });
        expect(lcount).toBe(1);

        expect(layer.layer.wmsParams['ms2-authkey']).toBe("########-####-####-####-###########");
        expect(layer.layer.wmsParams.SLD).toBe("http://sample.server/geoserver/rest/sld?test1=aaa&ms2-authkey=" + encodeURIComponent("########-####-####-####-###########"));
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
        let layer = ReactDOM.render(<LeafLetLayer
            type="wms"
            options={options}
            map={map}
            securityToken="########-####-####-####-###########"/>, document.getElementById("container"));

        expect(layer).toExist();
        let lcount = 0;
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(1);

        expect(layer.layer.wmsParams['ms2-authkey']).toBe("########-####-####-####-###########");

        layer = ReactDOM.render(<LeafLetLayer
            type="wms"
            options={options}
            map={map}
            securityToken=""/>, document.getElementById("container"));
        expect(layer.layer.wmsParams['ms2-authkey']).toBe(undefined);

        layer = ReactDOM.render(<LeafLetLayer
            type="wms"
            options={options}
            map={map}
            securityToken="########-####-$$$$-####-###########"/>, document.getElementById("container"));

        expect(layer.layer.wmsParams['ms2-authkey']).toBe("########-####-$$$$-####-###########");
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
        let layer = ReactDOM.render(<LeafLetLayer
            type="wmts"
            options={options}
            map={map}
            securityToken="########-####-####-####-###########"/>, document.getElementById("container"));

        expect(layer).toExist();
        let lcount = 0;
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(1);

        expect(layer.layer.wmtsParams['ms2-authkey']).toBe("########-####-####-####-###########");

        layer = ReactDOM.render(<LeafLetLayer
            type="wmts"
            options={options}
            map={map}
            securityToken=""/>, document.getElementById("container"));

        expect(layer.layer.wmtsParams['ms2-authkey']).toBe(undefined);

        layer = ReactDOM.render(<LeafLetLayer
            type="wmts"
            options={options}
            map={map}
            securityToken="########-####-$$$$-####-###########"/>, document.getElementById("container"));

        expect(layer.layer.wmtsParams['ms2-authkey']).toBe("########-####-$$$$-####-###########");
    });

    it('switches a wms layer to singleTile for leaflet map', () => {
        var options = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "url": "http://sample.server/geoserver/wms",
            "maxZoom": 23,
            "singleTile": false
        };
        // create layers
        var layer = ReactDOM.render(
            <LeafLetLayer type="wms"
                 options={options} map={map}/>, document.getElementById("container"));
        var lcount = 0;

        expect(layer).toExist();

        const newOptions = assign({}, options, {
            singleTile: true
        });
        layer = ReactDOM.render(
            <LeafLetLayer type="wms"
                 options={newOptions} map={map}/>, document.getElementById("container"));
        expect(layer).toExist();
        // count layers
        map.eachLayer(function() {lcount++; });
        expect(lcount).toBe(1);
        expect(layer.layer.options.maxZoom).toBe(23);
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

        let layer = ReactDOM.render(<LeafLetLayer
            type="wms"
            options={options}
            map={map}
            />, document.getElementById("container"));

        expect(layer).toExist();
        let lcount = 0;
        map.eachLayer(() => { lcount++; });
        expect(lcount).toBe(1);
        expect(layer.layer.wmsParams.CQL_FILTER).toBe("prop = 'value'");
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

        let layer = ReactDOM.render(<LeafLetLayer
            type="wms"
            options={options}
            map={map}
        />, document.getElementById("container"));

        expect(layer).toExist();
        let lcount = 0;
        map.eachLayer(() => { lcount++; });
        expect(lcount).toBe(1);
        expect(layer.layer.wmsParams.CQL_FILTER).toBe("(\"prop2\" = 'value2')");
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

        let layer = ReactDOM.render(<LeafLetLayer
            type="wms"
            options={options}
            map={map}
        />, document.getElementById("container"));

        expect(layer).toExist();
        let lcount = 0;
        map.eachLayer(() => { lcount++; });
        expect(lcount).toBe(1);
        expect(layer.layer.wmsParams.CQL_FILTER).toBe("((\"prop2\" = 'value2')) AND (prop = 'value')");
    });
});
