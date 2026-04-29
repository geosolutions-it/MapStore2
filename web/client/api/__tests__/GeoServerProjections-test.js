/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import axios from '../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';
import {
    formatCrsExtents,
    searchProjections,
    getProjectionDef

} from '../GeoServerProjections';

import CRS_LIST from '../../test-resources/crs/crs_list.json';
import CRS_LIST_2000 from '../../test-resources/crs/crs_list_2000.json';
import CRS_3003 from '../../test-resources/crs/EPSG_3003.json';

const baseUrl = 'base/web/client/test-resources/crs/';

let mockAxios;
describe('Test GeoServer Projections API', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });
    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });

    it('should convert bbox objects to array format', () => {
        const input = {
            bbox: {
                minX: 270929.9561293494,
                minY: 2002224.111228647,
                maxX: 302793.2719302393,
                maxY: 2026749.0694562676
            },
            bboxWGS84: {
                minX: -63.22,
                minY: 18.11,
                maxX: -62.92,
                maxY: 18.33
            }
        };
        const expectedOutput = {
            extent: [270929.9561293494, 2002224.111228647, 302793.2719302393, 2026749.0694562676],
            worldExtent: [-63.22, 18.11, -62.92, 18.33]
        };
        const output = formatCrsExtents(input);
        expect(output).toEqual(expectedOutput);
    });
    it('should search crs by code', (done) => {
        mockAxios.onGet().reply((req) => {
            switch (req.params.query) {
            case '2000': {
                return [200, CRS_LIST_2000];
            }
            default:
                return [200, CRS_LIST];
            }
        });
        searchProjections(baseUrl, '2000').then((response) => {
            try {
                expect(response).toBeTruthy();
                expect(response.results).toBeTruthy();
                expect(response.results.length).toBe(12);
                expect(response.total).toBe(12);
            } catch (e) {
                done(e);
            }
            done();
        });
    });

    it('should fetch single crs defintions and converted extents', (done) => {
        mockAxios.onGet().reply((req) => {
            if (req.url.match(/\/rest\/crs\/EPSG:3003\.json/)) {
                return [200, CRS_3003];
            }
            return [404];
        });
        getProjectionDef(baseUrl, 'EPSG:3003').then((response) => {
            try {
                expect(response).toBeTruthy();
                expect(response.code).toBe('EPSG:3003');
                expect(response.def).toBeTruthy();
                /**
                 * original extents structurefrom geoserver /rest/crs/EPSG:3003.json response:
                    "bbox": {
                        "minX": 1225120.5877618603,
                        "minY": 4042801.8066786793,
                        "maxX": 1768610.1021991086,
                        "maxY": 5214284.214272945
                    },
                    "bboxWGS84": {
                        "minX": 5.93,
                        "minY": 36.53,
                        "maxX": 12.0,
                        "maxY": 47.04
                    },
                 */
                expect(response.extent).toEqual([1225120.5877618603, 4042801.8066786793, 1768610.1021991086, 5214284.214272945]);
                expect(response.worldExtent).toEqual([5.93, 36.53, 12.0, 47.04]);
            } catch (e) {
                done(e);
            }
            done();
        });
    });

    it('should reject when the WKT definition is unparseable by proj4', (done) => {
        mockAxios.onGet().reply(() => [200, {
            id: 'EPSG:9999',
            // proj4 throws on this - the typical 'too complex for WKT syntax'
            // class of GeoServer responses for geographic 3D codes.
            definition: 'NOT A REAL WKT',
            bbox: { minX: 0, minY: 0, maxX: 1, maxY: 1 },
            bboxWGS84: { minX: 0, minY: 0, maxX: 1, maxY: 1 }
        }]);
        getProjectionDef(baseUrl, 'EPSG:9999').then(
            () => done(new Error('expected getProjectionDef to reject on unparseable WKT')),
            (err) => {
                try {
                    expect(err).toBeTruthy();
                    expect(err.message).toMatch(/Unparseable or unitless/);
                    done();
                } catch (e) {
                    done(e);
                }
            }
        );
    });

    it('should reject when server reports a malformed bbox (e.g. CRS:83)', (done) => {
        mockAxios.onGet().reply(() => [200, {
            id: 'CRS:83',
            definition: 'GEOGCS["NAD83 longitude-latitude", AUTHORITY["Web Map Service CRS","83"]]',
            // minX > maxX: would produce a negative-width extent and break tile-math downstream
            bbox: { minX: 167.65, minY: 14.92, maxX: -40.73, maxY: 86.45 },
            bboxWGS84: { minX: 167.65, minY: 14.92, maxX: -40.73, maxY: 86.45 }
        }]);
        getProjectionDef(baseUrl, 'CRS:83').then(
            () => done(new Error('expected getProjectionDef to reject on malformed bbox')),
            (err) => {
                try {
                    expect(err).toBeTruthy();
                    expect(err.message).toMatch(/Invalid coordinate bounds/);
                    done();
                } catch (e) {
                    done(e);
                }
            }
        );
    });
});
