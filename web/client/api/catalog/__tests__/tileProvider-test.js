/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { textSearch } from '../tileProvider';
import expect from 'expect';

describe('tileProvider API', () => {
    describe("textSearch", () => {
        it('records', (done) => {
            textSearch('someurl', 1, 4, "", {options: {service: {provider: "OpenStreetMap"}}}).then((result) => {
                try {
                    expect(result).toBeTruthy();
                    expect(result.numberOfRecordsReturned).toBe(4);
                    expect(result.numberOfRecordsMatched).toBe(5);
                    expect(result.records.length).toBe(4);
                    done();
                } catch (ex) {
                    done(ex);
                }
            });
        });
        it('pagination', (done) => {
            textSearch('someurl', 5, 4, "", { options: { service: { provider: "OpenStreetMap" } } }).then((result) => {
                try {
                    expect(result).toBeTruthy();
                    expect(result.numberOfRecordsReturned).toBe(1);
                    expect(result.numberOfRecordsMatched).toBe(5);
                    expect(result.records.length).toBe(1);
                    expect(result.records[0].provider).toBe("OpenStreetMap.HOT");
                    done();
                } catch (ex) {
                    done(ex);
                }
            });
        });
        it('custom tile Provider', (done) => {
            const CUSTOM_SERVICE = { url: 'test.org/{x}/{y}/{z}.jpg', "title": "Custom Service", options: {some: "option"} };
            textSearch('someurl', 1, 4, "", { options: { service: CUSTOM_SERVICE } }).then((result) => {
                try {
                    expect(result).toBeTruthy();
                    expect(result.numberOfRecordsReturned).toBe(1);
                    expect(result.numberOfRecordsMatched).toBe(1);
                    expect(result.records.length).toBe(1);
                    expect(result.records[0]).toEqual({
                        url: CUSTOM_SERVICE.url,
                        type: 'tileprovider',
                        attribution: undefined,
                        title: CUSTOM_SERVICE.title,
                        options: CUSTOM_SERVICE.options,
                        provider: "custom"
                    });
                    done();
                } catch (ex) {
                    done(ex);
                }
            });
        });
    });
});
