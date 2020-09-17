/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import OpenlayersLayer from '../Layer';

import assign from 'object-assign';
import Layers from '../../../../utils/openlayers/Layers';
import '../plugins/OSMLayer';
import '../plugins/WMSLayer';
import '../plugins/WMTSLayer';
import '../plugins/GoogleLayer';
import '../plugins/BingLayer';
import '../plugins/MapQuest';
import '../plugins/VectorLayer';
import '../plugins/GraticuleLayer';
import '../plugins/OverlayLayer';
import '../plugins/TMSLayer';
import '../plugins/WFSLayer';
import '../plugins/WFS3Layer';

import SecurityUtils from '../../../../utils/SecurityUtils';
import ConfigUtils from '../../../../utils/ConfigUtils';

import { Map, View } from 'ol';
import { defaults as defaultControls } from 'ol/control';

import axios from "../../../../libs/ajax";
import MockAdapter from "axios-mock-adapter";
import {get} from 'ol/proj';

let mockAxios;

const sampleTileMatrixConfig900913 = {
    "matrixIds": {
        'EPSG:900913': [
            {
                identifier: "EPSG:900913:0",
                ranges: {
                    cols: { min: "0", max: "0" },
                    rows: { min: "0", max: "0" }
                }

            },
            {
                identifier: "EPSG:900913:1",
                ranges: {
                    cols: { min: "0", max: "1" },
                    rows: { min: "0", max: "1" }
                }

            },
            {
                identifier: "EPSG:900913:2",
                ranges: {
                    cols: { min: "0", max: "3" },
                    rows: { min: "1", max: "2" }
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
                    "TileHeight": "512",
                    "TileWidth": "256",
                    "TopLeftCorner": "-2.003750834E7 2.0037508E7",
                    "ows:Identifier": "EPSG:900913:0"
                },
                {
                    "MatrixHeight": "2",
                    "MatrixWidth": "2",
                    "ScaleDenominator": "2.7954113197544646E8",
                    "TileHeight": "512",
                    "TileWidth": "256",
                    "TopLeftCorner": "-2.003750834E7 2.0037508E7",
                    "ows:Identifier": "EPSG:900913:1"
                },
                {
                    "MatrixHeight": "4",
                    "MatrixWidth": "4",
                    "ScaleDenominator": "1.3977056598772323E8",
                    "TileHeight": "512",
                    "TileWidth": "256",
                    "TopLeftCorner": "-2.003750834E7 2.0037508E7",
                    "ows:Identifier": "EPSG:900913:2"
                }
            ],
            "ows:Identifier": "EPSG:900913",
            "ows:SupportedCRS": "urn:ogc:def:crs:EPSG:900913"
        }
    ]
};

const lowResGridset = {
    "matrixIds": {
        'SPHMERC_900913_CoFi': [
            {
                identifier: "SPHMERC_900913_CoFi:0",
                ranges: {
                    cols: { min: "0", max: "0" },
                    rows: { min: "0", max: "0" }
                }

            },
            {
                identifier: "SPHMERC_900913_CoFi:1",
                ranges: {
                    cols: { min: "0", max: "1" },
                    rows: { min: "0", max: "1" }
                }

            }
        ]

    },
    "tileMatrixSet": [
        {
            "ows:Identifier": "SPHMERC_900913_CoFi",
            "ows:SupportedCRS": "urn:ogc:def:crs:EPSG::900913",
            "TileMatrix": [
                {
                    "ows:Abstract": "The grid was not well-defined, the scale therefore assumes 1m per map unit.",
                    "ows:Identifier": "SPHMERC_900913_CoFi:0",
                    "ScaleDenominator": "272989.38669477194",
                    "TopLeftCorner": "1232776.0 5459439.0",
                    "TileWidth": "256",
                    "TileHeight": "256",
                    "MatrixWidth": "2",
                    "MatrixHeight": "2"
                },
                {
                    "ows:Abstract": "The grid was not well-defined, the scale therefore assumes 1m per map unit.",
                    "ows:Identifier": "SPHMERC_900913_CoFi:1",
                    "ScaleDenominator": "136494.69334738597",
                    "TopLeftCorner": "1232776.0 5449655.0",
                    "TileWidth": "256",
                    "TileHeight": "256",
                    "MatrixWidth": "4",
                    "MatrixHeight": "3"
                }
            ]
        }
    ]
};

describe('Openlayers layer', () => {
    document.body.innerHTML = '<div id="map"></div>';
    let map;

    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
        document.body.innerHTML = '<div id="map"></div><div id="container"></div>';
        map = new Map({
            layers: [
            ],
            controls: defaultControls({
                attributionOptions: {
                    collapsible: false
                }
            }),
            target: 'map',
            view: new View({
                center: [0, 0],
                zoom: 5
            })
        });
    });

    afterEach(() => {
        mockAxios.restore();
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
        expect(map.getLayers().item(0).getSource().getAttributions()).toNotExist();
    });

    it('test wms vector formats', () => {
        const options = {
            "type": 'wms',
            "visibility": true,
            "name": 'osm:vector_tile',
            "group": 'Vector',
            "url": "http://sample.server/geoserver/wms"
        };

        let layer = ReactDOM.render(<OpenlayersLayer
            type="wms"
            options={{
                ...options,
                format: 'application/json;type=geojson'
            }}
            map={map} />, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.getType()).toBe('VECTOR_TILE');
        expect(layer.layer.getSource().format_.constructor.name).toBe('GeoJSON');

        layer = ReactDOM.render(<OpenlayersLayer
            type="wms"
            options={{
                ...options,
                format: 'application/vnd.mapbox-vector-tile'
            }}
            map={map} />, document.getElementById("container"));
        expect(layer).toExist();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.getType()).toBe('VECTOR_TILE');
        expect(layer.layer.getSource().format_.constructor.name).toBe('MVT');

        layer = ReactDOM.render(<OpenlayersLayer
            type="wms"
            options={{
                ...options,
                format: 'application/json;type=topojson'
            }}
            map={map} />, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.getType()).toBe('VECTOR_TILE');
        expect(layer.layer.getSource().format_.constructor.name).toBe('TopoJSON');
    });

    it('test wms vector formats styles are applied', (done) => {
        const options = {
            "type": 'wms',
            "visibility": true,
            "name": 'osm:vector_tile',
            "group": 'Vector',
            "url": "http://sample.server/geoserver/wms",
            "vectorStyle": {
                "color": "#ff0000",
                "fillColor": "#ffff00",
                "fillOpacity": 0.5
            }
        };

        let layer = ReactDOM.render(<OpenlayersLayer
            type="wms"
            options={{
                ...options,
                format: 'application/json;type=geojson'
            }}
            map={map} />, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.getType()).toBe('VECTOR_TILE');
        expect(layer.layer.getSource().format_.constructor.name).toBe('GeoJSON');
        setTimeout(() => {
            const style = layer.layer.getStyle();
            expect(style).toExist();
            expect(style.getStroke().getColor()).toBe('rgb(255, 0, 0)');
            expect(style.getFill().getColor()).toBe('rgba(255, 255, 0, 0.5)');
            done();
        }, 0);
    });

    it('test wms vector formats remote styles are applied', (done) => {
        const SLD = `<?xml version="1.0" encoding="ISO-8859-1"?>
            <StyledLayerDescriptor version="1.0.0"
                xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd"
                xmlns="http://www.opengis.net/sld"
                xmlns:ogc="http://www.opengis.net/ogc"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            <NamedLayer>
                <Name>Simple Polygon</Name>
                <UserStyle>
                <Title>Simple Polygon</Title>
                <FeatureTypeStyle>
                    <Rule>
                    <PolygonSymbolizer>
                        <Stroke>
                            <CssParameter name="stroke">#FF0000</CssParameter>
                            <CssParameter name="stroke-width">2</CssParameter>
                        </Stroke>
                        <Fill>
                            <CssParameter name="fill">#FFFF00</CssParameter>
                            <CssParameter name="fill-opacity">0.5</CssParameter>
                        </Fill>
                    </PolygonSymbolizer>
                    </Rule>
                </FeatureTypeStyle>
                </UserStyle>
            </NamedLayer>
            </StyledLayerDescriptor>`;
        mockAxios.onGet().reply(200, SLD);
        const options = {
            "type": 'wms',
            "visibility": true,
            "name": 'osm:vector_tile',
            "group": 'Vector',
            "url": "http://sample.server/geoserver/wms",
            "vectorStyle": {
                "url": "http://mystyle",
                "format": "sld"
            }
        };
        let layer = ReactDOM.render(<OpenlayersLayer
            type="wms"
            options={{
                ...options,
                format: 'application/json;type=geojson'
            }}
            map={map} />, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.getType()).toBe('VECTOR_TILE');
        expect(layer.layer.getSource().format_.constructor.name).toBe('GeoJSON');
        setTimeout(() => {
            try {
                const style = layer.layer.getStyle();
                expect(style).toExist();
                expect(style.getStroke().getColor()).toBe('#FF0000');
                // currently SLD parser use fillOpacity instead of opacity
                // and probably this cause wrong parsing of opacity
                expect(style.getFill().getColor()).toBe('#FFFF00');
            } catch (e) {
                done(e);
            }
            done();
        }, 0);
    });

    it('wms layer attribution with credits - create and update layer', () => {
        const TEXT1 = "some attribution";
        const TEXT2 = "some other attibution";
        const CREDITS1 = {
            imageUrl: "test.jpg",
            title: "test"
        };

        var options = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            credits: {
                title: TEXT1
            },
            "format": "image/png",
            "url": "http://sample.server/geoserver/wms"
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="wms"
                options={options} map={map} />, document.getElementById("container"));

        expect(layer).toExist();
        // check creation
        expect(map.getLayers().getLength()).toBe(1);
        expect(map.getLayers().item(0).getSource().urls.length).toBe(1);
        expect(map.getLayers().item(0).getSource().getAttributions()).toExist();
        expect(map.getLayers().item(0).getSource().getAttributions()()[0]).toBe(TEXT1);
        // check remove
        ReactDOM.render(
            <OpenlayersLayer type="wms"
                options={{...options, credits: undefined}} map={map} />, document.getElementById("container"));
        expect(map.getLayers().item(0).getSource().getAttributions()).toNotExist();
        // check update
        ReactDOM.render(
            <OpenlayersLayer type="wms"
                options={{ ...options, credits: {title: TEXT2} }} map={map} />, document.getElementById("container"));
        expect(map.getLayers().item(0).getSource().getAttributions()).toExist();
        expect(map.getLayers().item(0).getSource().getAttributions()()[0]).toBe(TEXT2);
        // check content update
        ReactDOM.render(
            <OpenlayersLayer type="wms"
                options={options} map={map} />, document.getElementById("container"));
        expect(map.getLayers().item(0).getSource().getAttributions()).toExist();
        expect(map.getLayers().item(0).getSource().getAttributions()()[0]).toBe(TEXT1);
        // check complex contents
        ReactDOM.render(
            <OpenlayersLayer type="wms"
                options={{...options, credits: CREDITS1}} map={map} />, document.getElementById("container"));
        expect(map.getLayers().item(0).getSource().getAttributions()).toExist();
        expect(map.getLayers().item(0).getSource().getAttributions()()[0]).toBe('<img src="test.jpg" title="test">');
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
        expect(map.getLayers().item(0).getSource().getAttributions()).toNotExist();
    });
    it('single tile wms layer for openlayers map sends tiled=false', (done) => {
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
        const loadFun = (image, src) => {
            const tiled = src.match(/TILED=([^&]+)/i)[1];
            expect(tiled.toLowerCase()).toBe("false");
            done();
        };
        map.getLayers().item(0).getSource().setImageLoadFunction(loadFun);
        map.getLayers().item(0).getSource().refresh();
    });
    it('creates a single tile credits', () => {
        var options = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "credits": {
                title: "some attribution"
            },
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
        expect(map.getLayers().item(0).getSource().getAttributions()).toExist();
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

    it('test wms custom resolutions', () => {
        var options = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "singleTile": false,
            "resolutions": [100, 10, 3, 2, 1],
            "url": "http://sample.server/geoserver/wms"
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="wms"
                options={options} map={map} />, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
        expect(map.getLayers().item(0).getSource().tileGrid.getResolutions().length).toBe(5);
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
        expect(map.getLayers().item(0).getSource().getStyle()).toBe("");
    });
    it('creates a wmts layer with style for openlayers map', () => {
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
            "style": "teststyle",
            "url": "http://sample.server/geoserver/gwc/service/wmts"
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="wmts"
                options={options} map={map} />, document.getElementById("container"));


        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
        expect(map.getLayers().item(0).getSource().urls.length).toBe(1);
        expect(map.getLayers().item(0).getSource().getStyle()).toBe("teststyle");
    });
    it('test wmts resolutions, maxResolutions and minResolutions', () => {
        var options = {
            "type": "wmts",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            ...sampleTileMatrixConfig900913,
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
        const expectedResolutions = sampleTileMatrixConfig900913.tileMatrixSet[0].TileMatrix.map( e => e.ScaleDenominator * 0.28E-3);
        wmtsLayer.getSource().getTileGrid().getResolutions().map((v, i) => expect(v).toBe(expectedResolutions[i]));
    });
    it('test wmts sizes and tile sizes', () => {
        var options = {
            "type": "wmts",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            ...sampleTileMatrixConfig900913,
            "url": "http://sample.server/geoserver/gwc/service/wmts"
        };
        // create layers
        const layer = ReactDOM.render(
            <OpenlayersLayer type="wmts"
                options={options} map={map} />, document.getElementById("container"));


        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);

        const wmtsLayer = map.getLayers().item(0);
        expect(wmtsLayer.getSource().getTileGrid().getTileSize(1)[0]).toBe(256);
        expect(wmtsLayer.getSource().getTileGrid().getTileSize(1)[1]).toBe(512);
        expect(wmtsLayer.getSource().getTileGrid().getFullTileRange(1).minX).toBe(0);
        expect(wmtsLayer.getSource().getTileGrid().getFullTileRange(1).maxX).toBe(1);
        expect(wmtsLayer.getSource().getTileGrid().getFullTileRange(1).minY).toBe(0);
        expect(wmtsLayer.getSource().getTileGrid().getFullTileRange(1).maxY).toBe(1);
        expect(wmtsLayer.getSource().getTileGrid().getFullTileRange(2).minX).toBe(0);
        expect(wmtsLayer.getSource().getTileGrid().getFullTileRange(2).maxX).toBe(3);
        expect(wmtsLayer.getSource().getTileGrid().getFullTileRange(2).minY).toBe(0);
        expect(wmtsLayer.getSource().getTileGrid().getFullTileRange(2).maxY).toBe(3);
    });
    it('test wmts layer extent', () => {
        var options = {
            "type": "wmts",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "bbox": {
                crs: "EPSG:4326",
                bounds: {
                    minx: 10,
                    maxx: 15,
                    miny: 40,
                    maxy: 45
                }
            },
            ...sampleTileMatrixConfig900913,
            "url": "http://sample.server/geoserver/gwc/service/wmts"
        };
        // create layers
        const layer = ReactDOM.render(
            <OpenlayersLayer type="wmts"
                options={options} map={map} />, document.getElementById("container"));


        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);

        const wmtsLayer = map.getLayers().item(0);
        expect(Math.floor(wmtsLayer.getSource().getTileGrid().getExtent()[0])).toBe(1113194);
        expect(Math.floor(wmtsLayer.getSource().getTileGrid().getExtent()[1])).toBe(4865942);
        expect(Math.floor(wmtsLayer.getSource().getTileGrid().getExtent()[2])).toBe(1669792);
        expect(Math.floor(wmtsLayer.getSource().getTileGrid().getExtent()[3])).toBe(5621521);
    });
    it('test wmts layer extent out of bounds', () => {
        var options = {
            "type": "wmts",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "bbox": {
                crs: "EPSG:4326",
                bounds: {
                    minx: -360,
                    maxx: 360,
                    miny: -90,
                    maxy: 90
                }
            },
            ...sampleTileMatrixConfig900913,
            "url": "http://sample.server/geoserver/gwc/service/wmts"
        };
        // create layers
        const layer = ReactDOM.render(
            <OpenlayersLayer type="wmts"
                options={options} map={map} />, document.getElementById("container"));


        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);

        const wmtsLayer = map.getLayers().item(0);
        expect(Math.floor(wmtsLayer.getSource().getTileGrid().getExtent()[0])).toBe(-20037509);
        expect(Math.floor(wmtsLayer.getSource().getTileGrid().getExtent()[1])).toBe(-20037509);
        expect(Math.floor(wmtsLayer.getSource().getTileGrid().getExtent()[2])).toBe(20037508);
        expect(Math.floor(wmtsLayer.getSource().getTileGrid().getExtent()[3])).toBe(20037508);
    });
    it('test fix for OL draw image (remove when OL > 5.3.0) ', () => {
        // see https://github.com/openlayers/openlayers/issues/8700
        var options = {
            "type": "wmts",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "url": "http://sample.server/geoserver/gwc/service/wmts",
            ...lowResGridset
        };
        // create layers
        const layer = ReactDOM.render(
            <OpenlayersLayer type="wmts"
                options={options} map={map} />, document.getElementById("container"));


        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);

        const wmtsLayer = map.getLayers().item(0);
        const expectedResolutions = lowResGridset.tileMatrixSet[0].TileMatrix.map(e => e.ScaleDenominator * 0.28E-3);
        wmtsLayer.getSource().getTileGrid().getResolutions().map((v, i) => expect(v).toBe(expectedResolutions[i]));
        expect(wmtsLayer.getMaxResolution()).toBeMoreThan(wmtsLayer.getSource().getTileGrid().getResolutions()[0]);
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
    it('test correct wms origin', () => {
        var options = {
            "type": "wms",
            "visibility": true,
            "name": "nurc:Arc_Sample",
            "group": "Meteo",
            "format": "image/png",
            "url": ["http://sample.server/geoserver/wms"]
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="wms"
                options={options} map={map} />, document.getElementById("container"));


        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
        expect(map.getLayers().item(0).getSource().getTileGrid().getOrigin()).toEqual([-20037508.342789244, -20037508.342789244]);
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

    it('creates a vector layer with opacity for openlayers map', () => {
        const opacity = 0.45;
        var options = {
            crs: 'EPSG:4326',
            opacity,
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

        expect(layer.layer.getOpacity()).toEqual(opacity);
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
    it('changes wms params causes cache drop', () => {
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
                options={options} map={map} />, document.getElementById("container"));

        expect(layer).toExist();
        const source = layer.layer.getSource();
        const spy = expect.spyOn(source, "refresh");
        // count layers
        expect(map.getLayers().getLength()).toBe(1);

        expect(layer.layer.getSource()).toExist();
        expect(layer.layer.getSource().getParams()).toExist();
        expect(layer.layer.getSource().getParams().cql_filter).toBe("INCLUDE");

        layer = ReactDOM.render(
            <OpenlayersLayer type="wms" observables={["cql_filter"]}
                options={assign({}, options, { params: { cql_filter: "EXCLUDE" } })} map={map} />, document.getElementById("container"));
        expect(layer.layer.getSource().getParams().cql_filter).toBe("EXCLUDE");

        // this prevents old cache to be rendered while loading
        expect(spy).toHaveBeenCalled();
    });
    it('dimensions triggers params change', () => {
        // this tests if dimension parameter changes, this triggers updateParams
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
                options={options} map={map} />, document.getElementById("container"));

        expect(layer).toExist();
        const source = layer.layer.getSource();
        const spyRefresh = expect.spyOn(source, "refresh");
        // count layers
        expect(map.getLayers().getLength()).toBe(1);

        expect(layer.layer.getSource()).toExist();
        expect(layer.layer.getSource().getParams()).toExist();
        expect(layer.layer.getSource().getParams().cql_filter).toBe("INCLUDE");

        layer = ReactDOM.render(
            <OpenlayersLayer type="wms" observables={["cql_filter"]}
                options={assign({}, options, { params: { time: "2019-01-01T00:00:00Z", ...options.params } })} map={map} />, document.getElementById("container"));

        expect(spyRefresh).toHaveBeenCalled();
        expect(layer.layer.getSource().getParams().time).toBe("2019-01-01T00:00:00Z");
    });
    it('wms empty params not removed on update', () => {
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
            <OpenlayersLayer type="wms"
                options={options} map={map} />, document.getElementById("container"));

        expect(layer).toExist();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);

        expect(layer.layer.getSource()).toExist();
        expect(layer.layer.getSource().getParams()).toExist();
        expect(layer.layer.getSource().getParams().STYLES).toBe("");

        layer = ReactDOM.render(
            <OpenlayersLayer type="wms"
                options={assign({}, options, { format: "image/jpeg" })} map={map} />, document.getElementById("container"));

        expect(layer.layer.getSource().getParams().STYLES).toBe("");
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

    it('test wmts REST allows querystring in url', () => {
        const options = {
            type: 'wmts',
            visibility: false,
            name: 'nurc:Arc_Sample',
            group: 'Meteo',
            format: 'image/png',
            requestEncoding: "RESTful",
            tileMatrixSet: [
                {
                    'TileMatrix': [],
                    'ows:Identifier': 'EPSG:900913',
                    'ows:SupportedCRS': 'urn:ogc:def:crs:EPSG::900913'
                }
            ],
            url: 'http://sample.server/geoserver/gwc/service/wmts?x={TileCol}'
        };

        const layer = ReactDOM.render(<OpenlayersLayer
            type="wmts"
            options={options}
            map={map}
        />, document.getElementById("container"));
        expect(decodeURIComponent(layer.layer.getSource().getUrls()[0])).toContain(["?x={TileCol}"]);
    });
    it('test wmts custom resolutions', () => {
        const tileMatrix = [{
            "ows:Identifier": "0",
            "ScaleDenominator": "17471320.75089746",
            "TopLeftCorner": "-46133.17 6301219.54",
            "TileWidth": "256",
            "TileHeight": "256",
            "MatrixWidth": "1",
            "MatrixHeight": "1"
        },
        {
            "ows:Identifier": "1",
            "ScaleDenominator": "8735660.37544873",
            "TopLeftCorner": "-46133.17 6301219.54",
            "TileWidth": "256",
            "TileHeight": "256",
            "MatrixWidth": "2",
            "MatrixHeight": "2"
        },
        {
            "ows:Identifier": "2",
            "ScaleDenominator": "4367830.187724365",
            "TopLeftCorner": "-46133.17 6301219.54",
            "TileWidth": "256",
            "TileHeight": "256",
            "MatrixWidth": "4",
            "MatrixHeight": "4"
        },
        {
            "ows:Identifier": "3",
            "ScaleDenominator": "2183915.0938621825",
            "TopLeftCorner": "-46133.17 6301219.54",
            "TileWidth": "256",
            "TileHeight": "256",
            "MatrixWidth": "8",
            "MatrixHeight": "8"
        }];
        const options = {
            type: 'wmts',
            visibility: false,
            name: 'nurc:Arc_Sample',
            group: 'Meteo',
            format: 'image/png',
            requestEncoding: "RESTful",
            tileMatrixSet: [
                {
                    'ows:Identifier': 'EPSG:3857',
                    'ows:SupportedCRS': 'urn:ogc:def:crs:EPSG::3857',
                    TileMatrix: tileMatrix
                }
            ],
            url: 'http://sample.server/geoserver/gwc/service/wmts'
        };
        ReactDOM.render(<OpenlayersLayer
            type="wmts"
            options={options}
            map={map}
        />, document.getElementById("container"));
        const wmtsLayer = map.getLayers().item(0);
        const metersPerUnit = get("EPSG:3857").getMetersPerUnit();

        const expectedResolutions = tileMatrix.map(matrix => Number(matrix.ScaleDenominator) * 0.28E-3 / metersPerUnit);
        wmtsLayer.getSource().getTileGrid().getResolutions().map((v, i) => expect(v).toBe(expectedResolutions[i]));
    });
    it('Openlayers requires the resolutions to be sorted', () => {
        const tileMatrix = [{
            "ows:Identifier": "0",
            "ScaleDenominator": "17471320.75089746",
            "TopLeftCorner": "-46133.17 6301219.54",
            "TileWidth": "256",
            "TileHeight": "256",
            "MatrixWidth": "1",
            "MatrixHeight": "1"
        },
        {
            "ows:Identifier": "2",
            "ScaleDenominator": "4367830.187724365",
            "TopLeftCorner": "-46133.17 6301219.54",
            "TileWidth": "256",
            "TileHeight": "256",
            "MatrixWidth": "4",
            "MatrixHeight": "4"
        },
        {
            "ows:Identifier": "1",
            "ScaleDenominator": "8735660.37544873",
            "TopLeftCorner": "-46133.17 6301219.54",
            "TileWidth": "256",
            "TileHeight": "256",
            "MatrixWidth": "2",
            "MatrixHeight": "2"
        },
        {
            "ows:Identifier": "3",
            "ScaleDenominator": "2183915.0938621825",
            "TopLeftCorner": "-46133.17 6301219.54",
            "TileWidth": "256",
            "TileHeight": "256",
            "MatrixWidth": "8",
            "MatrixHeight": "8"
        }];
        const options = {
            type: 'wmts',
            visibility: false,
            name: 'nurc:Arc_Sample',
            group: 'Meteo',
            format: 'image/png',
            requestEncoding: "RESTful",
            tileMatrixSet: [
                {
                    'ows:Identifier': 'EPSG:3857',
                    'ows:SupportedCRS': 'urn:ogc:def:crs:EPSG::3857',
                    TileMatrix: tileMatrix
                }
            ],
            url: 'http://sample.server/geoserver/gwc/service/wmts'
        };
        ReactDOM.render(<OpenlayersLayer
            type="wmts"
            options={options}
            map={map}
        />, document.getElementById("container"));
        const wmtsLayer = map.getLayers().item(0);
        const metersPerUnit = get("EPSG:3857").getMetersPerUnit();
        const sortedTileMatrix = [...tileMatrix].sort((a, b) => Number(b.ScaleDenominator) - Number(a.ScaleDenominator));
        const expectedResolutions = sortedTileMatrix.map(matrix => Number(matrix.ScaleDenominator) * 0.28E-3 / metersPerUnit);
        const tileGrid = wmtsLayer.getSource().getTileGrid();

        const resolutions = tileGrid.getResolutions();
        expect(resolutions.length).toBe(expectedResolutions.length);
        resolutions.map((v, i) => expect(v).toBe(expectedResolutions[i]));
    });
    it('limited Ids array should provide the same number resolutions, sizes (that have to match), even with wrong sorting...', () => {
        const tileMatrix = [{
            "ows:Identifier": "0",
            "ScaleDenominator": "17471320.75089746",
            "TopLeftCorner": "-46133.17 6301219.54",
            "TileWidth": "256",
            "TileHeight": "256",
            "MatrixWidth": "1",
            "MatrixHeight": "1"
        },
        {
            "ows:Identifier": "2",
            "ScaleDenominator": "4367830.187724365",
            "TopLeftCorner": "-46133.17 6301219.54",
            "TileWidth": "256",
            "TileHeight": "256",
            "MatrixWidth": "4",
            "MatrixHeight": "4"
        },
        {
            "ows:Identifier": "1",
            "ScaleDenominator": "8735660.37544873",
            "TopLeftCorner": "-46133.17 6301219.54",
            "TileWidth": "256",
            "TileHeight": "256",
            "MatrixWidth": "2",
            "MatrixHeight": "2"
        },
        {
            "ows:Identifier": "3",
            "ScaleDenominator": "2183915.0938621825",
            "TopLeftCorner": "-46133.17 6301219.54",
            "TileWidth": "256",
            "TileHeight": "256",
            "MatrixWidth": "8",
            "MatrixHeight": "8"
        }];
        const options = {
            type: 'wmts',
            visibility: false,
            name: 'nurc:Arc_Sample',
            group: 'Meteo',
            format: 'image/png',
            requestEncoding: "RESTful",
            matrixIds: {
                'EPSG:3857': [{
                    identifier: '0'
                }, {
                    identifier: '1'
                }]
            },
            tileMatrixSet: [
                {
                    'ows:Identifier': 'EPSG:3857',
                    'ows:SupportedCRS': 'urn:ogc:def:crs:EPSG::3857',
                    TileMatrix: tileMatrix
                }
            ],
            url: 'http://sample.server/geoserver/gwc/service/wmts'
        };
        ReactDOM.render(<OpenlayersLayer
            type="wmts"
            options={options}
            map={map}
        />, document.getElementById("container"));
        const wmtsLayer = map.getLayers().item(0);
        const metersPerUnit = get("EPSG:3857").getMetersPerUnit();
        const sortedTileMatrix = [...tileMatrix].sort((a, b) => Number(b.ScaleDenominator) - Number(a.ScaleDenominator));
        const expectedResolutions = sortedTileMatrix.map(matrix => Number(matrix.ScaleDenominator) * 0.28E-3 / metersPerUnit);
        const tileGrid = wmtsLayer.getSource().getTileGrid();
        const resolutions = tileGrid.getResolutions();
        expect(resolutions.length).toBe(2);
        resolutions.map((v, i) => expect(v).toBe(expectedResolutions[i]));
        // check the matrixids and resolutions match in order
        tileGrid.getMatrixIds().map((id, idx) => expect(id).toEqual(sortedTileMatrix[idx]["ows:Identifier"]));
    });
    it('test wmts custom crs', () => {
        const tileMatrix = [{
            "ows:Identifier": "0",
            "ScaleDenominator": "17471320.75089746",
            "TopLeftCorner": "-46133.17 6301219.54",
            "TileWidth": "256",
            "TileHeight": "256",
            "MatrixWidth": "1",
            "MatrixHeight": "1"
        },
        {
            "ows:Identifier": "1",
            "ScaleDenominator": "8735660.37544873",
            "TopLeftCorner": "-46133.17 6301219.54",
            "TileWidth": "256",
            "TileHeight": "256",
            "MatrixWidth": "2",
            "MatrixHeight": "2"
        },
        {
            "ows:Identifier": "2",
            "ScaleDenominator": "4367830.187724365",
            "TopLeftCorner": "-46133.17 6301219.54",
            "TileWidth": "256",
            "TileHeight": "256",
            "MatrixWidth": "4",
            "MatrixHeight": "4"
        },
        {
            "ows:Identifier": "3",
            "ScaleDenominator": "2183915.0938621825",
            "TopLeftCorner": "-46133.17 6301219.54",
            "TileWidth": "256",
            "TileHeight": "256",
            "MatrixWidth": "8",
            "MatrixHeight": "8"
        }];
        const options = {
            type: 'wmts',
            visibility: false,
            name: 'nurc:Arc_Sample',
            group: 'Meteo',
            format: 'image/png',
            requestEncoding: "RESTful",
            srs: "EPSG:25832",
            tileMatrixSet: [
                {
                    'ows:Identifier': 'EPSG:25832',
                    'ows:SupportedCRS': 'urn:ogc:def:crs:EPSG::25832',
                    TileMatrix: tileMatrix
                }
            ],
            url: 'http://sample.server/geoserver/gwc/service/wmts'
        };
        expect(Layers.isCompatible("wmts", options)).toBe(true);
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
    it('test crossOrigin is applied to tiled wms', () => {
        const options = {
            type: "wms",
            visibility: true,
            name: "nurc:Arc_Sample",
            group: "Meteo",
            format: "image/png",
            opacity: 1.0,
            singleTile: false,
            crossOrigin: "Anonymous",
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
        expect(layer.layer.getSource().crossOrigin).toBe("Anonymous");
    });
    it('test crossOrigin is applied to single tile wms', () => {
        const options = {
            type: "wms",
            visibility: true,
            name: "nurc:Arc_Sample",
            group: "Meteo",
            format: "image/png",
            opacity: 1.0,
            singleTile: true,
            crossOrigin: "Anonymous",
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
        expect(layer.layer.getSource().crossOrigin_).toBe("Anonymous");
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


    it('test wmts vector formats', () => {

        const options = {
            type: 'wmts',
            visibility: true,
            name: 'osm:vector_tile',
            group: 'Vector',
            tileMatrixSet: [
                {
                    'TileMatrix': [],
                    'ows:Identifier': 'EPSG:900913',
                    'ows:SupportedCRS': 'urn:ogc:def:crs:EPSG::900913'
                }
            ],
            url: 'http://sample.server/geoserver/gwc/service/wmts'
        };

        const GeoJSON = 'application/json;type=geojson';
        let layer = ReactDOM.render(<OpenlayersLayer
            type="wmts"
            options={{
                ...options,
                format: GeoJSON
            }}
            map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.getType()).toBe('VECTOR_TILE');
        expect(layer.layer.getSource().format_.constructor.name).toBe('GeoJSON');


        const MVT = 'application/vnd.mapbox-vector-tile';
        layer = ReactDOM.render(<OpenlayersLayer
            type="wmts"
            options={{
                ...options,
                format: MVT
            }}
            map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.getType()).toBe('VECTOR_TILE');
        expect(layer.layer.getSource().format_.constructor.name).toBe('MVT');

        const TopoJSON = 'application/json;type=topojson';
        layer = ReactDOM.render(<OpenlayersLayer
            type="wmts"
            options={{
                ...options,
                format: TopoJSON
            }}
            map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.getType()).toBe('VECTOR_TILE');
        expect(layer.layer.getSource().format_.constructor.name).toBe('TopoJSON');

    });
    // ******************************
    // WFS
    // ******************************
    const SAMPLE_FEATURE_COLLECTION = {
        "type": "FeatureCollection",
        "totalFeatures": 6,
        "features": [
            {
                "type": "Feature",
                "id": "poi.1",
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        -74.0104611,
                        40.70758763
                    ]
                },
                "properties": {
                    "NAME": "museam"
                }
            }
        ],
        "crs": {
            "type": "name",
            "properties": {
                "name": "urn:ogc:def:crs:EPSG::4326"
            }
        }
    };
    it('render wfs layer', (done) => {
        mockAxios.onGet().reply(r => {
            expect(r.url.indexOf('SAMPLE_URL') >= 0 ).toBeTruthy();
            return [200, SAMPLE_FEATURE_COLLECTION];
        });
        const options = {
            type: 'wfs',
            visibility: true,
            url: 'SAMPLE_URL',
            name: 'osm:vector_tile'
        };
        let layer;
        map.on('rendercomplete', () => {
            if (layer.layer.getSource().getFeatures().length > 0) {
                const f = layer.layer.getSource().getFeatures()[0];
                expect(f.getGeometry().getCoordinates()[0]).toBe(SAMPLE_FEATURE_COLLECTION.features[0].geometry.coordinates[0]);
                expect(f.getGeometry().getCoordinates()[1]).toBe(SAMPLE_FEATURE_COLLECTION.features[0].geometry.coordinates[1]);
                done();
            }
        });
        // first render
        layer = ReactDOM.render(<OpenlayersLayer
            type="wfs"
            options={{
                ...options
            }}
            map={map} />, document.getElementById("container"));
        expect(layer.layer.getSource()).toExist();
    });
    it('test second render wfs layer', (done) => {
        let clearCalled = false;
        mockAxios.onGet().reply(r => {
            // catch second rendering with params
            if (r.url.indexOf("CQL_FILTER=INCLUDE") > 0) {
                expect(clearCalled).toBeTruthy();
                return [200, SAMPLE_FEATURE_COLLECTION];
            }
            // first render returns empty features
            return [200, { ...SAMPLE_FEATURE_COLLECTION, features: []}];
        });
        const options = {
            type: 'wfs',
            visibility: true,
            url: 'SAMPLE_URL',
            name: 'osm:vector_tile'
        };
        // first render
        let layer = ReactDOM.render(<OpenlayersLayer
            type="wfs"
            options={{
                ...options
            }}
            map={map} />, document.getElementById("container"));
        expect(layer.layer.getSource()).toExist();
        layer.layer.getSource().on('clear', (a) => {
            expect(a).toExist();
            clearCalled = true;
        });
        map.on('rendercomplete', () => {
            if (layer.layer.getSource().getFeatures().length > 0) {
                const f = layer.layer.getSource().getFeatures()[0];
                expect(f.getGeometry().getCoordinates()[0]).toBe(SAMPLE_FEATURE_COLLECTION.features[0].geometry.coordinates[0]);
                expect(f.getGeometry().getCoordinates()[1]).toBe(SAMPLE_FEATURE_COLLECTION.features[0].geometry.coordinates[1]);
                done();
            }
        });
        // second render with custom params
        layer = ReactDOM.render(<OpenlayersLayer
            type="wfs"
            options={{
                ...options,
                params: { "CQL_FILTER": "INCLUDE" }
            }}
            map={map} />, document.getElementById("container"));
    });
    it('render wfs layer with FilterObj', (done) => {
        mockAxios.onGet().reply(r => {
            expect(r.url.indexOf('SAMPLE_URL') >= 0).toBeTruthy();
            const params = r.url.split("?")[1].split("&");
            const filterParam = params.filter(p => p.indexOf("CQL_FILTER") === 0)[0];
            if (filterParam) {
                const filterValue = decodeURIComponent(filterParam.split("=")[1]);
                expect(filterValue).toEqual((`("prop2" = 'value2')`));
                setTimeout( () => done(), 10);
                return [200, { ...SAMPLE_FEATURE_COLLECTION, features: [] }];
            }
            return [200, SAMPLE_FEATURE_COLLECTION];
        });
        const options = {
            type: 'wfs',
            visibility: true,
            url: 'SAMPLE_URL',
            name: 'osm:vector_tile',
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
        let layer;

        // first render
        layer = ReactDOM.render(<OpenlayersLayer
            type="wfs"
            options={{
                ...options
            }}
            map={map} />, document.getElementById("container"));
        expect(layer.layer.getSource()).toExist();
    });

    it('test render a wfs3 layer', () => {

        const options = {
            id: 'layer_id',
            name: 'layer_name',
            title: 'Layer Title',
            type: 'wfs3',
            visibility: true,
            url: '/geoserver/wfs3/collections/layer_name/tiles/{tilingSchemeId}/{level}/{row}/{col}',
            format: 'application/vnd.mapbox-vector-tile',
            tilingScheme: '/geoserver/wfs3/collections/layer_name/tiles/{tilingSchemeId}',
            tilingSchemes: {
                url: '/geoserver/wfs3/collections/layer_name/tiles',
                schemes: [
                    {
                        type: 'TileMatrixSet',
                        identifier: 'GoogleMapsCompatible',
                        title: 'GoogleMapsCompatible',
                        supportedCRS: 'EPSG:3857',
                        tileMatrix: [{
                            matrixHeight: 1,
                            matrixWidth: 1,
                            tileHeight: 256,
                            tileWidth: 256,
                            identifier: '0',
                            scaleDenominator: 559082263.9508929,
                            topLeftCorner: [
                                -20037508.34,
                                20037508
                            ],
                            type: 'TileMatrix'
                        }],
                        boundingBox: {
                            crs: 'http://www.opengis.net/def/crs/EPSG/0/3857',
                            lowerCorner: [
                                -20037508.34,
                                -20037508.34
                            ],
                            upperCorner: [
                                20037508.34,
                                20037508.34
                            ],
                            type: 'BoundingBox'
                        },
                        wellKnownScaleSet: 'http://www.opengis.net/def/wkss/OGC/1.0/GoogleMapsCompatible'
                    }
                ]
            },
            bbox: {
                crs: 'EPSG:4326',
                bounds: {
                    minx: -156.2575,
                    miny: -90,
                    maxx: 123.33333333333333,
                    maxy: 46.5475
                }
            },
            allowedSRS: {
                'EPSG:3857': true
            }
        };
        let layer = ReactDOM.render(<OpenlayersLayer
            type="wfs3"
            options={options}
            map={map}/>, document.getElementById("container"));

        expect(layer).toExist();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.getType()).toBe('VECTOR_TILE');
        expect(layer.layer.getSource().format_.constructor.name).toBe('MVT');
    });
});
