/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import expect  from 'expect';
import ConfigUtils from '../../utils/ConfigUtils';
import { userSessionIdSelector, userSessionSelector, userSessionEnabledSelector,
    userSessionSaveFrequencySelector, userSessionBackupFrequencySelector, originalConfigSelector,
    buildSessionName, userSessionNameSelector, userSessionToSaveSelector } from "../usersession";

describe('Test usersession selector', () => {
    const session = {
        attribute: "value"
    };
    beforeEach((done) => {
        ConfigUtils.setConfigProp("userSessions", {
            enabled: false
        });
        done();
    });
    it('test userSessionIdSelector', () => {
        expect(userSessionIdSelector({ usersession: {id: 1, session} })).toBe(1);
    });
    it('test userSessionSelector', () => {
        expect(userSessionSelector({ usersession: { id: 1, session } }).attribute).toBe("value");
    });
    it('test userSessionEnabledSelector enabled on config and not anonymous', () => {
        ConfigUtils.setConfigProp("userSessions", {
            enabled: true
        });
        expect(userSessionEnabledSelector({ security: { user: {name: "myuser"} } })).toBe(true);
    });
    it('test userSessionEnabledSelector disabled on config and anonymous', () => {
        ConfigUtils.setConfigProp("userSessions", {
            enabled: true
        });
        expect(userSessionEnabledSelector({ security: { user: {} } })).toBe(false);
    });
    it('test userSessionEnabledSelector disabled on default config', () => {
        expect(userSessionEnabledSelector({ security: { user: {} } })).toBe(false);
    });
    it('test userSessionSaveFrequencySelector has a default', () => {
        expect(userSessionSaveFrequencySelector({})).toExist();
    });
    it('test userSessionSaveFrequencySelector can be overridden', () => {
        ConfigUtils.setConfigProp("userSessions", {
            enabled: true,
            saveFrequency: 1000
        });
        expect(userSessionSaveFrequencySelector({})).toBe(1000);
    });
    it('test userSessionBackupFrequencySelector has a default', () => {
        expect(userSessionBackupFrequencySelector({})).toExist();
    });
    it('test userSessionBackupFrequencySelector can be overridden', () => {
        ConfigUtils.setConfigProp("userSessions", {
            enabled: true,
            backupFrequency: 10
        });
        expect(userSessionBackupFrequencySelector({})).toBe(10);
    });
    it('test originalConfigSelector extracts config if exists', () => {
        expect(originalConfigSelector({
            usersession: {config: {}}
        })).toExist();
    });
    it('test originalConfigSelector does not extract config if it does not exists', () => {
        expect(originalConfigSelector({})).toNotExist();
    });
    it('test buildSessionName with context and map', () => {
        expect(buildSessionName("c", "m", "user")).toBe("c.m.user");
    });
    it('test buildSessionName with context', () => {
        expect(buildSessionName("c", null, "user")).toBe("c.user");
    });
    it('test buildSessionName with map', () => {
        expect(buildSessionName(null, "m", "user")).toBe("default.m.user");
    });
    it('test buildSessionName with contextOnly option', () => {
        ConfigUtils.setConfigProp("userSessions", {
            enabled: true,
            contextOnly: true
        });
        expect(buildSessionName("c", "m", "user")).toBe("c.user");
    });
    it('test userSessionNameSelector', () => {
        expect(userSessionNameSelector({context: {resource: {id: "c"}}, mapInitialConfig: {mapId: "m"}, security: { user: {name: "user"} }})).toBe("c.m.user");
    });
    it('test userSessionToSaveSelector', () => {
        const state = userSessionToSaveSelector({layers: {flat: [{}], groups: [{}]}, map: { center: {x: 10, y: 40}, zoom: 6}});
        expect(state).toExist();
        expect(state.map).toExist();
        expect(state.map.zoom).toBe(6);
        expect(state.map.center.x).toBe(10);
        expect(state.map.center.y).toBe(40);
        expect(state.map.layers).toExist();
        expect(state.map.layers.length).toBe(1);
        expect(state.map.groups.length).toBe(1);
    });
});
