/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {getRecords, addLayerError, ADD_LAYER_ERROR} = require('../catalog');
describe('Test correctness of the catalog actions', () => {

    it('getRecords ISO Metadata Profile', (done) => {
        getRecords('csw', 'base/web/client/test-resources/csw/getRecordsResponseISO.xml', 1, 1)((actionResult) => {
            try {
                let result = actionResult && actionResult.result;
                expect(result).toExist();
                expect(result.records).toExist();
                expect(result.records.length).toBe(1);
                done();
            } catch(ex) {
                done(ex);
            }
        });
    });
    it('getRecords Error', (done) => {
        getRecords('csw', 'base/web/client/test-resources/csw/getRecordsResponseException.xml', 1, 1)((result) => {
            try {
                expect(result).toExist();
                expect(result.error).toExist();
                done();
            } catch(ex) {
                done(ex);
            }
        });
    });
    it('getRecords Dublin Core', (done) => {
        getRecords('csw', 'base/web/client/test-resources/csw/getRecordsResponseDC.xml', 1, 2)((actionResult) => {
            try {
                let result = actionResult && actionResult.result;
                expect(result).toExist();
                expect(result.records).toExist();
                expect(result.records.length).toBe(2);
                let rec0 = result.records[0];
                expect(rec0.dc).toExist();
                expect(rec0.dc.URI).toExist();
                expect(rec0.dc.URI[0]);
                let uri = rec0.dc.URI[0];
                expect(uri.name).toExist();
                expect(uri.value).toExist();
                expect(uri.description).toExist();
                done();
            } catch(ex) {
                done(ex);
            }
        });
    });

    it('sets an error on addLayerError action', () => {
        const action = addLayerError('myerror');

        expect(action.type).toBe(ADD_LAYER_ERROR);
        expect(action.error).toBe('myerror');
    });
});
