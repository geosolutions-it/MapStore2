/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    isRulePristine,
    isSaveDisabled,
    areDetailsActive,
    isRuleValid,
    askConfirm,
    isGSInstancePristine,
    isSaveGSInstanceDisabled
} from '../RulesEditorUtils';
import ConfigUtils from '../ConfigUtils';


describe('RulesEditorUtils', () => {
    describe('isRulePristine', () => {
        it('should return true if currentRule equals initRule', () => {
            const rule = { id: 1, name: "test" };
            expect(isRulePristine(rule, rule)).toBe(true);
        });

        it('should return false if currentRule differs from initRule', () => {
            const current = { id: 1, name: "test" };
            const init = { id: 1, name: "changed" };
            expect(isRulePristine(current, init)).toBe(false);
        });
    });

    describe('isSaveDisabled for non stand-alone geofence', () => {
        beforeEach(() => {
            ConfigUtils.setConfigProp("geoFenceServiceType", "geoserver");
        });
        afterEach(() => {
            ConfigUtils.removeConfigProp("geoFenceServiceType");
        });
        it('should return true if rule is pristine and has id (non-geofence)', () => {
            const current = { id: 1, name: "test" };
            const init = { id: 1, name: "test" };
            expect(isSaveDisabled(current, init)).toBe(true);
        });

        it('should return false if rule is modified (non-geofence)', () => {
            const current = { id: 1, name: "modified" };
            const init = { id: 1, name: "original" };
            expect(isSaveDisabled(current, init)).toBe(false);
        });
    });
    describe('isSaveDisabled for stand-alone geofence', () => {
        beforeEach(() => {
            ConfigUtils.setConfigProp("geoFenceServiceType", "geofence");
        });
        afterEach(() => {
            ConfigUtils.removeConfigProp("geoFenceServiceType");
        });
        it('should return true if rule is pristine and has id (standalone geofence) but NO instance', () => {
            const current = { id: 1, name: "test" }; // no instance
            const init = { id: 1, name: "test" };
            expect(isSaveDisabled(current, init)).toBe(true);
        });

        it('should return false if rule is pristine and has id AND instance (standalone geofence)', () => {
            const current = { id: 1, name: "test", instance: { id: "inst1" } };
            const init = { id: 1, name: "test" };
            expect(isSaveDisabled(current, init)).toBe(false); // NOT disabled because instance is selected
        });

        it('should return true if rule is pristine and has id AND instance is null/undefined (standalone geofence)', () => {
            const current = { id: 1, name: "test", instance: null };
            const init = { id: 1, name: "test" };
            expect(isSaveDisabled(current, init)).toBe(true);
        });
    });

    describe('areDetailsActive', () => {
        it('should return true if layer exists and grant is not DENY', () => {
            expect(areDetailsActive("someLayer", { grant: "ALLOW" })).toBe(true);
        });

        it('should return false if layer is falsy', () => {
            expect(areDetailsActive(null, { grant: "ALLOW" })).toBe(false);
        });

        it('should return false if grant is DENY', () => {
            expect(areDetailsActive("someLayer", { grant: "DENY" })).toBe(false);
        });

        it('should return true if grant is undefined', () => {
            expect(areDetailsActive("someLayer", {})).toBe(true);
        });
    });

    describe('isRuleValid', () => {
        it('should return true if ipaddress is empty', () => {
            expect(isRuleValid({})).toBe(true);
            expect(isRuleValid({ ipaddress: "" })).toBe(true);
        });

        it('should return true if ipaddress is valid CIDR', () => {
            expect(isRuleValid({ ipaddress: "192.168.1.1/24" })).toBe(true);
        });

        it('should return false if ipaddress is invalid', () => {
            expect(isRuleValid({ ipaddress: "999.999.999.999/99" })).toBe(false);
            expect(isRuleValid({ ipaddress: "invalid" })).toBe(false);
        });

        it('should return true if ipaddress is null', () => {
            expect(isRuleValid({ ipaddress: null })).toBe(true);
        });
    });

    describe('askConfirm', () => {
        it('should return true if constraints exist and key is "workspace"', () => {
            expect(askConfirm({ constraints: { type: "area" } }, "workspace", "ws1")).toBe(true);
        });

        it('should return true if constraints exist and key is "layer"', () => {
            expect(askConfirm({ constraints: { type: "area" } }, "layer", "layer1")).toBe(true);
        });

        it('should return true if constraints exist and key is "grant" with value not "ALLOW"', () => {
            expect(askConfirm({ constraints: { type: "area" } }, "grant", "DENY")).toBe(true);
        });

        it('should return false if constraints exist and key is "grant" with value "ALLOW"', () => {
            expect(askConfirm({ constraints: { type: "area" } }, "grant", "ALLOW")).toBe(false);
        });

        it('should return true if constraints exist and key is "instance"', () => {
            expect(askConfirm({ constraints: { type: "area" } }, "instance", { id: "inst1" })).toBe(true);
        });

        it('should return false if constraints is empty', () => {
            expect(askConfirm({}, "workspace", "ws1")).toBe(false);
        });

        it('should return false if constraints is undefined', () => {
            expect(askConfirm(undefined, "workspace", "ws1")).toBe(false);
        });
    });

    describe('isGSInstancePristine', () => {
        it('should return true if currentGSInstance equals initGSInstance', () => {
            const inst = { id: "inst1", url: "http://localhost" };
            expect(isGSInstancePristine(inst, inst)).toBe(true);
        });

        it('should return false if instances differ', () => {
            const current = { id: "inst1", url: "http://localhost" };
            const init = { id: "inst1", url: "http://remote" };
            expect(isGSInstancePristine(current, init)).toBe(false);
        });
    });

    describe('isSaveGSInstanceDisabled', () => {
        it('should return true if pristine and has id', () => {
            const current = { id: "inst1", url: "http://localhost" };
            const init = { id: "inst1", url: "http://localhost" };
            expect(isSaveGSInstanceDisabled(current, init)).toBe(true);
        });

        it('should return false if not pristine', () => {
            const current = { id: "inst1", url: "http://changed" };
            const init = { id: "inst1", url: "http://localhost" };
            expect(isSaveGSInstanceDisabled(current, init)).toBe(false);
        });

        it('should return false if no id', () => {
            const current = { url: "http://localhost" };
            const init = { url: "http://localhost" };
            expect(isSaveGSInstanceDisabled(current, init)).toBe(false);
        });
    });

});
