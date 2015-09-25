/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var {
    ERROR_FEATURE_INFO,
    EXCEPTIONS_FEATURE_INFO,
    LOAD_FEATURE_INFO,
    CHANGE_MAPINFO_STATE,
    NEW_MAPINFO_REQUEST,
    PURGE_MAPINFO_RESULTS,
    getFeatureInfo,
    changeMapInfoState,
    newMapInfoRequest,
    purgeMapInfoResults
} = require('../mapInfo');

describe('Test correctness of the map actions', () => {

    it('get feature info data', (done) => {
        getFeatureInfo('base/web/client/test-resources/featureInfo-response.json', {p: "p"}, "meta")((e) => {
            try {
                expect(e).toExist();
                expect(e.type).toBe(LOAD_FEATURE_INFO);
                expect(e.data).toExist();
                expect(e.requestParams).toExist();
                expect(e.requestParams.p).toBe("p");
                expect(e.layerMetadata).toBe("meta");
                done();
            } catch(ex) {
                done(ex);
            }
        });
    });

    it('get feature info exception', (done) => {
        getFeatureInfo('base/web/client/test-resources/featureInfo-exception.json', {p: "p"}, "meta")((e) => {
            try {
                expect(e).toExist();
                expect(e.type).toBe(EXCEPTIONS_FEATURE_INFO);
                expect(e.exceptions).toExist();
                expect(e.requestParams).toExist();
                expect(e.requestParams.p).toBe("p");
                expect(e.layerMetadata).toBe("meta");
                done();
            } catch(ex) {
                done(ex);
            }
        });
    });

    it('get feature info error', (done) => {
        getFeatureInfo('requestError.json', {p: "p"}, "meta")((e) => {
            try {
                expect(e).toExist();
                expect(e.type).toBe(ERROR_FEATURE_INFO);
                expect(e.error).toExist();
                expect(e.requestParams).toExist();
                expect(e.requestParams.p).toBe("p");
                expect(e.layerMetadata).toBe("meta");
                done();
            } catch(ex) {
                done(ex);
            }
        });
    });

    it('change map info state', () => {
        const testVal = "val";
        const retval = changeMapInfoState(testVal);

        expect(retval.type).toBe(CHANGE_MAPINFO_STATE);
        expect(retval.enabled).toExist();
        expect(retval.enabled).toBe(testVal);
    });

    it('add new info request', () => {
        const testVal = "val";
        const retval = newMapInfoRequest(testVal);

        expect(retval.type).toBe(NEW_MAPINFO_REQUEST);
        expect(retval.request).toExist();
        expect(retval.request).toBe(testVal);
    });

    it('delete all results', () => {
        const retval = purgeMapInfoResults();

        expect(retval.type).toBe(PURGE_MAPINFO_RESULTS);
    });
});
