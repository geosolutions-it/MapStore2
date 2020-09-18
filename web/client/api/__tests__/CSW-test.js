/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const API = require('../CSW');

describe('Test correctness of the CSW APIs', () => {
    it('getRecords ISO Metadata Profile', (done) => {
        API.getRecords('base/web/client/test-resources/csw/getRecordsResponseISO.xml', 1, 1).then((result) => {
            try {
                expect(result).toExist();
                expect(result.records).toExist();
                expect(result.records.length).toBe(1);
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('getRecords Error', (done) => {
        API.getRecords('base/web/client/test-resources/csw/getRecordsResponseException.xml', 1, 1).then((result) => {
            try {
                expect(result).toExist();
                expect(result.error).toExist();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('getRecords Dublin Core', (done) => {
        API.getRecords('base/web/client/test-resources/csw/getRecordsResponseDC.xml', 1, 2).then((result) => {
            try {
                expect(result).toExist();
                expect(result.records).toExist();
                expect(result.records.length).toBe(2);
                let rec0 = result.records[0];
                expect(rec0.dc).toExist();
                expect(rec0.dc.URI).toExist();
                expect(rec0.dc.URI[0]);
                expect(rec0.boundingBox).toExist();
                expect(rec0.boundingBox.crs).toBe('EPSG:4326');
                expect(rec0.boundingBox.extent).toEqual([45.542, 11.874, 46.026, 12.718]);
                let uri = rec0.dc.URI[0];
                expect(uri.name).toExist();
                expect(uri.value).toExist();
                expect(uri.description).toExist();
                let rec1 = result.records[1];
                expect(rec1.boundingBox).toExist();
                expect(rec1.boundingBox.crs).toBe('EPSG:4326');
                expect(rec1.boundingBox.extent).toEqual([12.002717999999996, 45.760718, 12.429282000000002, 46.187282]);
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('getRecordsById ISO Metadata Profile', (done) => {
        API.getRecordById('base/web/client/test-resources/csw/getRecordById.xml').then((result) => {
            try {
                expect(result).toExist();
                expect(result.dc).toExist();
                expect(result.dc.identifier).toBe("msg_rss_micro");
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('getRecordsById Error', (done) => {
        API.getRecordById('base/web/client/test-resources/csw/getRecordsResponseException.xml').then((result) => {
            try {
                expect(result).toExist();
                expect(result.error).toExist();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
});
