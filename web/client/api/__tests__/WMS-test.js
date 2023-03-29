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
                expect(result.records[0].SRS).toEqual(['EPSG:3857', 'EPSG:4326', 'CRS:84']);
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
