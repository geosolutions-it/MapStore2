/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const GF_RULE1 = require('../../test-resources/geofence/rest/rules/full_rule1.json');
const GS_RULE1 = require('../../test-resources/geoserver/rest/geofence/full_rule1.json');
const { convertRuleGS2GF, convertRuleGF2GS } = require('../RuleServiceUtils');


const expect = require('expect');
describe('RuleServiceUtils', () => {

    it('convertRuleGF2GS', () => {
        const converted = convertRuleGF2GS(GF_RULE1);
        Object.keys(converted).map(k => {
            expect(converted[k]).toEqual(GS_RULE1[k]);
        });
        // check layerDetails not supported
        expect(convertRuleGF2GS({ ...GF_RULE1 }).layerDetails).toNotExist();
        expect(convertRuleGF2GS({ ...GF_RULE1, layer: undefined }).layerDetails).toNotExist();
    });
    it('convertRuleGS2GF', () => {
        const converted = convertRuleGS2GF(GS_RULE1);
        Object.keys(converted).map(k => {
            if (k !== "constraints") { // NOT SUPPORTED
                expect(converted[k]).toEqual(GF_RULE1[k]);
            }

        });
    });

});
