import expect from 'expect';
import MockAdapter from 'axios-mock-adapter';
import { testEpic } from './epicTestUtils';
import ConfigUtils from '../../utils/ConfigUtils';
import {
    SAVE_GS_INSTANCE,
    CACHE_CLEAN_MULTI,
    GS_INSTSANCE_SAVED,
    setLoading,
    SAVE_RULE,
    DELETE_RULES,
    CACHE_CLEAN,
    DELETE_GS_INSTSANCES,
    RULE_SAVED
} from '../../actions/rulesmanager';
import { success, error } from '../../actions/notifications';
import { drawSupportReset } from '../../actions/draw';
import rulesManagerEpics from '../rulesmanager';
import axios from '../../libs/ajax';
import GF_RULE from '../../test-resources/geofence/rest/rules/full_rule1.json';

let mockAxios;

describe('rulesmanager EPICS', () => {

    beforeEach((done) => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
        if (ConfigUtils.removeConfigProp) {
            ConfigUtils.removeConfigProp("additionalGsInstancesUrls");
        }
    });

    afterEach((done) => {
        mockAxios.restore();
        setTimeout(done);
        if (ConfigUtils.removeConfigProp) {
            ConfigUtils.removeConfigProp("additionalGsInstancesUrls");
        }
    });

    it('should handle SAVE_GS_INSTANCE (create) successfully', (done) => {
        const newInstance = { name: 'newInstance', url: 'http://new.url' };

        testEpic(
            rulesManagerEpics.onSaveGSInstance,
            4,
            { type: SAVE_GS_INSTANCE, instance: newInstance },
            (actions) => {
                expect(actions.some(a => a.type === GS_INSTSANCE_SAVED)).toBe(true);
                expect(actions.some(a => a.type === drawSupportReset().type)).toBe(true);
                expect(actions.some(a => a.type === success().type && a.message === "rulesmanager.successSavedGSInstance")).toBe(true);
                expect(actions.some(a => a.type === setLoading(false).type)).toBe(true);
                done();
            },
            {}
        );
        done();
    });
    it('should handle SAVE_RULE error (duplicate)', (done) => {
        mockAxios.onPost().reply(400, "Duplicate is exists");
        testEpic(
            rulesManagerEpics.onSave,
            3,
            { type: SAVE_RULE, rule: GF_RULE },
            (actions) => {
                const errAction = actions.find(a => a.type === error().type);
                expect(errAction).toExist();
                expect(errAction.message).toBe("rulesmanager.errorDuplicateRule");
                done();
            },
            {}
        );
    });

    it('should handle DELETE_RULES successfully', (done) => {
        mockAxios.onDelete().reply(200);

        testEpic(
            rulesManagerEpics.onDelete,
            4,
            { type: DELETE_RULES, ids: [1, 2] },
            (actions) => {
                expect(actions.some(a => a.type === RULE_SAVED)).toBe(true);
                done();
            },
            { rulesmanager: { selectedRules: [{id: 1}, {id: 2}] } }
        );
    });
    it('should handle CACHE_CLEAN successfully', (done) => {
        mockAxios.onGet().reply(200);

        testEpic(
            rulesManagerEpics.onCacheClean,
            3,
            { type: CACHE_CLEAN, gsInstanceUrl: 'http://test.com' },
            (actions) => {
                const successAction = actions.find(a => a.type === success().type);
                expect(successAction).toExist();
                expect(successAction.message).toBe("rulesmanager.cacheCleaned");
                done();
            },
            {}
        );
    });
    it('should handle CACHE_CLEAN error', (done) => {
        mockAxios.onGet().reply(400);

        testEpic(
            rulesManagerEpics.onCacheClean,
            3,
            { type: CACHE_CLEAN, gsInstanceUrl: 'http://test.com' },
            (actions) => {
                const errAction = actions.find(a => a.type === error().type);
                expect(errAction).toExist();
                expect(errAction.message).toBe("rulesmanager.errorCleaningCache");
                done();
            },
            {}
        );
    });
    it('should expand slaves and clean cache for master and slaves', (done) => {
        ConfigUtils.setConfigProp('additionalGsInstancesUrls', {
            "master1": [
                { url: "http://slave1", name: "slave1" },
                { url: "http://slave2", name: "slave2" }
            ]
        });

        const action = {
            type: CACHE_CLEAN_MULTI,
            gsInstances: [
                { name: "master1", url: "http://master1" }
            ]
        };

        testEpic(
            rulesManagerEpics.onCacheCleanMulti,
            3,
            action,
            (actions) => {
                expect(actions[0].type).toEqual(setLoading(true).type);

                const successAction = actions.find(a => a.type === success().type);
                expect(successAction).toExist();
                expect(successAction.values.instancesNames).toContain("master1");
                expect(successAction.values.instancesNames).toContain("slave1");
                expect(successAction.values.instancesNames).toContain("slave2");

                expect(actions[actions.length - 1].type).toEqual(setLoading(false).type);

                done();
            },
            {}
        );
        done();
    });

    it('should report partial failure when some slaves fail', (done) => {
        ConfigUtils.setConfigProp('additionalGsInstancesUrls', {
            "master1": [
                { url: "http://slave1", name: "slave1" }
            ]
        });

        const action = {
            type: CACHE_CLEAN_MULTI,
            gsInstances: [
                { name: "master1", url: "http://master1" }
            ]
        };

        testEpic(
            rulesManagerEpics.onCacheCleanMulti,
            3,
            action,
            (actions) => {
                const errorAction = actions.find(a => a.type === error().type);
                expect(errorAction).toExist();
                expect(errorAction.values.instancesNames).toContain("slave1");
                expect(errorAction.values.instancesNames).toNotContain("master1");

                done();
            },
            {}
        );
        done();
    });
    it('should handle SAVE_GS_INSTANCE error (duplicate)', (done) => {
        mockAxios.onPost().reply(400, "Instance is already exists");
        const newInstance = { name: 'Instance', url: 'http://dup.url' };

        testEpic(
            rulesManagerEpics.onSaveGSInstance,
            3,
            { type: SAVE_GS_INSTANCE, instance: newInstance },
            (actions) => {
                const errAction = actions.find(a => a.type === error().type);
                expect(errAction).toExist();
                expect(errAction.message).toBe("rulesmanager.errorDuplicateGSInstance");
                done();
            },
            {}
        );
    });
    it('should handle DELETE_GS_INSTSANCES successfully', (done) => {
        mockAxios.onDelete().reply(200);

        testEpic(
            rulesManagerEpics.onDeleteGSInstance,
            4,
            { type: DELETE_GS_INSTSANCES, ids: [1] },
            (actions) => {
                expect(actions.some(a => a.type === GS_INSTSANCE_SAVED)).toBe(true);
                expect(actions.some(a => a.type === drawSupportReset().type)).toBe(true);

                const successAction = actions.find(a => a.type === success().type);
                expect(successAction).toExist();
                expect(successAction.values.successfulNum).toBe(1);

                expect(actions.some(a => a.type === setLoading(false).type)).toBe(true);
                done();
            },
            { rulesmanager: { selectedGSInstances: [{id: 1, name: 'test'}] } }
        );
    });
});
