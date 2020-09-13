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
import { textSearch } from '../WFS';
import axios from '../../../libs/ajax';
import expect from 'expect';

import MockAdapter from "axios-mock-adapter";
let mockAxios;
import SINGLE_LAYER_CAPABILITIES from 'raw-loader!../../../test-resources/wfs/states-capabilities.xml';
import PAGINATION_CAPABILITIES from 'raw-loader!../../../test-resources/wfs/simplified-capabilities.xml';
describe('WFS (Abstraction) API', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });
    it('WFS single record', (done) => {
        mockAxios.onGet().reply(200, SINGLE_LAYER_CAPABILITIES);
        textSearch('someurl', 1, 4, "",).then((result) => {
            try {
                expect(result.numberOfRecordsReturned).toBe(1);
                expect(result.numberOfRecordsMatched).toBe(1);
                const checks = {
                    "type": "wfs",
                    "url": "someurl",
                    "name": "topp:states",
                    "title": "USA Population",
                    "description": "This is some census data on the states.",
                    "boundingBox": {
                        "bounds": {
                            "minx": -124.731422,
                            "miny": 24.955967,
                            "maxx": -66.969849,
                            "maxy": 49.371735
                        },
                        "crs": "EPSG:4326"
                    }
                };
                Object.keys(checks).map(k => {
                    expect(checks[k]).toEqual(result.records[0][k]);
                });
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('WFS pagination record', (done) => {
        mockAxios.onGet().reply(200, PAGINATION_CAPABILITIES);
        textSearch('someurl2', 1, 3, "").then((r1) => {
            try {
                expect(r1.numberOfRecordsReturned).toBe(3);
                expect(r1.numberOfRecordsMatched).toBe(6);
                expect(r1.records.length).toBe(3);
                expect(r1.records[0].name).toEqual("workspace:layer_1");
                expect(r1.records[1].name).toEqual("workspace:layer_2");
                expect(r1.records[2].name).toEqual("workspace:layer_3");
                // second page
                textSearch('someurl2', 4, 3, "").then((r2) => {
                    try {
                        expect(r2.numberOfRecordsReturned).toBe(3);
                        expect(r2.numberOfRecordsMatched).toBe(6);
                        expect(r2.records.length).toBe(3);
                        expect(r2.records[0].name).toEqual("workspace:layer_4");
                        expect(r2.records[1].name).toEqual("workspace:layer_5");
                        expect(r2.records[2].name).toEqual("workspace:layer_6");
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                });
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('WFS text filter', (done) => {
        mockAxios.onGet().reply(200, PAGINATION_CAPABILITIES);
        textSearch('someurl2', 1, 10, "layer_2").then((r1) => {
            try {
                expect(r1.numberOfRecordsReturned).toBe(1);
                expect(r1.numberOfRecordsMatched).toBe(1);
                expect(r1.records.length).toBe(1);
                expect(r1.records[0].name).toEqual("workspace:layer_2");
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
});
