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
const RULES = require('raw-loader!../../../test-resources/geofence/rest/rules/rules_1.xml');
// const RULES_JSON = require('../../../test-resources/geofence/rest/rules/rules_1.json');
const GF_RULE = require('../../../test-resources/geofence/rest/rules/full_rule1.json');
const expect = require('expect');

const axios = require('../../../libs/ajax');
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
            return [200, '2'];
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
            expect(v.rules.length).toBe(7);
            // check the rules are converted in internal format
            expect(v.rules[0].grant).toBe("ALLOW");
            expect(v.rules[2].rolename).toBe("TEST_ROLE");
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
        RuleService.moveRules(1, [{id: 1 }, { id: 2 }]).then(() => {
            done();
        });
    });
    it('addRule', (done) => {
        mockAxios.onPost().reply(config => {
            expect(config.url).toBe(`${BASE_URL}/rules`);
            expect(config.baseURL).toBe(`${BASE_URL}`);
            expect(config.method).toBe('post');
            const rule = JSON.parse(config.data);
            Object.keys(rule).fill(k => k !== 'constraints').map(k => {
                expect(rule[k]).toEqual(GF_RULE[k]);
            });
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
