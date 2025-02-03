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
import { waitFor } from '@testing-library/react';
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
import '../plugins/ElevationLayer';
import '../plugins/ArcGISLayer';

import {
    setStore,
    setCredentials
} from '../../../../utils/SecurityUtils';
import ConfigUtils, { setConfigProp } from '../../../../utils/ConfigUtils';
import { ServerTypes } from '../../../../utils/LayersUtils';


import { Map, View } from 'ol';
import { defaults as defaultControls } from 'ol/control';

import axios from "../../../../libs/ajax";
import MockAdapter from "axios-mock-adapter";
import {get} from 'ol/proj';
import { getResolutions } from '../../../../utils/MapUtils';

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
        setConfigProp('miscSettings', { experimentalInteractiveLegend: true });
        mockAxios = new MockAdapter(axios);
        document.body.innerHTML = '<div id="map" style="width:200px;height:200px;"></div><div id="container"></div>';
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
        setConfigProp('miscSettings', { });
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

        expect(layer).toBeTruthy();
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

        expect(layer).toBeTruthy();
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

        expect(layer).toBeTruthy();
        // count layers
        expect(map.getLayers().getLength()).toBe(0);
    });
    it('creates a osm layer for openlayers map', () => {
        var options = {};
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="osm"
                options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toBeTruthy();
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

        expect(layer).toBeTruthy();
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


        expect(layer).toBeTruthy();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
        expect(map.getLayers().item(0).getSource().urls.length).toBe(1);
        expect(map.getLayers().item(0).getSource().getAttributions()).toBeFalsy();
    });
    it('creates a single tile wms layer for openlayers map with long url', (done) => {

        let options = {
            "type": "wms",
            "visibility": true,
            "maxLengthUrl": 2000,
            "singleTile": true,
            "name": "long:layerName",
            "group": "groupname",
            "format": "image/png",
            "params": {
                "CQL_FILTER": 'age=93.9 AND (INTERSECTS("the_geom",SRID=3857;Polygon((-11533148.77274199 4642479.349928465, -11534311.330457991 4679472.5362776555, -11537794.415521812 4716319.727420906, -11543584.281787973 4752875.504328652, -11551658.079299463 4788995.598050187, -11561983.944466071 4824537.459077292, -11574521.125815421 4859360.819922024, -11589220.144820424 4893328.248688412, -11606022.991168408 4926305.6914533535, -11624863.351701329 4958163.001316219, -11645666.872123504 4988774.4520291975, -11668351.450444052 5018019.234181368, -11692827.56099594 5045781.931978245, -11718998.60775289 5071952.978735196, -11746761.305549767 5096429.089287084, -11776006.087701939 5119113.667607632, -11806617.538414918 5139917.188029807, -11838474.848277781 5158757.548562728, -11871452.291042725 5175560.394910712, -11905419.719809111 5190259.413915714, -11940243.080653844 5202796.595265065, -11975784.94168095 5213122.460431673, -12011905.035402484 5221196.257943163, -12048460.81231023 5226986.124209325, -12085308.00345348 5230469.209273145, -12122301.18980267 5231631.766989145, -12159294.376151862 5230469.209273145, -12196141.567295112 5226986.124209325, -12232697.344202857 5221196.257943163, -12268817.437924393 5213122.460431673, -12304359.298951497 5202796.595265065, -12339182.65979623 5190259.413915714, -12373150.088562617 5175560.394910712, -12406127.53132756 5158757.548562728, -12437984.841190424 5139917.188029807, -12468596.291903403 5119113.667607632, -12497841.074055575 5096429.089287084, -12525603.771852452 5071952.978735196, -12551774.818609402 5045781.931978245, -12576250.92916129 5018019.234181368, -12598935.507481838 4988774.4520291975, -12619739.027904013 4958163.001316219, -12638579.388436934 4926305.6914533535, -12655382.234784918 4893328.248688412, -12670081.25378992 4859360.819922024, -12682618.43513927 4824537.459077292, -12692944.300305879 4788995.598050187, -12701018.097817369 4752875.504328652, -12706807.96408353 4716319.727420906, -12710291.04914735 4679472.5362776555, -12711453.606863352 4642479.349928465, -12710291.04914735 4605486.163579274, -12706807.96408353 4568638.972436024, -12701018.097817369 4532083.195528277, -12692944.300305879 4495963.101806743, -12682618.43513927 4460421.240779637, -12670081.25378992 4425597.879934905, -12655382.234784918 4391630.4511685185, -12638579.388436934 4358653.008403576, -12619739.027904013 4326795.698540711, -12598935.507481838 4296184.247827733, -12576250.92916129 4266939.465675562, -12551774.818609402 4239176.767878684, -12525603.771852452 4213005.721121733, -12497841.074055573 4188529.6105698454, -12468596.291903403 4165845.0322492975, -12437984.841190424 4145041.511827122, -12406127.53132756 4126201.151294202, -12373150.088562617 4109398.3049462177, -12339182.65979623 4094699.2859412157, -12304359.298951497 4082162.104591864, -12268817.437924393 4071836.239425257, -12232697.344202857 4063762.441913767, -12196141.567295112 4057972.5756476047, -12159294.376151862 4054489.490583785, -12122301.18980267 4053326.932867784, -12085308.00345348 4054489.490583785, -12048460.81231023 4057972.5756476047, -12011905.035402484 4063762.441913767, -11975784.94168095 4071836.239425257, -11940243.080653844 4082162.104591864, -11905419.719809111 4094699.285941215, -11871452.291042725 4109398.3049462177, -11838474.848277781 4126201.151294202, -11806617.538414918 4145041.5118271224, -11776006.087701939 4165845.032249297, -11746761.305549769 4188529.6105698454, -11718998.607752891 4213005.721121733, -11692827.56099594 4239176.767878684, -11668351.450444052 4266939.465675562, -11645666.872123504 4296184.247827732, -11624863.351701329 4326795.698540711, -11606022.991168408 4358653.008403575, -11589220.144820424 4391630.451168518, -11574521.125815421 4425597.879934905, -11561983.944466071 4460421.240779637, -11551658.079299463 4495963.101806742, -11543584.281787973 4532083.195528277, -11537794.415521812 4568638.972436024, -11534311.330457991 4605486.163579274, -11533148.77274199 4642479.349928465))))'
            },
            "url": 'https://sample.com/geoserver/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fvnd.jpeg-png8&TRANSPARENT=true&LAYERS=workspace%3Agdy_pet_sys&STYLES=&SRS=EPSG%3A4326&CRS=EPSG%3A4326&TILED=false&authkey=9cf6ff4e-2529-40cb-9ff8-f142c550b579&WIDTH=1410&HEIGHT=497&BBOX=17.68798828125%2C-78.2666015625%2C39.52880859375%2C-16.3037109375'
        };
        mockAxios.onPost().reply(() => {
            expect(true).toBeTruthy();
            done();
            return [200, {data: {}}, {"content-type": "image/png"}];
        });
        const layer = ReactDOM.render(
            <OpenlayersLayer
                type="wms"
                options={options}
                map={map}/>,
            document.getElementById("container")
        );
        expect(layer).toBeTruthy();
        expect(map.getLayers().getLength()).toBe(1);
    });
    it('render wms singleTile layer with error', (done) => {
        mockAxios.onGet().reply(r => {
            expect(r.url.indexOf('SAMPLE_URL') >= 0 ).toBeTruthy();
            return [200, "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
            "<ows:ExceptionReport xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n" +
            "  <ows:Exception exceptionCode=\"InvalidParameterValue\" locator=\"srsname\">\n" +
            "    <ows:ExceptionText>msWFSGetFeature(): WFS server error. Invalid GetFeature Request</ows:ExceptionText>\n" +
            "  </ows:Exception>\n" +
            "</ows:ExceptionReport>"];
        });
        const options = {
            type: 'wms',
            visibility: true,
            singleTile: true,
            url: 'SAMPLE_URL',
            name: 'osm:vector_tile'
        };
        const layer = ReactDOM.render(<OpenlayersLayer
            type="wms"
            options={{
                ...options
            }}
            map={map} />, document.getElementById("container"));
        expect(layer.layer.getSource()).toBeTruthy();
        layer.layer.getSource().on('imageloaderror', (e)=> {
            setTimeout(() => {
                expect(e).toBeTruthy();
                done();
            }, 200);
        });
    });
    it('creates a tiled wms layer for openlayers map with long url', (done) => {
        let options = {
            "type": "wms",
            "visibility": true,
            "singleTile": false,
            "tiled": true,
            "maxLengthUrl": 2000,
            "name": "long:layerName",
            "group": "groupname",
            "format": "image/png",
            "params": {
                "CQL_FILTER": 'age=93.9 AND (INTERSECTS("the_geom",SRID=3857;Polygon((-11533148.77274199 4642479.349928465, -11534311.330457991 4679472.5362776555, -11537794.415521812 4716319.727420906, -11543584.281787973 4752875.504328652, -11551658.079299463 4788995.598050187, -11561983.944466071 4824537.459077292, -11574521.125815421 4859360.819922024, -11589220.144820424 4893328.248688412, -11606022.991168408 4926305.6914533535, -11624863.351701329 4958163.001316219, -11645666.872123504 4988774.4520291975, -11668351.450444052 5018019.234181368, -11692827.56099594 5045781.931978245, -11718998.60775289 5071952.978735196, -11746761.305549767 5096429.089287084, -11776006.087701939 5119113.667607632, -11806617.538414918 5139917.188029807, -11838474.848277781 5158757.548562728, -11871452.291042725 5175560.394910712, -11905419.719809111 5190259.413915714, -11940243.080653844 5202796.595265065, -11975784.94168095 5213122.460431673, -12011905.035402484 5221196.257943163, -12048460.81231023 5226986.124209325, -12085308.00345348 5230469.209273145, -12122301.18980267 5231631.766989145, -12159294.376151862 5230469.209273145, -12196141.567295112 5226986.124209325, -12232697.344202857 5221196.257943163, -12268817.437924393 5213122.460431673, -12304359.298951497 5202796.595265065, -12339182.65979623 5190259.413915714, -12373150.088562617 5175560.394910712, -12406127.53132756 5158757.548562728, -12437984.841190424 5139917.188029807, -12468596.291903403 5119113.667607632, -12497841.074055575 5096429.089287084, -12525603.771852452 5071952.978735196, -12551774.818609402 5045781.931978245, -12576250.92916129 5018019.234181368, -12598935.507481838 4988774.4520291975, -12619739.027904013 4958163.001316219, -12638579.388436934 4926305.6914533535, -12655382.234784918 4893328.248688412, -12670081.25378992 4859360.819922024, -12682618.43513927 4824537.459077292, -12692944.300305879 4788995.598050187, -12701018.097817369 4752875.504328652, -12706807.96408353 4716319.727420906, -12710291.04914735 4679472.5362776555, -12711453.606863352 4642479.349928465, -12710291.04914735 4605486.163579274, -12706807.96408353 4568638.972436024, -12701018.097817369 4532083.195528277, -12692944.300305879 4495963.101806743, -12682618.43513927 4460421.240779637, -12670081.25378992 4425597.879934905, -12655382.234784918 4391630.4511685185, -12638579.388436934 4358653.008403576, -12619739.027904013 4326795.698540711, -12598935.507481838 4296184.247827733, -12576250.92916129 4266939.465675562, -12551774.818609402 4239176.767878684, -12525603.771852452 4213005.721121733, -12497841.074055573 4188529.6105698454, -12468596.291903403 4165845.0322492975, -12437984.841190424 4145041.511827122, -12406127.53132756 4126201.151294202, -12373150.088562617 4109398.3049462177, -12339182.65979623 4094699.2859412157, -12304359.298951497 4082162.104591864, -12268817.437924393 4071836.239425257, -12232697.344202857 4063762.441913767, -12196141.567295112 4057972.5756476047, -12159294.376151862 4054489.490583785, -12122301.18980267 4053326.932867784, -12085308.00345348 4054489.490583785, -12048460.81231023 4057972.5756476047, -12011905.035402484 4063762.441913767, -11975784.94168095 4071836.239425257, -11940243.080653844 4082162.104591864, -11905419.719809111 4094699.285941215, -11871452.291042725 4109398.3049462177, -11838474.848277781 4126201.151294202, -11806617.538414918 4145041.5118271224, -11776006.087701939 4165845.032249297, -11746761.305549769 4188529.6105698454, -11718998.607752891 4213005.721121733, -11692827.56099594 4239176.767878684, -11668351.450444052 4266939.465675562, -11645666.872123504 4296184.247827732, -11624863.351701329 4326795.698540711, -11606022.991168408 4358653.008403575, -11589220.144820424 4391630.451168518, -11574521.125815421 4425597.879934905, -11561983.944466071 4460421.240779637, -11551658.079299463 4495963.101806742, -11543584.281787973 4532083.195528277, -11537794.415521812 4568638.972436024, -11534311.330457991 4605486.163579274, -11533148.77274199 4642479.349928465))))'
            },
            "url": 'https://sample.com/geoserver/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fvnd.jpeg-png8&TRANSPARENT=true&LAYERS=workspace%3Agdy_pet_sys&STYLES=&SRS=EPSG%3A4326&CRS=EPSG%3A4326&TILED=false&authkey=9cf6ff4e-2529-40cb-9ff8-f142c550b579&WIDTH=1410&HEIGHT=497&BBOX=17.68798828125%2C-78.2666015625%2C39.52880859375%2C-16.3037109375'
        };
        mockAxios.onPost().reply(() => {
            expect(true).toBeTruthy();
            done();
            return [200, {data: {}}, {"content-type": "image/png"}];
        });

        const layer = ReactDOM.render(
            <OpenlayersLayer
                type="wms"
                options={options}
                map={map}/>,
            document.getElementById("container")
        );
        expect(layer).toBeTruthy();
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

        expect(layer).toBeTruthy();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.constructor.name).toBe('VectorTileLayer');
        expect(layer.layer.getSource().format_.constructor.name).toBe('GeoJSON');

        layer = ReactDOM.render(<OpenlayersLayer
            type="wms"
            options={{
                ...options,
                format: 'application/vnd.mapbox-vector-tile'
            }}
            map={map} />, document.getElementById("container"));
        expect(layer).toBeTruthy();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.constructor.name).toBe('VectorTileLayer');
        expect(layer.layer.getSource().format_.constructor.name).toBe('MVT');

        layer = ReactDOM.render(<OpenlayersLayer
            type="wms"
            options={{
                ...options,
                format: 'application/json;type=topojson'
            }}
            map={map} />, document.getElementById("container"));

        expect(layer).toBeTruthy();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.constructor.name).toBe('VectorTileLayer');
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

        expect(layer).toBeTruthy();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.constructor.name).toBe('VectorTileLayer');
        expect(layer.layer.getSource().format_.constructor.name).toBe('GeoJSON');
        setTimeout(() => {
            const style = layer.layer.getStyle();
            expect(style).toBeTruthy();
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

        expect(layer).toBeTruthy();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.constructor.name).toBe('VectorTileLayer');
        expect(layer.layer.getSource().format_.constructor.name).toBe('GeoJSON');
        waitFor(() => {
            const style = layer.layer.getStyle()()[0];
            expect(style).toBeTruthy();
            expect(style.getStroke().getColor()).toBe('#FF0000');
            // currently SLD parser use fillOpacity instead of opacity
            // and probably this cause wrong parsing of opacity
            // added a wrapper to the openlayers parser to manage the issue related to opacity
            return expect(style.getFill().getColor()).toBe('rgba(255, 255, 0, 0.5)');
        })
            .then(() => done())
            .catch(done);
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

        expect(layer).toBeTruthy();
        // check creation
        expect(map.getLayers().getLength()).toBe(1);
        expect(map.getLayers().item(0).getSource().urls.length).toBe(1);
        expect(map.getLayers().item(0).getSource().getAttributions()).toBeTruthy();
        expect(map.getLayers().item(0).getSource().getAttributions()()[0]).toBe(TEXT1);
        // check remove
        ReactDOM.render(
            <OpenlayersLayer type="wms"
                options={{...options, credits: undefined}} map={map} />, document.getElementById("container"));
        expect(map.getLayers().item(0).getSource().getAttributions()).toBeFalsy();
        // check update
        ReactDOM.render(
            <OpenlayersLayer type="wms"
                options={{ ...options, credits: {title: TEXT2} }} map={map} />, document.getElementById("container"));
        expect(map.getLayers().item(0).getSource().getAttributions()).toBeTruthy();
        expect(map.getLayers().item(0).getSource().getAttributions()()[0]).toBe(TEXT2);
        // check content update
        ReactDOM.render(
            <OpenlayersLayer type="wms"
                options={options} map={map} />, document.getElementById("container"));
        expect(map.getLayers().item(0).getSource().getAttributions()).toBeTruthy();
        expect(map.getLayers().item(0).getSource().getAttributions()()[0]).toBe(TEXT1);
        // check complex contents
        ReactDOM.render(
            <OpenlayersLayer type="wms"
                options={{...options, credits: CREDITS1}} map={map} />, document.getElementById("container"));
        expect(map.getLayers().item(0).getSource().getAttributions()).toBeTruthy();
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

        expect(layer).toBeTruthy();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
        expect(map.getLayers().item(0).get('getElevation')).toBeTruthy();
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

        expect(layer).toBeTruthy();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
        expect(map.getLayers().item(0).getSource().getUrl()).toBeTruthy();
        expect(map.getLayers().item(0).getSource().getAttributions()).toBeFalsy();
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

        expect(layer).toBeTruthy();
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

        expect(layer).toBeTruthy();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
        expect(map.getLayers().item(0).getSource().getUrl()).toBeTruthy();
        expect(map.getLayers().item(0).getSource().getAttributions()).toBeTruthy();
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

        expect(layer).toBeTruthy();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
        expect(map.getLayers().item(0).getSource().getUrl()).toBeTruthy();
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

        expect(layer).toBeTruthy();
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


        expect(layer).toBeTruthy();
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


        expect(layer).toBeTruthy();
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


        expect(layer).toBeTruthy();
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


        expect(layer).toBeTruthy();
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


        expect(layer).toBeTruthy();
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


        expect(layer).toBeTruthy();
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


        expect(layer).toBeTruthy();
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


        expect(layer).toBeTruthy();
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

        expect(layer).toBeTruthy();
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

        expect(layer).toBeTruthy();
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


        expect(layer).toBeTruthy();
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


        expect(layer).toBeTruthy();
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


        expect(layer).toBeTruthy();
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


        expect(layer).toBeTruthy();
        expect(layer.layer).toBeTruthy();
    });

    describe('Google layer', () => {
        it('layer creator returns null without failing if window.google doesn\'t exist', () => {
            var options = {
                "type": "google",
                "name": "ROADMAP",
                "visibility": true
            };
            window.google = undefined;
            let layer = ReactDOM.render(
                <OpenlayersLayer type="google" options={options} map={map} mapId="map"/>, document.getElementById("container"));
            expect(layer).toBeTruthy(); // no exception on creation
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

            expect(layer).toBeTruthy();
            // count layers
            // google maps does not create a real ol layer, it is just injecting a gmaps api layer into DOM
            expect(map.getLayers().getLength()).toBe(0);
        });
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

        expect(layer).toBeTruthy();

        expect(document.getElementById('overlay-1-overlay')).toBeTruthy();
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

        expect(layer).toBeTruthy();
        const overlayElement = document.getElementById('overlay-1-overlay');
        expect(overlayElement).toBeTruthy();
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

        expect(layer).toBeTruthy();
        const overlayElement = document.getElementById('overlay-1-overlay');
        expect(overlayElement).toBeTruthy();
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

        expect(layer).toBeTruthy();
        const overlayElement = document.getElementById('overlay-1-overlay');
        expect(overlayElement.getAttribute('data-reactid')).toBeFalsy();
        const close = overlayElement.getElementsByClassName('close')[0];
        expect(close.getAttribute('data-reactid')).toBeFalsy();
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

        expect(layer).toBeTruthy();
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

        expect(layer).toBeTruthy();
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

        expect(layer).toBeTruthy();
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

        expect(layer).toBeTruthy();
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

        expect(layer).toBeTruthy();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);
    });
    it('creates a vector layer for openlayers map with interactive legend filter', () => {
        const options = {
            type: 'vector',
            features: [
                { type: 'Feature', properties: { "prop1": 0 }, geometry: { type: 'Point', coordinates: [0, 0] } },
                { type: 'Feature', properties: { "prop1": 2 }, geometry: { type: 'Point', coordinates: [1, 0] } },
                { type: 'Feature', properties: { "prop1": 5 }, geometry: { type: 'Point', coordinates: [2, 0] } }
            ],
            title: 'Title',
            visibility: true,
            bbox: {
                crs: 'EPSG:4326',
                bounds: {
                    minx: -180,
                    miny: -90,
                    maxx: 180,
                    maxy: 90
                }
            },
            enableInteractiveLegend: true,
            layerFilter: {
                filters: [{
                    "id": "interactiveLegend",
                    "format": "logic",
                    "version": "1.0.0",
                    "logic": "OR",
                    "filters": [
                        {
                            "format": "geostyler",
                            "version": "1.0.0",
                            "body": [
                                "&&",
                                [
                                    ">",
                                    "prop1",
                                    "0"
                                ], [
                                    "<",
                                    "prop1",
                                    "3"
                                ]
                            ],
                            "id": "&&,>,prop1,0,<,prop1,3"
                        }
                    ]
                }]
            }
        };
        // create layers
        var layer = ReactDOM.render(
            <OpenlayersLayer type="vector"
                options={options} map={map}/>, document.getElementById("container"));

        expect(layer).toBeTruthy();
        // count layers
        const renderedFeatsNum = map.getLayers().getLength();
        const filteredFeatsNum = 1;
        expect(renderedFeatsNum).toEqual(filteredFeatsNum);
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

        expect(layer).toBeTruthy();
        // count layers
        // google maps does not create a real ol layer, it is just injecting a gmaps api layer into DOM
        expect(map.getLayers().getLength()).toBe(0);
        let div = document.getElementById("mapgmaps");
        expect(div).toBeTruthy();

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

        expect(layer).toBeTruthy();
        map.getView().setRotation(Math.PI / 2.0);

        let viewport = map.getViewport();
        viewport.dispatchEvent(new MouseEvent('mousedown'));
        viewport.dispatchEvent(new MouseEvent('mousemove'));
        viewport.dispatchEvent(new MouseEvent('mouseup'));

        let dom = document.getElementById("mapgmaps");
        expect(dom).toBeTruthy();
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

        expect(layer).toBeTruthy();
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

        expect(layer).toBeTruthy();
        expect(layer.layer).toBeTruthy();
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

        expect(layer).toBeTruthy();
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

        expect(layer).toBeTruthy();
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

        expect(layer).toBeTruthy();
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

        expect(layer).toBeTruthy();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);

        expect(layer.layer.getSource()).toBeTruthy();
        expect(layer.layer.getSource().getParams()).toBeTruthy();
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

        expect(layer).toBeTruthy();
        const source = layer.layer.getSource();
        const spy = expect.spyOn(source.tileCache, "pruneExceptNewestZ");
        // count layers
        expect(map.getLayers().getLength()).toBe(1);

        expect(source).toBeTruthy();
        expect(source.getParams()).toBeTruthy();
        expect(source.getParams().cql_filter).toBe("INCLUDE");

        layer = ReactDOM.render(
            <OpenlayersLayer type="wms" observables={["cql_filter"]}
                options={assign({}, options, { params: { cql_filter: "EXCLUDE" } })} map={map} />, document.getElementById("container"));
        expect(source.getParams().cql_filter).toBe("EXCLUDE");

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
        expect(layer).toBeTruthy();
        let source = layer.layer.getSource();
        const spy = expect.spyOn(source.tileCache, "pruneExceptNewestZ");
        // count layers
        expect(map.getLayers().getLength()).toBe(1);

        expect(layer.layer.getSource()).toBeTruthy();
        expect(layer.layer.getSource().getParams()).toBeTruthy();
        expect(layer.layer.getSource().getParams().cql_filter).toBe("INCLUDE");

        layer = ReactDOM.render(
            <OpenlayersLayer type="wms" observables={["cql_filter"]}
                options={assign({}, options, { params: { time: "2019-01-01T00:00:00Z", ...options.params } })} map={map} />, document.getElementById("container"));

        expect(spy).toHaveBeenCalled();
        expect(source.getParams().time).toBe("2019-01-01T00:00:00Z");
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

        expect(layer).toBeTruthy();
        // count layers
        expect(map.getLayers().getLength()).toBe(1);

        expect(layer.layer.getSource()).toBeTruthy();
        expect(layer.layer.getSource().getParams()).toBeTruthy();
        expect(layer.layer.getSource().getParams().STYLES).toBe("");

        layer = ReactDOM.render(
            <OpenlayersLayer type="wms"
                options={assign({}, options, { format: "image/jpeg" })} map={map} />, document.getElementById("container"));

        expect(layer.layer.getSource().getParams().STYLES).toBe("");
    });
    it("test wms security token as bearer header", (done) => {
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
                method: 'bearer'
            }
        ]);

        setStore({
            getState: () => ({
                security: {
                    token: "########-####-####-####-###########"
                }
            })
        });
        mockAxios.onGet().reply((config) => {
            expect(config.headers.Authorization).toBe("Bearer ########-####-####-####-###########");
            done();
            return [200, {data: {}}, {"content-type": "image/png"}];
        });
        let layer = ReactDOM.render(<OpenlayersLayer
            type="wms"
            options={options}
            map={map}
            securityToken="########-####-####-####-###########" />, document.getElementById("container"));
        expect(layer).toBeTruthy();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.getSource()).toBeTruthy();
        expect(layer.layer.getSource().getParams()['ms2-authkey']).toBeFalsy();
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

        setStore({
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

        expect(layer).toBeTruthy();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.getSource()).toBeTruthy();
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

        setStore({
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

        expect(layer).toBeTruthy();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.getSource()).toBeTruthy();
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

    it('test wmts custom attributions', () => {
        const options = {
            type: 'wmts',
            visibility: true,
            name: 'nurc:Arc_Sample',
            credits: {
                title: "<p>This is some Attribution <b>TEXT</b></p>"
            },
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
        expect(map.getLayers().item(0).getSource().getAttributions()()[0]).toBe(options.credits.title);
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

        setStore({
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

        expect(layer).toBeTruthy();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.getSource().getUrls().map(u => decodeURIComponent(u))).toEqual(["http://sample.server/geoserver/gwc/service/wmts?ms2-authkey=########-####-####-####-###########"]);

        layer = ReactDOM.render(<OpenlayersLayer
            type="wmts"
            options={options}
            map={map}
            securityToken=""/>, document.getElementById("container"));
        expect(layer).toBeTruthy();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.getSource().getUrls().map(u => decodeURIComponent(u))).toEqual(["http://sample.server/geoserver/gwc/service/wmts"]);


        layer = ReactDOM.render(<OpenlayersLayer
            type="wmts"
            options={options}
            map={map}
            securityToken="########-####-$$$$-####-###########"/>, document.getElementById("container"));

        expect(layer).toBeTruthy();
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

        expect(layer).toBeTruthy();
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

        expect(layer).toBeTruthy();
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

        expect(layer).toBeTruthy();
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

        expect(layer).toBeTruthy();

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
        expect(layer).toBeTruthy();
        expect(layer.layer.getSource().getParams().CQL_FILTER).toBe("(\"prop2\" = 'value2')");
        layer = ReactDOM.render(<OpenlayersLayer
            type="wms"
            options={{...options, filterObj: undefined}}
            map={map}
        />, document.getElementById("container"));
        expect(layer).toBeTruthy();
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

        expect(layer).toBeTruthy();

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

        expect(layer).toBeTruthy();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.constructor.name).toBe('VectorTileLayer');
        expect(layer.layer.getSource().format_.constructor.name).toBe('GeoJSON');


        const MVT = 'application/vnd.mapbox-vector-tile';
        layer = ReactDOM.render(<OpenlayersLayer
            type="wmts"
            options={{
                ...options,
                format: MVT
            }}
            map={map}/>, document.getElementById("container"));

        expect(layer).toBeTruthy();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.constructor.name).toBe('VectorTileLayer');
        expect(layer.layer.getSource().format_.constructor.name).toBe('MVT');

        const TopoJSON = 'application/json;type=topojson';
        layer = ReactDOM.render(<OpenlayersLayer
            type="wmts"
            options={{
                ...options,
                format: TopoJSON
            }}
            map={map}/>, document.getElementById("container"));

        expect(layer).toBeTruthy();
        expect(map.getLayers().getLength()).toBe(1);
        expect(layer.layer.constructor.name).toBe('VectorTileLayer');
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
        expect(layer.layer.getSource()).toBeTruthy();
    });
    it('render wfs layer with legacy style', (done) => {
        mockAxios.onGet().reply(r => {
            expect(r.url.indexOf('SAMPLE_URL') >= 0 ).toBeTruthy();
            return [200, SAMPLE_FEATURE_COLLECTION];
        });
        const options = {
            type: 'wfs',
            visibility: true,
            url: 'SAMPLE_URL',
            name: 'osm:vector_tile',
            style: {
                color: 'rgba(0, 0, 255, 1)',
                fillColor: 'rgba(0, 0, 255, 0.1)',
                fillOpacity: 0.1,
                opacity: 1,
                radius: 10,
                weight: 1
            }
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
        expect(layer.layer.getSource()).toBeTruthy();
    });
    it('render wfs layer with error', () => {
        mockAxios.onGet().reply(r => {
            expect(r.url.indexOf('SAMPLE_URL') >= 0 ).toBeTruthy();
            return [200, "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
            "<ows:ExceptionReport xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n" +
            "  <ows:Exception exceptionCode=\"InvalidParameterValue\" locator=\"srsname\">\n" +
            "    <ows:ExceptionText>msWFSGetFeature(): WFS server error. Invalid GetFeature Request</ows:ExceptionText>\n" +
            "  </ows:Exception>\n" +
            "</ows:ExceptionReport>"];
        });
        const options = {
            type: 'wfs',
            visibility: true,
            url: 'SAMPLE_URL',
            name: 'osm:vector_tile'
        };
        const layer = ReactDOM.render(<OpenlayersLayer
            type="wfs"
            options={{
                ...options
            }}
            map={map} />, document.getElementById("container"));
        expect(layer.layer.getSource()).toBeTruthy();
        layer.layer.getSource().on('vectorerror', (e)=>{
            expect(e).toBeTruthy();
        });
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
        expect(layer.layer.getSource()).toBeTruthy();
        layer.layer.getSource().on('clear', (a) => {
            expect(a).toBeTruthy();
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
        expect(layer.layer.getSource()).toBeTruthy();
    });

    it('should apply native ol min and max resolution on wms layer', () => {
        const minResolution = 1222; // ~ zoom 7 Web Mercator
        const maxResolution = 39135; // ~ zoom 2 Web Mercator
        const resolutions = getResolutions();
        const options = {
            type: 'wms',
            visibility: true,
            name: 'nurc:Arc_Sample',
            group: 'Meteo',
            format: 'image/png8',
            url: 'http://localhost:8080/geoserver/wms'
        };
        let layer = ReactDOM.render(
            <OpenlayersLayer
                type="wms"
                options={{
                    ...options,
                    minResolution,
                    maxResolution
                }}
                map={map}
                resolutions={resolutions}
            />, document.getElementById("container"));

        expect(layer.layer).toBeTruthy();
        expect(layer.layer.getMinResolution()).toBe(minResolution);
        expect(layer.layer.getMaxResolution()).toBe(maxResolution);

        layer = ReactDOM.render(
            <OpenlayersLayer
                type="wms"
                options={options}
                map={map}
                resolutions={resolutions}
            />, document.getElementById("container"));

        expect(layer.layer.getMinResolution()).toBe(0);
        expect(layer.layer.getMaxResolution()).toBe(Infinity);
    });

    it('should apply native ol min and max resolution on wmts layer', () => {
        const minResolution = 1222; // ~ zoom 7 Web Mercator
        const maxResolution = 39135; // ~ zoom 2 Web Mercator
        const resolutions = getResolutions();
        const options = {
            type: 'wmts',
            visibility: true,
            name: 'nurc:Arc_Sample',
            group: 'Meteo',
            format: 'image/png8',
            url: 'http://localhost:8080/geoserver/gwc/service/wmts',
            tileMatrixSet: [
                {
                    "TileMatrix": [],
                    "ows:Identifier": "EPSG:900913",
                    "ows:SupportedCRS": "urn:ogc:def:crs:EPSG::900913"
                }
            ]
        };
        let layer = ReactDOM.render(
            <OpenlayersLayer
                type="wmts"
                options={{
                    ...options,
                    minResolution,
                    maxResolution
                }}
                map={map}
                resolutions={resolutions}
            />, document.getElementById("container"));

        expect(layer.layer).toBeTruthy();
        expect(layer.layer.getMinResolution()).toBe(minResolution);
        expect(layer.layer.getMaxResolution()).toBe(maxResolution);

        layer = ReactDOM.render(
            <OpenlayersLayer
                type="wmts"
                options={options}
                map={map}
                resolutions={resolutions}
            />, document.getElementById("container"));

        expect(layer.layer.getMinResolution()).toBe(0);
        expect(layer.layer.getMaxResolution()).toBe(Infinity);
    });

    it('should apply native ol min and max resolution on wfs layer', (done) => {
        mockAxios.onGet().reply(r => {
            expect(r.url.indexOf('SAMPLE_URL') >= 0 ).toBeTruthy();
            return [200, SAMPLE_FEATURE_COLLECTION];
        });
        const minResolution = 1222; // ~ zoom 7 Web Mercator
        const maxResolution = 39135; // ~ zoom 2 Web Mercator
        const resolutions = getResolutions();
        const options = {
            type: 'wfs',
            visibility: true,
            url: 'SAMPLE_URL',
            name: 'osm:vector_tile'
        };
        let layer;
        map.on('rendercomplete', () => {
            if (layer.layer.getSource().getFeatures().length > 0) {
                expect(layer.layer.getMinResolution()).toBe(minResolution);
                expect(layer.layer.getMaxResolution()).toBe(maxResolution);
                done();
            }
        });
        // first render
        layer = ReactDOM.render(<OpenlayersLayer
            type="wfs"
            options={{
                ...options,
                minResolution,
                maxResolution
            }}
            map={map}
            resolutions={resolutions}/>, document.getElementById("container"));
        expect(layer.layer.getSource()).toBeTruthy();
    });

    describe('WFS', () => {
        // this function create a WFS layer with the given options.
        const createWFSLayerTest = (options, done, onRenderComplete = () => {}, checkFeatures = true) => {
            let layer;
            map.on('rendercomplete', () => {
                if (layer.layer.getSource().getFeatures().length > 0 && checkFeatures) {
                    const f = layer.layer.getSource().getFeatures()[0];
                    expect(f.getGeometry().getCoordinates()[0]).toBe(SAMPLE_FEATURE_COLLECTION.features[0].geometry.coordinates[0]);
                    expect(f.getGeometry().getCoordinates()[1]).toBe(SAMPLE_FEATURE_COLLECTION.features[0].geometry.coordinates[1]);
                    onRenderComplete(layer);
                }
                done();
            });
            // first render
            layer = ReactDOM.render(<OpenlayersLayer
                type="wfs"
                options={{
                    ...options
                }}
                map={map} />, document.getElementById("container"));
            expect(layer.layer.getSource()).toBeTruthy();
        };
        describe('serverType: no-vendor', () => {
            it('test basic post request', (done) => {
                mockAxios.onPost().reply(({
                    url,
                    data,
                    method
                }) => {
                    expect(url.indexOf('SAMPLE_URL') >= 0).toBeTruthy();
                    expect(method).toBe('post');
                    expect(data).toContain('<wfs:GetFeature');
                    expect(data).toContain('<wfs:Query typeName="osm:vector_tile"');
                    return [200, SAMPLE_FEATURE_COLLECTION];
                });
                createWFSLayerTest({
                    type: 'wfs',
                    visibility: true,
                    url: 'SAMPLE_URL',
                    name: 'osm:vector_tile',
                    serverType: ServerTypes.NO_VENDOR
                }, done);
            });
            it('test layerFilter', (done) => {
                mockAxios.onPost().reply(({
                    url,
                    data,
                    method
                }) => {
                    expect(url.indexOf('SAMPLE_URL') >= 0).toBeTruthy();
                    expect(method).toBe('post');
                    expect(data).toContain('<wfs:GetFeature');
                    expect(data).toContain('<wfs:Query typeName="osm:vector_tile"');
                    expect(data).toContain(
                        '<ogc:Filter>'
                        + '<ogc:And>'
                            + '<ogc:PropertyIsEqualTo><ogc:PropertyName>a</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo>'
                        + '</ogc:And>'
                    + '</ogc:Filter>');

                    return [200, SAMPLE_FEATURE_COLLECTION];
                });
                createWFSLayerTest({
                    type: 'wfs',
                    visibility: true,
                    url: 'SAMPLE_URL',
                    name: 'osm:vector_tile',
                    serverType: ServerTypes.NO_VENDOR,
                    layerFilter: {
                        filters: [{
                            format: 'cql',
                            body: 'a = 1'
                        }]
                    }
                }, done);
            });
            it('test strategy "bbox"', (done) => {
                mockAxios.onPost().reply(({
                    url,
                    data,
                    method
                }) => {
                    expect(url.indexOf('SAMPLE_URL') >= 0).toBeTruthy();
                    expect(method).toBe('post');
                    expect(data).toContain('<wfs:GetFeature');
                    expect(data).toContain('<wfs:Query typeName="osm:vector_tile"');
                    expect(data).toContain('<ogc:PropertyIsEqualTo><ogc:PropertyName>a</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo>');
                    expect(data).toContain('<ogc:BBOX>');

                    return [200, SAMPLE_FEATURE_COLLECTION];
                });
                createWFSLayerTest({
                    type: 'wfs',
                    visibility: true,
                    url: 'SAMPLE_URL',
                    strategy: 'bbox',
                    name: 'osm:vector_tile',
                    serverType: ServerTypes.NO_VENDOR,
                    layerFilter: {
                        filters: [{
                            format: 'cql',
                            body: 'a = 1'
                        }]
                    }
                }, done);
            });
            it('test security basic authentication', (done) => {
                mockAxios.onPost().reply(({
                    url,
                    method,
                    headers
                }) => {
                    expect(url.indexOf('SAMPLE_URL') >= 0).toBeTruthy();
                    expect(method).toBe('post');
                    expect(headers.Authorization).toEqual(`Basic ${btoa("test:test")}`);
                    return [200, SAMPLE_FEATURE_COLLECTION];
                });
                setCredentials("TEST_SOURCE", {username: "test", password: "test"});
                createWFSLayerTest({
                    type: 'wfs',
                    visibility: true,
                    url: 'SAMPLE_URL',
                    name: 'osm:vector_tile',
                    serverType: ServerTypes.NO_VENDOR,
                    security: {
                        type: 'basic',
                        sourceId: 'TEST_SOURCE'
                    }
                }, done, () => {
                    setCredentials("TEST_SOURCE", undefined);
                });
            });
            it('test security basic authentication with no credentials', (done) => {
                mockAxios.onPost().reply(({

                }) => {
                    done("should not be called"); // request should not be performed to avoid basic authentication popup
                    return [200, SAMPLE_FEATURE_COLLECTION];
                });
                setCredentials("TEST_SOURCE", undefined);
                createWFSLayerTest({
                    type: 'wfs',
                    visibility: true,
                    url: 'SAMPLE_URL',
                    name: 'osm:vector_tile',
                    serverType: ServerTypes.NO_VENDOR,
                    security: {
                        type: 'basic',
                        sourceId: 'TEST_SOURCE'
                    }
                }, done, () => {
                    setCredentials("TEST_SOURCE", undefined);
                }, false);
            });
        });
    });
    it('should apply native ol min and max resolution on vector layer', () => {
        const minResolution = 1222; // ~ zoom 7 Web Mercator
        const maxResolution = 39135; // ~ zoom 2 Web Mercator
        const resolutions = getResolutions();
        const options = {
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
        let layer = ReactDOM.render(
            <OpenlayersLayer
                type="vector"
                options={{
                    ...options,
                    minResolution,
                    maxResolution
                }}
                map={map}
                resolutions={resolutions}
            />, document.getElementById("container"));

        expect(layer.layer).toBeTruthy();
        expect(layer.layer.getMinResolution()).toBe(minResolution);
        expect(layer.layer.getMaxResolution()).toBe(maxResolution);

        layer = ReactDOM.render(
            <OpenlayersLayer
                type="vector"
                options={options}
                map={map}
                resolutions={resolutions}
            />, document.getElementById("container"));

        expect(layer.layer.getMinResolution()).toBe(0);
        expect(layer.layer.getMaxResolution()).toBe(Infinity);
    });

    it('should apply native ol min and max resolution on osm layer', () => {
        const minResolution = 1222; // ~ zoom 7 Web Mercator
        const maxResolution = 39135; // ~ zoom 2 Web Mercator
        const resolutions = getResolutions();
        const options = {
            source: 'osm',
            title: 'Open Street Map',
            name: 'mapnik',
            group: 'background'
        };
        let layer = ReactDOM.render(
            <OpenlayersLayer
                type="osm"
                options={{
                    ...options,
                    minResolution,
                    maxResolution
                }}
                map={map}
                resolutions={resolutions}
            />, document.getElementById("container"));

        expect(layer.layer).toBeTruthy();
        expect(layer.layer.getMinResolution()).toBe(minResolution);
        expect(layer.layer.getMaxResolution()).toBe(maxResolution);

        layer = ReactDOM.render(
            <OpenlayersLayer
                type="osm"
                options={options}
                map={map}
                resolutions={resolutions}
            />, document.getElementById("container"));

        expect(layer.layer.getMinResolution()).toBe(0);
        expect(layer.layer.getMaxResolution()).toBe(Infinity);
    });

    it('should not apply native ol min and max resolution when disableResolutionLimits is set to true', () => {
        const minResolution = 1222; // ~ zoom 7 Web Mercator
        const maxResolution = 39135; // ~ zoom 2 Web Mercator
        const resolutions = getResolutions();
        const layer = ReactDOM.render(
            <OpenlayersLayer
                type="wms"
                options={{
                    type: 'wms',
                    visibility: true,
                    name: 'nurc:Arc_Sample',
                    group: 'Meteo',
                    format: 'image/png8',
                    url: 'http://localhost:8080/geoserver/wms',
                    minResolution,
                    maxResolution,
                    disableResolutionLimits: true
                }}
                map={map}
                resolutions={resolutions}
            />, document.getElementById("container"));

        expect(layer.layer).toBeTruthy();
        expect(layer.layer.getMinResolution()).toBe(0);
        expect(layer.layer.getMaxResolution()).toBe(Infinity);
    });
    it('should create am elevation layer from wms layer', () => {
        const options = {
            type: 'elevation',
            provider: 'wms',
            url: 'https://host-sample/geoserver/wms',
            name: 'workspace:layername',
            visibility: true
        };
        const cmp = ReactDOM.render(
            <OpenlayersLayer
                type={options.type}
                options={options}
                map={map}
            />, document.getElementById('container'));
        expect(cmp).toBeTruthy();
        expect(cmp.layer).toBeTruthy();
        expect(cmp.layer.get('getElevation')).toBeTruthy();
    });
    it('creates a arcgis layer (MapServer)', () => {
        const options = {
            type: 'arcgis',
            url: 'http://arcgis/MapServer/',
            name: '1',
            visibility: true
        };
        ReactDOM.render(
            <OpenlayersLayer type={options.type}
                options={options} map={map}/>, document.getElementById("container"));
        expect(map.getLayers().getLength()).toBe(1);
        expect(map.getLayers().item(0).getSource().urls[0]).toBe('http://arcgis/MapServer/');
        expect(map.getLayers().item(0).getSource().params_).toEqual({
            LAYERS: 'show:1'
        });
    });
});
