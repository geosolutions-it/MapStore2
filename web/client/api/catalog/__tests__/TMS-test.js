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
import {textSearch} from '../TMS';
import axios from '../../../libs/ajax';
import expect from 'expect';


import MockAdapter from "axios-mock-adapter";
let mockAxios;
import TILE_MAP_SERVICE_RESPONSE from 'raw-loader!../../../test-resources/tms/TileMapServiceSample.xml';
describe('TMS (Abstraction) API', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });
    describe("tms", () => {
        it('TMS 1.0.0', (done) => {
            mockAxios.onGet().reply(200, TILE_MAP_SERVICE_RESPONSE);
            textSearch('someurl', 1, 4, "", {options: {service: {provider: "tms"}}}).then((result) => {
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
        it('tileProvider', (done) => {
            textSearch('someurl', 1, 4, "", { options: { service: { provider: "OpenStreetMap" } } }).then((result) => {
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
    });
});
