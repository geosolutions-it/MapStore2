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
                expect(result).toBeTruthy();
                expect(result.records).toBeTruthy();
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
                expect(result).toBeTruthy();
                expect(result.error).toBeTruthy();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('getRecords Dublin Core', (done) => {
        API.getRecords('base/web/client/test-resources/csw/getRecordsResponseDC.xml', 1, 2).then((result) => {
            try {
                expect(result).toBeTruthy();
                expect(result.records).toBeTruthy();
                expect(result.records.length).toBe(2);
                let rec0 = result.records[0];
                expect(rec0.dc).toBeTruthy();
                expect(rec0.dc.URI).toBeTruthy();
                expect(rec0.dc.URI[0]);
                let uri = rec0.dc.URI[0];
                expect(uri.name).toBeTruthy();
                expect(uri.value).toBeTruthy();
                expect(uri.description).toBeTruthy();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('getRecordsById ISO Metadata Profile', (done) => {
        API.getRecordById('base/web/client/test-resources/csw/getRecordById.xml').then((result) => {
            try {
                expect(result).toBeTruthy();
                expect(result.dc).toBeTruthy();
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
                expect(result).toBeTruthy();
                expect(result.error).toBeTruthy();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
});
