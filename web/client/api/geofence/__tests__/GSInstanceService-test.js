/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const BASE_URL = "TEST";

import MockAdapter from 'axios-mock-adapter';
import expect from 'expect';
import GS_INSTANCES from 'raw-loader!../../../test-resources/geofence/rest/rules/gsInstances.xml';

import axios from '../../../libs/ajax';
import GF_INSTANCE from '../../../test-resources/geofence/rest/rules/full_gsInstance1.json';
import gsInstanceServiceFactory, {cleanConstraintsForUpdate} from '../GSInstanceService';

const GSInstanceService = gsInstanceServiceFactory({
    addBaseUrl: (opts) => ({...opts, baseURL: BASE_URL}),
    getGeoServerInstance: () => ({url: BASE_URL})
});

let mockAxios;


describe('GSInstanceService API for GeoFence StandAlone', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });
    it('loadGSInstances', (done) => {
        mockAxios.onGet().reply(config => {
            expect(config.url).toBe(`/instances`);
            expect(config.baseURL).toBe(`${BASE_URL}`);
            return [200, GS_INSTANCES];
        });
        GSInstanceService.loadGSInstances().then(v => {
            expect(v.instances).toExist();
            expect(v.instances.length).toBe(5);
            done();
        });
    });
    it('loadGSInstancesForDD', (done) => {
        mockAxios.onGet().reply(config => {
            expect(config.url).toBe(`/instances`);
            expect(config.baseURL).toBe(`${BASE_URL}`);
            return [200, GS_INSTANCES];
        });
        GSInstanceService.loadGSInstancesForDD().then(v => {
            expect(v.data).toExist();
            expect(v.data.length).toBe(5);
            done();
        });
    });
    it('addGSInstance', (done) => {
        mockAxios.onPost().reply(config => {
            expect(config.url).toBe(`/instances`);
            expect(config.baseURL).toBe(`${BASE_URL}`);
            expect(config.method).toBe('post');
            const rule = JSON.parse(config.data);
            Object.keys(rule).fill(k => k !== 'constraints').map(k => {
                expect(rule[k]).toEqual(GF_INSTANCE[k]);
            });
            return [200];
        });
        GSInstanceService.addGSInstance(GF_INSTANCE).then(() => {
            done();
        });
    });
    it('deleteGSInstance', (done) => {
        mockAxios.onDelete().reply(config => {
            expect(config.url).toBe(`/instances/id/1`);
            expect(config.baseURL).toBe(`${BASE_URL}`);
            expect(config.method).toBe('delete');
            return [200];
        });
        GSInstanceService.deleteGSInstance(1).then(() => {
            done();
        });
    });
    it('updateGSInstance', (done) => {
        mockAxios.onPut().reply(config => {
            expect(config.url).toBe(`/instances/id/1`);
            expect(config.baseURL).toBe(`${BASE_URL}`);
            expect(config.method).toBe('put');
            return [200];
        });
        GSInstanceService.updateGSInstance({
            "id": 1,
            "name": "geoserver1",
            "url": "http://localhost:8080",
            "description": "description"
        }).then(() => {
            done();
        });
    });
    it('cleanConstraintsForUpdate for update gs instance', () => {
        let editedGSInstance = {
            id: "1",
            name: "geoserver",
            url: "http://localhost:8080/geoserver",
            description: "geoserver description"
        };
        // edit includes description only
        let cleanedGSInstanceForEdit1 = cleanConstraintsForUpdate(editedGSInstance);
        expect(cleanedGSInstanceForEdit1).toEqual({
            description: "geoserver description"
        });
        // edit includes url
        let cleanedGSInstanceForEdit2 = cleanConstraintsForUpdate({...editedGSInstance, baseURL: "http://localhost:8080/geoserver1"});
        expect(cleanedGSInstanceForEdit2).toEqual({
            description: "geoserver description",
            baseURL: "http://localhost:8080/geoserver1"
        });
    });
});
