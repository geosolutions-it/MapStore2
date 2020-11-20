/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import axios from '../../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';
import SAMPLE_IMPORTS_1 from '../../../test-resources/importer/imports.json';
const BASE_URL = '/GEOSERVER_TEST/';
import Importer from '../Importer';
describe('GeoServer Importer API', () => {
    let mock;
    beforeEach(() => {
        mock = new MockAdapter(axios);
    });
    afterEach(() => {
        mock.restore();
    });
    it('getImports', done => {
        mock.onGet(`${BASE_URL}imports`).reply(200, SAMPLE_IMPORTS_1);
        Importer.getImports(BASE_URL).then( ({data}) => {
            expect(data.imports).toExist();
            expect((data.imports).length).toBe(2);
            done();
        }).catch(e=> done(e));
    });
    it('uploadFiles', done => {
        const ID = 1;
        const FILE_NAME = 'foobar.txt';
        const FILE_CONTENT = ['foo', 'bar'];

        const FILE = new File(FILE_CONTENT, FILE_NAME);
        mock.onPost(`${BASE_URL}imports/${ID}/tasks`).reply((config) => {
            expect(config.data).toExist();
            expect(config.data.get(FILE_NAME)).toExist();
            expect(config.data.get(FILE_NAME).name).toBe(FILE_NAME);
            return [200];
        });
        Importer.uploadImportFiles(BASE_URL, ID, [FILE]).then(() => {
            done();
        }).catch(e => done(e));
    });
    it('runImport', done => {
        const ID = 1;
        mock.onPost(`${BASE_URL}imports/${ID}?async=true`).reply( (config) => {
            // check that the post do not contains default axios Content-Type
            // to prevent GeoServer to fail because of invalid Content-Type
            // (POST request with empty body should not have Content-Type)
            expect(config.headers['Content-Type']).toBe('');
            return [200, ''];
        });
        Importer.runImport(BASE_URL, ID).then(({}) => {
            done();
        }).catch(e => done(e));
    });
});
