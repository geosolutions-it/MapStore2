/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var ReactDOM = require('react-dom');
const { castArray } = require('lodash');
var CesiumLayer = require('../Layer.jsx');
var expect = require('expect');
var Cesium = require('../../../../libs/cesium');

const assign = require('object-assign');

require('../../../../utils/cesium/Layers');
require('../plugins/OSMLayer');
require('../plugins/TileProviderLayer');
require('../plugins/WMSLayer');
require('../plugins/WMTSLayer');
require('../plugins/BingLayer');
require('../plugins/GraticuleLayer');
require('../plugins/OverlayLayer');
require('../plugins/MarkerLayer');

const SecurityUtils = require('../../../../utils/SecurityUtils');
const ConfigUtils = require('../../../../utils/ConfigUtils');

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
        /* eslint-disable */
        try {
            ReactDOM.unmountComponentAtNode(document.getElementById("map"));
            ReactDOM.unmountComponentAtNode(document.getElementById("container"));
            ReactDOM.unmountComponentAtNode(document.getElementById("container2"));
        } catch(e) {}
        /* eslint-enable */
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
    it('creates a tileProvider osm layer for cesium map', () => {
        var options = {
            "group": "background",
            "source": "nasagibs",
            "name": "Night2012",
            "provider": "NASAGIBS.ViirsEarthAtNight2012",
            "title": "NASAGIBS Night 2012",
            "type": "tileprovider",
            "visibility": false,
            "singleTile": false,
            "id": "Night2012__3",
            "zIndex": 3
        };
        // create layers
        var layer = ReactDOM.render(
            <CesiumLayer type="tileprovider"
                options={options} map={map}/>, document.getElementById("container"));
        expect(layer).toExist();
    });

    it('creates a wms layer for Cesium map', () => {
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
        expect(map.imageryLayers._layers[0]._imageryProvider.proxy.proxy).toExist();
    });

    it('test wms vector formats must change to default image format (image/png)', () => {
        const options = {
            "type": 'wms',
            "visibility": true,
            "name": 'osm:vector_tile',
            "group": 'Vector',
            "url": "http://demo.geo-solutions.it/geoserver/wms"
        };

        let layer = ReactDOM.render(<CesiumLayer
            type="wms"
            options={{
                ...options,
                format: 'application/json;type=geojson'
            }}
            map={map} />, document.getElementById("container"));

        expect(layer).toExist();

        expect(layer.layer._tileProvider._url.indexOf('format=image%2Fpng') !== -1).toBe(true);

        layer = ReactDOM.render(<CesiumLayer
            type="wms"
            options={{
                ...options,
                format: 'application/vnd.mapbox-vector-tile'
            }}
            map={map} />, document.getElementById("container"));

        expect(layer).toExist();
        expect(layer.layer._tileProvider._url.indexOf('format=image%2Fpng') !== -1).toBe(true);

        layer = ReactDOM.render(<CesiumLayer
            type="wms"
            options={{
                ...options,
                format: 'application/json;type=topojson'
            }}
            map={map} />, document.getElementById("container"));

        expect(layer).toExist();
        expect(layer.layer._tileProvider._url.indexOf('format=image%2Fpng') !== -1).toBe(true);

        // check if it switches to jpeg
        layer = ReactDOM.render(<CesiumLayer
            type="wms"
            options={{
                ...options,
                format: 'image/jpeg'
            }}
            map={map} />, document.getElementById("container"));

        expect(layer).toExist();
        expect(layer.layer._tileProvider._url.indexOf('format=image%2Fjpeg') !== -1).toBe(true);
    });

    it('wms layer with credits', () => {
        var options = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "url": "http://demo.geo-solutions.it/geoserver/wms",
            credits: {
                imageUrl: "test.png",
                title: "test"
            }
        };
        // create layers
        var layer = ReactDOM.render(
            <CesiumLayer type="wms"
                options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.imageryLayers.length).toBe(1);
        expect(map.imageryLayers._layers[0].imageryProvider.credit).toExist();
    });
    it('creates a wms layer with caching for Cesium map', () => {
        var options = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "tiled": true,
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
        expect(map.imageryLayers._layers[0]._imageryProvider.proxy.proxy).toExist();
        expect(map.imageryLayers._layers[0]._imageryProvider._tileProvider._url.toLowerCase().indexOf('tiled=true') !== -1).toBe(true);
    });
    it('check wms layer proxy skip for relative urls', () => {
        var options = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "url": "/geoserver/wms"
        };
        // create layers
        var layer = ReactDOM.render(
            <CesiumLayer type="wms"
                options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.imageryLayers.length).toBe(1);
        expect(map.imageryLayers._layers[0]._imageryProvider._url).toBe('{s}');
        expect(map.imageryLayers._layers[0]._imageryProvider._tileProvider._subdomains.length).toBe(1);
        expect(map.imageryLayers._layers[0]._imageryProvider.proxy.proxy).toNotExist();
    });

    it('creates a wmts layer for Cesium map', () => {
        var options = {
            "type": "wmts",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "tileMatrixSet": "EPSG:900913",
            "matrixIds": {
                "EPSG:4326": [{
                    ranges: {
                        cols: {max: 0, min: 0},
                        rows: {max: 0, min: 0}
                    }
                }]
            },
            "url": "http://sample.server/geoserver/gwc/service/wmts"
        };
        // create layers
        var layer = ReactDOM.render(
            <CesiumLayer type="wmts"
                options={options} map={map}/>, document.getElementById("container"));


        expect(layer).toExist();
        // count layers
        expect(map.imageryLayers.length).toBe(1);
        expect(map.imageryLayers._layers[0]._imageryProvider._url).toExist();
        expect(map.imageryLayers._layers[0]._imageryProvider.proxy.proxy).toExist();
    });
    it('custom name tile set', () => {
        var options = {
            "type": "wmts",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "tileMatrixSet": "test_tile_set",
            "matrixIds": {
                "test_tile_set": [{
                    "identifier": "0",
                    ranges: {
                        cols: {max: 0, min: 0},
                        rows: {max: 0, min: 0}
                    }
                }]
            },
            "url": "http://sample.server/geoserver/gwc/service/wmts"
        };
        // create layers
        var layer = ReactDOM.render(
            <CesiumLayer type="wmts"
                options={options} map={map}/>, document.getElementById("container"));


        expect(layer).toExist();
        // count layers
        expect(map.imageryLayers.length).toBe(1);
        expect(map.imageryLayers._layers[0]._imageryProvider._tileMatrixLabels).toExist();
        expect(map.imageryLayers._layers[0]._imageryProvider._tileMatrixLabels[0]).toBe("0");
    });
    it('check a wmts layer skips proxy config', () => {
        var options = {
            "type": "wmts",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "tileMatrixSet": "EPSG:900913",
            "matrixIds": {
                "EPSG:4326": [{
                    ranges: {
                        cols: {max: 0, min: 0},
                        rows: {max: 0, min: 0}
                    }
                }]
            },
            "url": "/geoserver/gwc/service/wmts"
        };
        // create layers
        var layer = ReactDOM.render(
            <CesiumLayer type="wmts"
                options={options} map={map}/>, document.getElementById("container"));
        expect(layer).toExist();
        // count layers
        expect(map.imageryLayers.length).toBe(1);
        expect(map.imageryLayers._layers[0]._imageryProvider._url).toExist();
        expect(map.imageryLayers._layers[0]._imageryProvider.proxy.proxy).toNotExist();
    });

    it('creates a wms layer with single tile for CesiumLayer map', () => {
        var options = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "url": "http://demo.geo-solutions.it/geoserver/wms",
            "singleTile": true
        };
        // create layers
        var layer = ReactDOM.render(
            <CesiumLayer type="wms"
                options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.imageryLayers.length).toBe(1);
        expect(map.imageryLayers._layers[0]._imageryProvider._url.indexOf('http://demo.geo-solutions.it/geoserver/wms?service=WMS')).toBe(0);
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

    it('creates a bing layer for cesium map', () => {
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
        // create layers
        var layer = ReactDOM.render(
            <CesiumLayer type="osm"
                options={{}} position={0} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.imageryLayers.length).toBe(1);
        // not visibile layers are removed from the leaflet maps
        layer = ReactDOM.render(
            <CesiumLayer type="osm"
                options={{visibility: false}} position={0} map={map}/>, document.getElementById("container"));
        expect(map.imageryLayers.length).toBe(0);
        layer = ReactDOM.render(
            <CesiumLayer type="osm"
                options={{visibility: true}} position={0} map={map}/>, document.getElementById("container"));
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
                options={options} position={0} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.imageryLayers.length).toBe(1);

        expect(layer.provider.alpha).toBe(1.0);
        layer = ReactDOM.render(
            <CesiumLayer type="wms"
                options={assign({}, options, {opacity: 0.5})} position={0} map={map}/>, document.getElementById("container"));
        expect(layer.provider.alpha).toBe(0.5);
    });

    it('respects layer ordering 1', () => {
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
        let layer1 = ReactDOM.render(
            <CesiumLayer type="wms"
                options={options1} map={map} position={1}/>
            , document.getElementById("container"));

        expect(layer1).toExist();
        expect(map.imageryLayers.length).toBe(1);

        let layer2 = ReactDOM.render(
            <CesiumLayer type="wms"
                options={options2} map={map} position={2}/>
            , document.getElementById("container2"));

        expect(layer2).toExist();
        expect(map.imageryLayers.length).toBe(2);

        layer1 = ReactDOM.render(
            <CesiumLayer type="wms"
                options={options1} map={map} position={2}/>
            , document.getElementById("container"));

        layer2 = ReactDOM.render(
            <CesiumLayer type="wms"
                options={options2} map={map} position={1}/>
            , document.getElementById("container2"));

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

    it('creates and overlay layer for cesium map', () => {
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
            <CesiumLayer type="overlay"
                options={options} map={map}/>, document.getElementById('ovcontainer'));

        expect(layer).toExist();
        expect(map.scene.primitives.length).toBe(1);
    });

    it('creates and overlay layer for cesium map with close support', () => {
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
            <CesiumLayer type="overlay"
                options={options} map={map}/>, document.getElementById('ovcontainer'));

        expect(layer).toExist();
        const content = map.scene.primitives.get(0)._content;
        expect(content).toExist();
        const close = content.getElementsByClassName('close')[0];
        close.click();
        expect(closed).toBe(true);
    });

    it('creates and overlay layer for cesium map with no data-reactid attributes', () => {
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
            <CesiumLayer type="overlay"
                options={options} map={map}/>, document.getElementById('ovcontainer'));

        expect(layer).toExist();
        const content = map.scene.primitives.get(0)._content;
        expect(content).toExist();
        const close = content.getElementsByClassName('close')[0];
        expect(close.getAttribute('data-reactid')).toNotExist();
    });

    it('creates a marker layer for cesium map', () => {
        let options = {
            point: [13, 43]
        };
        // create layers
        let layer = ReactDOM.render(
            <CesiumLayer type="marker"
                options={options} map={map}/>, document.getElementById('container'));
        expect(layer).toExist();
        expect(map.entities._entities.length).toBe(1);
    });

    it('respects layer ordering 2', () => {
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
            <CesiumLayer type="wms" position={10}
                options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toExist();

        const position = map.imageryLayers.get(0)._position;
        expect(position).toBe(10);
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
        let layer = ReactDOM.render(<CesiumLayer
            type="wms"
            options={options}
            map={map}
            securityToken="########-####-####-####-###########"/>, document.getElementById("container"));

        expect(layer).toExist();
        // expect(map.imageryLayers.length).toBe(1);
        let url = decodeURIComponent(layer.layer._tileProvider._url);
        expect(url.match(/ms2-authkey=########-####-####-####-###########/g).length).toBe(1);

        layer = ReactDOM.render(<CesiumLayer
            type="wms"
            options={options}
            map={map}
            securityToken=""/>, document.getElementById("container"));

        url = decodeURIComponent(layer.layer._tileProvider._url);
        expect(url.match(/ms2-authkey/g)).toBe(null);

        layer = ReactDOM.render(<CesiumLayer
            type="wms"
            options={options}
            map={map}
            securityToken="########-####-$$$$-####-###########"/>, document.getElementById("container"));

        url = decodeURIComponent(layer.layer._tileProvider._url);
        expect(url.match(/ms2-authkey=########-####-\$\$\$\$-####-###########/g).length).toBe(1);
    });

    it('test wmts security token', () => {
        const options = {
            "type": "wmts",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "tileMatrixSet": "EPSG:900913",
            "matrixIds": {
                "EPSG:4326": [{
                    ranges: {
                        cols: {max: 0, min: 0},
                        rows: {max: 0, min: 0}
                    }
                }]
            },
            "url": "http://sample.server/geoserver/gwc/service/wmts"
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
        let layer = ReactDOM.render(<CesiumLayer
            type="wmts"
            options={options}
            map={map}
            securityToken="########-####-####-####-###########"/>, document.getElementById("container"));

        expect(layer).toExist();

        let url = decodeURIComponent(castArray(layer.layer._url)[0]);
        expect(url.match(/ms2-authkey=########-####-####-####-###########/g).length).toBe(1);

        layer = ReactDOM.render(<CesiumLayer
            type="wmts"
            options={options}
            map={map}
            securityToken=""/>, document.getElementById("container"));

        url = decodeURIComponent(castArray(layer.layer._url)[0]);
        expect(url.match(/ms2-authkey/g)).toBe(null);

        layer = ReactDOM.render(<CesiumLayer
            type="wmts"
            options={options}
            map={map}
            securityToken="########-####-$$$$-####-###########"/>, document.getElementById("container"));

        url = decodeURIComponent(castArray(layer.layer._url)[0]);
        expect(url.match(/ms2-authkey=########-####-\$\$\$\$-####-###########/g).length).toBe(1);

    });
    it('test cql_filter param to be passed to the layer', () => {
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

        let layer = ReactDOM.render(<CesiumLayer
            type="wms"
            options={options}
            map={map}
        />, document.getElementById("container"));

        expect(layer).toExist();
        const cqlFilter = decodeURIComponent(/cql_filter=([^&#]+)/.exec(layer.layer._tileProvider.url)[1]);

        expect(cqlFilter).toBe("prop = 'value'");
    });
    it('test filterObj paramto be transformed into cql_filter', () => {
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

        let layer = ReactDOM.render(<CesiumLayer
            type="wms"
            options={options}
            map={map}
        />, document.getElementById("container"));

        expect(layer).toExist();
        const cqlFilter = decodeURIComponent(/cql_filter=([^&#]+)/.exec(layer.layer._tileProvider.url)[1]);

        expect(cqlFilter).toBe("(\"prop2\" = 'value2')");
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

        let layer = ReactDOM.render(<CesiumLayer
            type="wms"
            options={options}
            map={map}
        />, document.getElementById("container"));
        const cqlFilter = decodeURIComponent(/cql_filter=([^&#]+)/.exec(layer.layer._tileProvider.url)[1]);

        expect(layer).toExist();

        expect(cqlFilter).toBe("((\"prop2\" = 'value2')) AND (prop = 'value')");
    });


    it('test wmts vector formats must change to default image format (image/png)', () => {
        const options = {
            type: 'wmts',
            visibility: true,
            name: 'osm:vector_tile',
            group: 'Vector',
            tileMatrixSet: 'EPSG:900913',
            matrixIds: {
                'EPSG:4326': [{
                    ranges: {
                        cols: {max: 0, min: 0},
                        rows: {max: 0, min: 0}
                    }
                }]
            },
            url: 'http://sample.server/geoserver/gwc/service/wmts'
        };

        const GeoJSON = 'application/json;type=geojson';
        let layer = ReactDOM.render(<CesiumLayer
            type="wmts"
            options={{
                ...options,
                format: GeoJSON
            }}
            map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(layer.layer._format).toBe('image/png');

        const MVT = 'application/vnd.mapbox-vector-tile';
        layer = ReactDOM.render(<CesiumLayer
            type="wmts"
            options={{
                ...options,
                format: MVT
            }}
            map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(layer.layer._format).toBe('image/png');

        const TopoJSON = 'application/json;type=topojson';
        layer = ReactDOM.render(<CesiumLayer
            type="wmts"
            options={{
                ...options,
                format: TopoJSON
            }}
            map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(layer.layer._format).toBe('image/png');

        // check if it switches to jpeg
        const JPEG = 'image/jpeg';
        layer = ReactDOM.render(<CesiumLayer
            type="wmts"
            options={{
                ...options,
                format: JPEG
            }}
            map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(layer.layer._format).toBe(JPEG);
    });
});
