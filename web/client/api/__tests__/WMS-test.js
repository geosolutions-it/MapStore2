/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import * as API from '../WMS';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../libs/ajax';
let mockAxios;

describe('Test correctness of the WMS APIs', () => {
    it('parseUrl uses the first array element', () => {
        expect(API.parseUrl(["http://first", "https://second"]).indexOf("http://first/")).toBe(0);
    });
    it('parseUrl uses the first string of a comma delimited list', () => {
        expect(API.parseUrl(["http://first,https://second"]).indexOf("http://first/")).toBe(0);
    });
    it('describeLayers', (done) => {
        API.describeLayers('base/web/client/test-resources/wms/DescribeLayers.xml', "workspace:vector_layer").then((result) => {
            try {
                expect(result).toBeTruthy();
                expect(result.length).toBe(2);
                expect(result[0].owsType).toBe("WFS");
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('describeLayer with OGC-SCHEMAS', (done) => {
        API.describeLayer('base/web/client/test-resources/wms/DescribeLayers.xml', "workspace:vector_layer").then((result) => {
            try {
                expect(result).toBeTruthy();
                expect(result.owsType).toBe("WFS");
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('GetCapabilities 1.3.0', (done) => {
        API.getCapabilities('base/web/client/test-resources/wms/GetCapabilities-1.3.0.xml').then((result) => {
            try {
                expect(result).toBeTruthy();
                expect(result.Capability).toBeTruthy();
                expect(result.$.version).toBe("1.3.0");
                expect(result.Capability.Layer).toBeTruthy();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('GetCapabilities 1.1.1', (done) => {
        API.getCapabilities('base/web/client/test-resources/wms/GetCapabilities-1.1.1.xml').then((result) => {
            try {
                expect(result).toBeTruthy();
                expect(result.Capability).toBeTruthy();
                expect(result.$.version).toBe("1.1.1");
                expect(result.Capability.Layer).toBeTruthy();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('GetBBOX', (done) => {
        API.getCapabilities('base/web/client/test-resources/wms/GetCapabilities-1.1.1.xml').then((result) => {
            try {
                expect(result).toBeTruthy();
                expect(result.Capability).toBeTruthy();
                expect(result.$.version).toBe("1.1.1");
                expect(result.Capability.Layer).toBeTruthy();
                const bbox = API.getBBox(result.Capability.Layer);
                expect(bbox.extent).toBeTruthy();
                expect(bbox.crs).toBeTruthy();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('GetBBOX Bounds', (done) => {
        API.getCapabilities('base/web/client/test-resources/wms/GetCapabilities-1.1.1.xml').then((result) => {
            try {
                expect(result).toBeTruthy();
                expect(result.Capability).toBeTruthy();
                expect(result.$.version).toBe("1.1.1");
                expect(result.Capability.Layer).toBeTruthy();
                const bbox = API.getBBox(result.Capability.Layer, true);
                expect(bbox.bounds).toBeTruthy();
                expect(bbox.bounds.minx).toBeTruthy();
                expect(bbox.crs).toBeTruthy();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('GetRecords', (done) => {
        API.getRecords('base/web/client/test-resources/wms/GetCapabilities-1.3.0.xml', 0, 2, '').then((result) => {
            try {
                expect(result).toBeTruthy();
                expect(result.service).toBeTruthy();
                expect(result.records[0].getMapFormats.length).toBe(20);
                expect(result.numberOfRecordsMatched).toBe(5);
                expect(result.records[0].SRS.length).toBe(4);
                expect(result.layerOptions).toBeTruthy();
                expect(result.layerOptions.version).toBe('1.3.0');
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('GetRecords', (done) => {
        API.getRecords('base/web/client/test-resources/wms/GetCapabilities-1.3.0-minimal.xml', 0, 2, '').then((result) => {
            try {
                expect(result).toBeTruthy();
                expect(result.service).toBeTruthy();
                expect(result.records[0].getMapFormats.length).toBe(1);
                expect(result.records[0].SRS.length).toBe(1);
                expect(result.numberOfRecordsMatched).toBe(1);
                expect(result.layerOptions).toBeTruthy();
                expect(result.layerOptions.version).toBe('1.3.0');
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('GetRecords attribution creates the credits object', (done) => {
        // note: maxRecords = 2 because of strange pagination system. Need to restore this when fixed
        API.getRecords('base/web/client/test-resources/wms/attribution.xml', 0, 2, '').then((result) => {
            try {
                expect(result).toBeTruthy();
                expect(result.service).toBeTruthy();
                expect(result.numberOfRecordsMatched).toBe(2);
                expect(result.records[0]).toBeTruthy();
                expect(result.records[0].credits).toBeTruthy();
                expect(result.records[0].credits.imageUrl).toBe('logo.png');
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('GetRecords 1.1.1', (done) => {
        API.getRecords('base/web/client/test-resources/wms/GetCapabilities-1.1.1.xml', 0, 2, '').then((result) => {
            try {
                expect(result).toBeTruthy();
                expect(result.service).toBeTruthy();
                expect(result.records[0].getMapFormats.length).toBe(42);
                expect(result.numberOfRecordsMatched).toBe(7);
                expect(result.layerOptions).toBeTruthy();
                expect(result.layerOptions.version).toBe('1.1.1');
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('GetRecords transform SRS List to uppercase', (done) => {
        API.getRecords('base/web/client/test-resources/wms/GetCapabilities-1.3.0-lowercase-espg.xml', 0, 2, '').then((result) => {
            try {
                expect(result.records[0].SRS).toEqual(['EPSG:3857', 'EPSG:4326', 'CRS:84', 'EPSG:26713']);
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('parseLayerCapabilities nested', () => {
        const capabilities = {
            Capability: {
                Layer: {
                    Layer: {
                        Layer: [
                            {
                                Name: "mytest"
                            },
                            {
                                Name: "mytest2"
                            }
                        ]
                    }
                }
            }
        };

        const capability = API.parseLayerCapabilities(capabilities, {name: 'mytest'});
        expect(capability).toBeTruthy();
    });
    it('parseLayerCapabilities formats', () => {
        const capabilities = {
            Capability: {
                Request: {
                    GetMap: {
                        Format: [
                            "image/png",
                            "application/atom+xml",
                            "application/json;type=geojson",
                            "application/json;type=topojson",
                            "application/json;type=utfgrid",
                            "application/pdf",
                            "application/rss+xml",
                            "application/vnd.google-earth.kml+xml",
                            "application/vnd.google-earth.kml+xml;mode=networklink",
                            "application/vnd.google-earth.kmz",
                            "application/vnd.mapbox-vector-tile",
                            "image/geotiff",
                            "image/geotiff8",
                            "image/gif",
                            "image/jpeg",
                            "image/png; mode=8bit",
                            "image/svg+xml",
                            "image/tiff",
                            "image/tiff8",
                            "image/vnd.jpeg-png",
                            "image/vnd.jpeg-png8",
                            "text/html; subtype=openlayers",
                            "text/html; subtype=openlayers2",
                            "text/html; subtype=openlayers3"
                        ]
                    },
                    GetFeatureInfo: {
                        Format: [
                            "text/plain",
                            "application/vnd.ogc.gml",
                            "text/xml",
                            "application/vnd.ogc.gml/3.1.1",
                            "text/xml; subtype=gml/3.1.1",
                            "text/html",
                            "application/json"
                        ]
                    }
                },
                Layer: {
                    Layer: {
                        Layer: [
                            {
                                Name: "mytest"
                            },
                            {
                                Name: "mytest2"
                            }
                        ]
                    }
                }
            }
        };

        const capability = API.parseLayerCapabilities(capabilities, {name: 'mytest'});
        expect(capability).toBeTruthy();
        expect(capability.layerOptions).toBeTruthy();
        expect(capability.layerOptions.imageFormats).toEqual([
            'image/png',
            'image/gif',
            'image/jpeg',
            'image/png; mode=8bit',
            'image/vnd.jpeg-png',
            'image/vnd.jpeg-png8'
        ]);
        expect(capability.layerOptions.infoFormats).toEqual([
            'text/plain',
            'text/html',
            'application/json'
        ]);
    });
    it('should parse nested layers from capabilities', () => {
        expect(API.flatLayers({
            Layer: {
                Name: 'layer1',
                Layer: {
                    Name: 'layer2',
                    Layer: {
                        Name: 'layer3',
                        Layer: {
                            Name: 'layer4',
                            Layer: {
                                Name: 'layer5'
                            }
                        }
                    }
                }
            }
        })).toEqual([
            { Name: 'layer5' },
            { Name: 'layer4', Layer: { Name: 'layer5' } },
            { Name: 'layer3', Layer: { Name: 'layer4', Layer: { Name: 'layer5' } } },
            { Name: 'layer2', Layer: { Name: 'layer3', Layer: { Name: 'layer4', Layer: { Name: 'layer5' } } } },
            { Name: 'layer1', Layer: { Name: 'layer2', Layer: { Name: 'layer3', Layer: { Name: 'layer4', Layer: { Name: 'layer5' } } } } }
        ]);
        expect(API.flatLayers({
            layer: {
                name: 'layer1',
                layer: {
                    name: 'layer2',
                    layer: {
                        name: 'layer3',
                        layer: {
                            name: 'layer4',
                            layer: {
                                name: 'layer5'
                            }
                        }
                    }
                }
            }
        })).toEqual([
            { name: 'layer5' },
            { name: 'layer4', layer: { name: 'layer5' } },
            { name: 'layer3', layer: { name: 'layer4', layer: { name: 'layer5' } } },
            { name: 'layer2', layer: { name: 'layer3', layer: { name: 'layer4', layer: { name: 'layer5' } } } },
            { name: 'layer1', layer: { name: 'layer2', layer: { name: 'layer3', layer: { name: 'layer4', layer: { name: 'layer5' } } } } }
        ]);
    });
});

describe('Test correctness of the WMS APIs (mock axios)', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });

    it('describeLayer with query option', (done) => {

        mockAxios.onGet(/\/geoserver/).reply((config) => {
            try {
                expect(!!config.url.match('token=value')).toBe(true);
            } catch (e) {
                done(e);
            }
            done();
            return [ 200, {}];
        });

        const url = 'localhost:8080/geoserver/wms';
        const layers = 'workspace:layer';
        const query = { token: 'value' };
        API.describeLayer(url, layers, { query });
    });
});

describe('Test get json wms graphic legend (mock axios)', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });

    it('get json wms graphic legend', (done) => {
        let url = "http://localhost:8080/geoserver/wms?service=WMS&request=GetLegendGraphic&format=application/json&layers=workspace:layer&style=pophade&version=1.3.0&SLD_VERSION=1.1.0";
        mockAxios.onGet().reply(() => {
            return [ 200, {
                "Legend": [{
                    "layerName": "layer",
                    "title": "Layer",
                    "rules": [
                        {
                            "name": ">= 159.05 and < 5062.5",
                            "filter": "[field >= '159.05' AND field < '5062.5']",
                            "symbolizers": [{"Polygon": {
                                "uom": "in/72",
                                "stroke": "#ffffff",
                                "stroke-width": "1.0",
                                "stroke-opacity": "0.35",
                                "stroke-linecap": "butt",
                                "stroke-linejoin": "miter",
                                "fill": "#8DD3C7",
                                "fill-opacity": "0.75"
                            }}]
                        },
                        {
                            "name": ">= 5062.5 and < 20300.35",
                            "filter": "[field >= '5062.5' AND field < '20300.35']",
                            "symbolizers": [{"Polygon": {
                                "uom": "in/72",
                                "stroke": "#ffffff",
                                "stroke-width": "1.0",
                                "stroke-opacity": "0.35",
                                "stroke-linecap": "butt",
                                "stroke-linejoin": "miter",
                                "fill": "#ABD9C5",
                                "fill-opacity": "0.75"
                            }}]
                        }]
                }]
            }];
        });

        API.getJsonWMSLegend(url).then(result => {
            try {
                expect(result.length).toEqual(1);
                expect(result[0]).toBeTruthy();
                expect(result[0].layerName).toBeTruthy();
                expect(result[0].layerName).toEqual('layer');
                expect(result[0].rules).toBeTruthy();
                expect(result[0].rules.length).toEqual(2);
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
});
