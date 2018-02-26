/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const API = require('../WMS');

describe('Test correctness of the WMS APIs', () => {
    it('describeLayers', (done) => {
        API.describeLayers('base/web/client/test-resources/wms/DescribeLayers.xml', "workspace:vector_layer").then((result) => {
            try {
                expect(result).toExist();
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
                expect(result).toExist();
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
                expect(result).toExist();
                expect(result.capability).toExist();
                expect(result.version).toBe("1.3.0");
                expect(result.capability.layer).toExist();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('GetCapabilities 1.1.1', (done) => {
        API.getCapabilities('base/web/client/test-resources/wms/GetCapabilities-1.1.1.xml').then((result) => {
            try {
                expect(result).toExist();
                expect(result.capability).toExist();
                expect(result.version).toBe("1.1.1");
                expect(result.capability.layer).toExist();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('GetCapabilities 1.3.0 RAW', (done) => {
        API.getCapabilities('base/web/client/test-resources/wms/GetCapabilities-1.3.0.xml', true).then((result) => {
            try {
                expect(result).toExist();
                expect(result.WMS_Capabilities).toExist();
                expect(result.WMS_Capabilities.Capability).toExist();
                expect(result.WMS_Capabilities.$.version).toBe("1.3.0");
                expect(result.WMS_Capabilities.Capability.Layer).toExist();
                done();
            } catch(ex) {
                done(ex);
            }
        });
    });
    it('GetCapabilities 1.1.1 RAW', (done) => {
        API.getCapabilities('base/web/client/test-resources/wms/GetCapabilities-1.1.1.xml', true).then((result) => {
            try {
                expect(result).toExist();
                expect(result.WMT_MS_Capabilities).toExist();
                expect(result.WMT_MS_Capabilities.Capability).toExist();
                expect(result.WMT_MS_Capabilities.$.version).toBe("1.1.1");
                expect(result.WMT_MS_Capabilities.Capability.Layer).toExist();
                done();
            } catch(ex) {
                done(ex);
            }
        });
    });

    it('GetBBOX', (done) => {
        API.getCapabilities('base/web/client/test-resources/wms/GetCapabilities-1.1.1.xml').then((result) => {
            try {
                expect(result).toExist();
                expect(result.capability).toExist();
                expect(result.capability.layer).toExist();
                const bbox = API.getBBox(result.capability.layer);
                expect(bbox.extent).toExist();
                expect(bbox.crs).toExist();
                done();
            } catch(ex) {
                done(ex);
            }
        });
    });
    it('GetBBOX Bounds', (done) => {
        API.getCapabilities('base/web/client/test-resources/wms/GetCapabilities-1.1.1.xml').then((result) => {
            try {
                expect(result).toExist();
                expect(result.capability).toExist();
                expect(result.capability.layer).toExist();
                const bbox = API.getBBox(result.capability.layer, true);
                expect(bbox.bounds).toExist();
                expect(bbox.bounds.minx).toExist();
                expect(bbox.crs).toExist();
                done();
            } catch(ex) {
                done(ex);
            }
        });
    });
    it('GetRecords', (done) => {
        API.getRecords('base/web/client/test-resources/wms/GetCapabilities-1.3.0.xml', 0, 1, '').then((result) => {
            try {
                expect(result).toExist();
                expect(result.service).toExist();
                expect(result.numberOfRecordsMatched).toBe(5);
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('GetRecords 1.1.1', (done) => {
        API.getRecords('base/web/client/test-resources/wms/GetCapabilities-1.1.1.xml', 0, 1, '').then((result) => {
            try {
                expect(result).toExist();
                expect(result.service).toExist();
                expect(result.numberOfRecordsMatched).toBe(7);
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('parseLayerCapabilities nested', () => {
        const capabilities = {
            capability: {
                layer: {
                    layer: {
                        layer: [
                            {
                                name: "mytest"
                            },
                            {
                                name: "mytest2"
                            }
                        ]
                    }
                }
            }
        };

        const capability = API.parseLayerCapabilities(capabilities, {name: 'mytest'});
        expect(capability).toExist();
    });
});
