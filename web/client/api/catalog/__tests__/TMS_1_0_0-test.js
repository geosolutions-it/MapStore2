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
import { textSearch } from '../TMS_1_0_0';
import axios from '../../../libs/ajax';
import expect from 'expect';


import MockAdapter from "axios-mock-adapter";
let mockAxios;
import TILE_MAP_SERVICE_RESPONSE from 'raw-loader!../../../test-resources/tms/TileMapServiceSample.xml';
import TILE_MAP_SERVICE_RESPONSE_AUTH from 'raw-loader!../../../test-resources/tms/TileMapServiceSample-auth.xml';
describe('TMS 1.0.0 API', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });
    describe("textSearch", () => {
        it('records', (done) => {
            mockAxios.onGet().reply(200, TILE_MAP_SERVICE_RESPONSE);
            textSearch('someurl', 1, 4, "", {}).then((result) => {
                try {
                    expect(result).toBeTruthy();
                    expect(result.numberOfRecordsReturned).toBe(4);
                    expect(result.numberOfRecordsMatched).toBe(12);
                    expect(result.records.length).toBe(4);
                    expect(result.records[0].title).toBe("tasmania_water_bodies");
                    expect(result.records[0].srs).toBe("EPSG:4326");
                    expect(result.records[0].profile).toBe("local");
                    expect(result.records[0].href).toBe("http://some-url.org/geoserver/gwc/service/tms/1.0.0/gs%3Atasmania_water_bodies@EPSG%3A4326@png");
                    expect(result.records[0].identifier).toBe("http://some-url.org/geoserver/gwc/service/tms/1.0.0/gs%3Atasmania_water_bodies@EPSG%3A4326@png");
                    expect(result.records[0].format).toBe("png");
                    expect(result.records[0].tmsUrl).toBe("someurl");
                    done();
                } catch (ex) {
                    done(ex);
                }
            });
        });
        it('remove authentication', (done) => {
            mockAxios.onGet().reply(200, TILE_MAP_SERVICE_RESPONSE_AUTH);
            textSearch('someurl', 1, 4, "", {}).then((result) => {
                try {
                    expect(result).toBeTruthy();
                    expect(result.numberOfRecordsReturned).toBe(4);
                    expect(result.numberOfRecordsMatched).toBe(12);
                    expect(result.records.length).toBe(4);
                    expect(result.records[0].title).toBe("tasmania_water_bodies");
                    expect(result.records[0].srs).toBe("EPSG:4326");
                    expect(result.records[0].profile).toBe("local");
                    expect(result.records[0].href).toBe("http://some-url.org/geoserver/gwc/service/tms/1.0.0/gs%3Atasmania_water_bodies@EPSG%3A4326@png"); // no authkey
                    expect(result.records[0].identifier).toBe("http://some-url.org/geoserver/gwc/service/tms/1.0.0/gs%3Atasmania_water_bodies@EPSG%3A4326@png"); // no authkey
                    expect(result.records[0].format).toBe("png");
                    expect(result.records[0].tmsUrl).toBe("someurl");
                    done();
                } catch (ex) {
                    done(ex);
                }
            });
        });
        it('pagination', (done) => {
            mockAxios.onGet().reply(200, TILE_MAP_SERVICE_RESPONSE);
            textSearch('someurl', 5, 4, "", {}).then((result) => {
                try {
                    expect(result).toBeTruthy();
                    expect(result.numberOfRecordsReturned).toBe(4);
                    expect(result.numberOfRecordsMatched).toBe(12);
                    expect(result.records.length).toBe(4);
                    expect(result.records[0].title).toBe("tasmania_water_bodies");
                    expect(result.records[1].title).toBe("tasmania_water_bodies");
                    expect(result.records[2].title).toBe("tasmania_roads");
                    expect(result.records[3].title).toBe("tasmania_roads");
                    done();
                } catch (ex) {
                    done(ex);
                }
            });
        });
        it('projection "EPSG:4326"', (done) => {
            mockAxios.onGet().reply(200, TILE_MAP_SERVICE_RESPONSE);
            textSearch('someurl', 1, 10, "", { projection: "EPSG:4326" }).then((result) => {
                try {
                    expect(result).toBeTruthy();
                    expect(result.numberOfRecordsReturned).toBe(6);
                    expect(result.numberOfRecordsMatched).toBe(6);
                    expect(result.records.length).toBe(6);
                    result.records.map(r => expect(r.srs).toBe("EPSG:4326"));
                    done();
                } catch (ex) {
                    done(ex);
                }
            });
        });
        it('projection "EPSG:900913"', (done) => {
            mockAxios.onGet().reply(200, TILE_MAP_SERVICE_RESPONSE);
            textSearch('someurl', 1, 10, "", { projection: "EPSG:900913" }).then((result) => {
                try {
                    expect(result).toBeTruthy();
                    expect(result.numberOfRecordsReturned).toBe(6);
                    expect(result.numberOfRecordsMatched).toBe(6);
                    expect(result.records.length).toBe(6);
                    result.records.map(r => expect(r.srs).toBe("EPSG:900913"));
                    done();
                } catch (ex) {
                    done(ex);
                }
            });
        });
        it('projection "EPSG:3857 to get EPSG:900913 records too"', (done) => {
            mockAxios.onGet().reply(200, TILE_MAP_SERVICE_RESPONSE);
            textSearch('someurl', 1, 10, "", { projection: "EPSG:3857" }).then((result) => {
                try {
                    expect(result).toBeTruthy();
                    expect(result.numberOfRecordsReturned).toBe(6);
                    expect(result.numberOfRecordsMatched).toBe(6);
                    expect(result.records.length).toBe(6);
                    result.records.map(r => expect(r.srs).toBe("EPSG:900913"));
                    done();
                } catch (ex) {
                    done(ex);
                }
            });
        });
    });
});
