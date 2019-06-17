/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const BASE_URL = "TEST";
const RuleService = require('../RuleService')({
    addBaseUrl: (opts) => ({...opts, baseURL: BASE_URL}),
    getGeoServerInstance: () => ({url: BASE_URL})
});
const RULES = require('../../../../test-resources/geoserver/rest/geofence/rules.json');
const GF_RULE = require('../../../../test-resources/geofence/rest/rules/full_rule1.json');
const GS_RULE = require('../../../../test-resources/geoserver/rest/geofence/full_rule1.json');
const expect = require('expect');

const axios = require('../../../../libs/ajax');
const MockAdapter = require('axios-mock-adapter');

let mockAxios;


describe('RuleService API for GeoFence StandAlone', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });
    it('getRulesCount', (done) => {
        const PARAMS = { roleName: "ADMIN" };
        mockAxios.onGet().reply(config => {
            expect(config.url).toBe(`${BASE_URL}/rules/count`);
            expect(config.baseURL).toBe(`${BASE_URL}`);
            expect(config.params).toEqual(PARAMS);
            return [200, RULES];
        });
        RuleService.getRulesCount(PARAMS)
            .then(v => {
                expect(v).toBe(2);
                done();
            })
            .catch(e => done(e));
    });
    it('loadRules', (done) => {
        const PARAMS = { roleName: "ADMIN" };
        mockAxios.onGet().reply(config => {
            expect(config.url).toBe(`${BASE_URL}/rules`);
            expect(config.baseURL).toBe(`${BASE_URL}`);
            expect(config.params).toEqual({...PARAMS, page: 1, entries: 10});
            return [200, RULES];
        });
        RuleService.loadRules(1, PARAMS, 10).then(v => {
            expect(v.rules).toExist();
            expect(v.rules.length).toBe(2);
            // check the rules are converted in internal format
            expect(v.rules[0].grant).toBe("ALLOW");
            expect(v.rules[0].rolename).toBe("ADMIN");
            done();
        });
    });
    it('moveRules', (done) => {
        mockAxios.onGet().reply(config => {
            expect(config.url).toBe(`${BASE_URL}/rules/move`);
            expect(config.baseURL).toBe(`${BASE_URL}`);
            expect(config.params).toEqual({ targetPriority: 1, rulesIds: '1,2' });
            return [200, RULES];
        });
        RuleService.moveRules(1, [{id: 1 }, { id: 2 }]).then(v => {
            expect(v.rules).toExist();
            expect(v.rules.length).toBe(2);
            done();
        });
    });
    it('addRule', (done) => {
        mockAxios.onPost().reply(config => {
            expect(config.url).toBe(`${BASE_URL}/rules`);
            expect(config.baseURL).toBe(`${BASE_URL}`);
            expect(config.method).toBe('post');
            const rule = JSON.parse(config.data).Rule;
            Object.keys(rule).map(k => {
                expect(rule[k]).toEqual(GS_RULE[k]);
            });
            expect(rule).toEqual(GS_RULE);
            return [200];
        });
        RuleService.addRule(GF_RULE).then(() => {
            done();
        });
    });
    it('deleteRule', (done) => {
        mockAxios.onDelete().reply(config => {
            expect(config.url).toBe(`${BASE_URL}/rules/id/1`);
            expect(config.baseURL).toBe(`${BASE_URL}`);
            expect(config.method).toBe('delete');
            return [200];
        });
        RuleService.deleteRule(1).then(() => {
            done();
        });
    });
    // TODO: updateRules, cleanCache

});
