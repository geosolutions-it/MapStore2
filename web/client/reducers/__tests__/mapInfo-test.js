/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
var mapInfo = require('../mapInfo');

describe('Test the mapInfo reducer', () => {
    it('returns original state on unrecognized action', () => {
        let state = mapInfo(1, {type: 'UNKNOWN'});
        expect(state).toBe(1);
    });

    it('creates a general error ', () => {
        let state = mapInfo({}, {type: 'ERROR_FEATURE_INFO', error: "error"});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(1);
        expect(state.responses[0]).toBe("error");

        state = mapInfo({responses: []}, {type: 'ERROR_FEATURE_INFO', error: "error"});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(1);
        expect(state.responses[0]).toBe("error");

        state = mapInfo({responses: ["test"]}, {type: 'ERROR_FEATURE_INFO', error: "error"});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(2);
        expect(state.responses[0]).toBe("test");
        expect(state.responses[1]).toBe("error");
    });

    it('creates an wms feature info exception', () => {
        let state = mapInfo({}, {type: 'EXCEPTIONS_FEATURE_INFO', exceptions: "exception"});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(1);
        expect(state.responses[0]).toBe("exception");

        state = mapInfo({responses: []}, {type: 'EXCEPTIONS_FEATURE_INFO', exceptions: "exception"});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(1);
        expect(state.responses[0]).toBe("exception");

        state = mapInfo({responses: ["test"]}, {type: 'EXCEPTIONS_FEATURE_INFO', exceptions: "exception"});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(2);
        expect(state.responses[0]).toBe("test");
        expect(state.responses[1]).toBe("exception");
    });

    it('creates a feature info data from succesfull request', () => {
        let state = mapInfo({}, {type: 'LOAD_FEATURE_INFO', data: "data"});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(1);
        expect(state.responses[0]).toBe("data");

        state = mapInfo({responses: []}, {type: 'LOAD_FEATURE_INFO', data: "data"});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(1);
        expect(state.responses[0]).toBe("data");

        state = mapInfo({responses: ["test"]}, {type: 'LOAD_FEATURE_INFO', data: "data"});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(2);
        expect(state.responses[0]).toBe("test");
        expect(state.responses[1]).toBe("data");
    });

    it('creates a new mapinfo request', () => {
        let state = mapInfo({}, {type: 'NEW_MAPINFO_REQUEST', request: "request"});
        expect(state.requests).toExist();
        expect(state.requests.length).toBe(1);
        expect(state.requests[0]).toBe("request");

        state = mapInfo({requests: []}, {type: 'NEW_MAPINFO_REQUEST', request: "request"});
        expect(state.requests).toExist();
        expect(state.requests.length).toBe(1);
        expect(state.requests[0]).toBe("request");

        state = mapInfo({requests: ["test"]}, {type: 'NEW_MAPINFO_REQUEST', request: "request"});
        expect(state.requests).toExist();
        expect(state.requests.length).toBe(2);
        expect(state.requests[0]).toBe("test");
        expect(state.requests[1]).toBe("request");
    });

    it('clear request queue', () => {
        let state = mapInfo({}, {type: 'PURGE_MAPINFO_RESULTS'});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(0);

        state = mapInfo({responses: []}, {type: 'PURGE_MAPINFO_RESULTS'});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(0);

        state = mapInfo({responses: ["test"]}, {type: 'PURGE_MAPINFO_RESULTS'});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(0);
    });
});
