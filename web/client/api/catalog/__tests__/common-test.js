/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { validate, testService, getRecordIdentifier } from '../common';
import axios from '../../../libs/ajax';
import expect from 'expect';


import MockAdapter from "axios-mock-adapter";
import TILE_MAP_RESPONSE from 'raw-loader!../../../test-resources/tms/TileMapSample.xml';

const TEST_SERVICE = { title: "test", "url": "http://some-url" };
describe('common', () => {
    describe("validate", () => {
        it('success', (done) => {
            validate(TEST_SERVICE).subscribe(
                e => expect(e).toBe(TEST_SERVICE),
                e => done(e),
                () => done()
            );
        });
        it('error', (done) => {
            validate({ url: "" }).subscribe(
                () => done("validation should fail but emits"),
                () => done(),
                () => done("Validation should fail but passes")
            );
        });
    });
    describe("getRecordIdentifier", () => {
        it('returns the same identifier for the same slice content (deterministic)', () => {
            const slice = { url: 'http://a', title: 'A' };
            expect(getRecordIdentifier(slice)).toBe(getRecordIdentifier(slice));
            expect(getRecordIdentifier({ ...slice })).toBe(getRecordIdentifier(slice));
        });
        it('returns different identifiers for different slice content', () => {
            expect(getRecordIdentifier({ url: 'http://a' })).toNotEqual(getRecordIdentifier({ url: 'http://b' }));
        });
        it('accepts a string slice', () => {
            expect(getRecordIdentifier('layer-a')).toBe(getRecordIdentifier('layer-a'));
            expect(getRecordIdentifier('layer-a')).toNotEqual(getRecordIdentifier('layer-b'));
        });
        it('returns a non-empty string', () => {
            const id = getRecordIdentifier({ url: 'http://a' });
            expect(typeof id).toBe('string');
            expect(id.length).toBeGreaterThan(0);
        });
    });
    describe("testService", () => {
        let mockAxios;
        beforeEach(done => {
            mockAxios = new MockAdapter(axios);
            setTimeout(done);
        });

        afterEach(done => {
            mockAxios.restore();
            setTimeout(done);
        });
        it('success', (done) => {
            mockAxios.onGet().reply(200, TILE_MAP_RESPONSE);
            testService({ parseUrl: () => "URL" })(TEST_SERVICE).subscribe(
                e => expect(e).toBe(TEST_SERVICE),
                e => done(e),
                () => done()
            );
        });
        it('error', (done) => {
            mockAxios.onGet().reply(400);
            testService({ parseUrl: () => "URL" })(TEST_SERVICE).subscribe(
                () => done("validation should fail but emits"),
                () => done(),
                () => done("Validation should fail but passes")
            );
        });
    });
});
