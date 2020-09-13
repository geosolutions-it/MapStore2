/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {SAVE_USER_SESSION, USER_SESSION_SAVED, LOAD_USER_SESSION, USER_SESSION_LOADED, USER_SESSION_LOADING,
    REMOVE_USER_SESSION, USER_SESSION_REMOVED, SAVE_MAP_CONFIG, USER_SESSION_START_SAVING, USER_SESSION_STOP_SAVING,
    SET_USER_SESSION,
    saveUserSession, userSessionSaved, loadUserSession, userSessionLoaded, loading, setUserSession,
    removeUserSession, userSessionRemoved, saveMapConfig, userSessionStartSaving, userSessionStopSaving} from "../usersession";

describe('Test correctness of the usersession actions', () => {

    it('save user session', () => {
        const action = saveUserSession();
        expect(action.type).toBe(SAVE_USER_SESSION);
    });
    it('user session saved', () => {
        const action = userSessionSaved(1, {
            attribute: "myvalue"
        });
        expect(action.type).toBe(USER_SESSION_SAVED);
        expect(action.id).toBe(1);
        expect(action.session.attribute).toBe("myvalue");
    });
    it('loading', () => {
        const action = loading(true, "loading");
        expect(action.type).toBe(USER_SESSION_LOADING);
        expect(action.name).toBe("loading");
        expect(action.value).toBe(true);
    });
    it('load user session', () => {
        const action = loadUserSession("name");
        expect(action.type).toBe(LOAD_USER_SESSION);
        expect(action.name).toBe("name");
    });
    it('user session loaded', () => {
        const action = userSessionLoaded(1, {
            attribute: "myvalue"
        });
        expect(action.type).toBe(USER_SESSION_LOADED);
        expect(action.id).toBe(1);
        expect(action.session.attribute).toBe("myvalue");
    });
    it('remove user session', () => {
        const action = removeUserSession();
        expect(action.type).toBe(REMOVE_USER_SESSION);
    });
    it('user session removed', () => {
        const action = userSessionRemoved();
        expect(action.type).toBe(USER_SESSION_REMOVED);
    });
    it('user session start saving', () => {
        const action = userSessionStartSaving();
        expect(action.type).toBe(USER_SESSION_START_SAVING);
    });
    it('user session stop saving', () => {
        const action = userSessionStopSaving();
        expect(action.type).toBe(USER_SESSION_STOP_SAVING);
    });
    it('set user session', () => {
        const action = setUserSession({
            map: {}
        });
        expect(action.type).toBe(SET_USER_SESSION);
        expect(action.session).toExist();
        expect(action.session.map).toExist();
    });
    it('save map config', () => {
        const action = saveMapConfig({});
        expect(action.type).toBe(SAVE_MAP_CONFIG);
        expect(action.config).toExist();
    });
});
