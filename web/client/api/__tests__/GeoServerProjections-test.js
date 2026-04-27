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
/**
 * simulate rest api here: https://development.demo.geonode.org/geoserver/rest/crs
 */

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

    beforeEach((done) => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });
    afterEach((done) => {
        if (mockAxios) {
            mockAxios.restore();
        }
        mockAxios = null;
        setTimeout(done);
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

    // fetch single crs definition and extents
    beforeEach((done) => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });
    afterEach((done) => {
        if (mockAxios) {
            mockAxios.restore();
        }
        mockAxios = null;
        setTimeout(done);
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
});
