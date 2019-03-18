/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const API = require('../WMTS');

describe('Test correctness of the WMTS APIs', () => {
    it('GetRecords KVP', (done) => {
        API.getRecords('base/web/client/test-resources/wmts/GetCapabilities-1.0.0.xml', 0, 3, '').then((result) => {
            try {
                expect(result).toExist();
                expect(result.numberOfRecordsMatched).toBe(3);
                expect(result.records[0].style).toBe("");
                result.records.map(record => {
                    expect(record.requestEncoding).toBe('KVP');
                    expect(record.queryable).toBe(true);
                    expect(record.GetTileURL).toBe("http://sample.server/geoserver/gwc/service/wmts?");
                });

                expect(result.records[0].format).toBe("image/png");
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('GetRecords RESTful', (done) => {
        API.getRecords('base/web/client/test-resources/wmts/GetCapabilities-rest.xml', 0, 7, '').then((result) => {
            try {
                expect(result).toExist();
                expect(result.numberOfRecordsMatched).toBe(7);
                // all records should be RESTful with same GetTileURL
                result.records.map(record => {
                    expect(record.requestEncoding).toBe('RESTful');
                    expect(record.queryable).toBe(false);
                    expect(record.GetTileURL).toBe('https://maps.sampleServer.org/basemap');
                });
                expect(result.records[0].style).toBe("normal");
                expect(result.records[0].format).toBe("image/png");
                expect(result.records[1].style).toBe("normal");
                expect(result.records[1].style).toBe("normal");
                expect(result.records[4].format).toBe("image/jpeg");

                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
});
