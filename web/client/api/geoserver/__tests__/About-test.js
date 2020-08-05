/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { getVersion, clearCache } from '../About';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../../libs/ajax';

let mockAxios;

describe('Test About REST Api', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });

    it('test getVersion', (done) => {
        clearCache();
        const baseUrl = '/geoserver/';

        mockAxios.onGet(/\/manifest/).reply((config) => {
            expect(config.url).toBe(`${baseUrl}rest/about/manifest`);
            return [ 200, { about: { resource: [{ '@name': 'module' }]} }];
        });

        mockAxios.onGet(/\/version/).reply((config) => {
            expect(config.url).toBe(`${baseUrl}rest/about/version`);
            return [ 200, { about: { resource: [{ '@name': 'GeoServer' }] } }];
        });

        getVersion({ baseUrl })
            .then((about) => {
                try {
                    expect(about.version).toEqual([{ name: 'GeoServer' }]);
                    expect(about.manifest).toEqual([{ name: 'module' }]);
                    expect(about.fonts).toBe(null);
                } catch (e) {
                    done(e);
                }
                done();
            });
    });

});
