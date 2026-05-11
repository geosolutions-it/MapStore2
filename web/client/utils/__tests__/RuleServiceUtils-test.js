/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import GF_RULE1 from '../../test-resources/geofence/rest/rules/full_rule1.json';

import GS_RULE1 from '../../test-resources/geoserver/rest/geofence/full_rule1.json';
import ConfigUtils from '../ConfigUtils';
import { convertRuleGS2GF, convertRuleGF2GS, hasConfiguredGSSlaves, expandInstancesWithSlaves } from '../RuleServiceUtils';
import expect from 'expect';
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
    it("test hasConfiguredGSSlaves", () => {
        ConfigUtils.setConfigProp('additionalGsInstancesUrls', {
            "master1": [
                {"url": "http://localhost:8081/geoserver1/slave1", "name": "slave1"},
                {"url": "http://localhost:8081/geoserver1/slave2", "name": "slave2"},
                {"url": "http://localhost:8081/geoserver1/slave3", "name": "slave3"}
            ]
        });
        let hasSlaves = hasConfiguredGSSlaves('master1');
        expect(hasSlaves).toEqual(true);
        hasSlaves = hasConfiguredGSSlaves('master2');
        expect(hasSlaves).toEqual(false);
        ConfigUtils.removeConfigProp("additionalGsInstancesUrls");
    });
    describe('test expandInstancesWithSlaves', () => {
        afterEach(() => {
        // Clean up after each test
            ConfigUtils.removeConfigProp("additionalGsInstancesUrls");
        });
        it("should return the same instance if no slaves are configured", () => {
            const instances = [
                { name: "master1", url: "http://localhost:8080/geoserver1" }
            ];

            // No config set, or empty config
            ConfigUtils.setConfigProp('additionalGsInstancesUrls', {});

            const result = expandInstancesWithSlaves(instances);
            expect(result).toEqual(instances);
            expect(result.length).toBe(1);
        });
        it("should expand a single master instance with its configured slaves", () => {
            const instances = [
                { name: "master1", url: "http://localhost:8080/geoserver1" }
            ];

            ConfigUtils.setConfigProp('additionalGsInstancesUrls', {
                "master1": [
                    { url: "http://localhost:8081/slave1", name: "slave1" },
                    { url: "http://localhost:8081/slave2", name: "slave2" }
                ]
            });

            const result = expandInstancesWithSlaves(instances);

            expect(result.length).toBe(3); // 1 master + 2 slaves
            expect(result[0]).toEqual({ name: "master1", url: "http://localhost:8080/geoserver1" });
            expect(result[1]).toEqual({ url: "http://localhost:8081/slave1", name: "slave1" });
            expect(result[2]).toEqual({ url: "http://localhost:8081/slave2", name: "slave2" });
        });
        it("should expand multiple masters with their respective slaves", () => {
            const instances = [
                { name: "master1", url: "http://localhost:8080/geoserver1" },
                { name: "master2", url: "http://localhost:8080/geoserver2" }
            ];

            ConfigUtils.setConfigProp('additionalGsInstancesUrls', {
                "master1": [
                    { url: "http://localhost:8081/master1-slave1", name: "master1-slave1" }
                ],
                "master2": [
                    { url: "http://localhost:8082/master2-slave1", name: "master2-slave1" },
                    { url: "http://localhost:8082/master2-slave2", name: "master2-slave2" }
                ]
            });

            const result = expandInstancesWithSlaves(instances);

            expect(result.length).toBe(5); // 2 masters + 1 slave + 2 slaves
        });

        it("should handle instances that have no corresponding config entry", () => {
            const instances = [
                { name: "master1", url: "http://localhost:8080/geoserver1" },
                { name: "unknownMaster", url: "http://localhost:8080/geoserverUnknown" }
            ];

            ConfigUtils.setConfigProp('additionalGsInstancesUrls', {
                "master1": [
                    { url: "http://localhost:8081/slave1", name: "slave1" }
                ]
            });

            const result = expandInstancesWithSlaves(instances);

            expect(result.length).toBe(3); // master1, slave1, unknownMaster
            expect(result[0].name).toBe("master1");
            expect(result[1].name).toBe("slave1");
            expect(result[2].name).toBe("unknownMaster");
        });
    });

});
