/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { testEpic } from './epicTestUtils';
import { saveUserSessionEpicCreator, autoSaveSessionEpicCreator, loadUserSessionEpicCreator } from "../usersession";
import { saveUserSession, loadUserSession,
    USER_SESSION_SAVED, USER_SESSION_LOADING, SAVE_USER_SESSION, USER_SESSION_LOADED } from "../../actions/usersession";
import { SHOW_NOTIFICATION } from "../../actions/notifications";
import expect from "expect";

import axios from "../../libs/ajax";
import MockAdapter from "axios-mock-adapter";

describe('usersession Epics', () => {
    let mockAxios;
    const initialState = {
        sample1: "sample1",
        sample2: "sample2",
        id: "id",
        security: {
            user: {
                name: "myuser"
            }
        }
    };
    const sessionSelector = (state) => ({
        sample1: state.sample1,
        sample2: state.sample2
    });
    const idSelector = (state) => state.id + "." + state.security.user.name;
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });
    afterEach(() => {
        mockAxios.restore();
    });
    it('user session is saved using data from sessionSelector', (done) => {
        mockAxios.onPost().reply(200, "1");
        mockAxios.onGet().reply(200, {});
        testEpic(saveUserSessionEpicCreator(idSelector, sessionSelector), 2, saveUserSession(), (actions) => {
            expect(actions[0].type).toBe(USER_SESSION_LOADING);
            expect(actions[1].type).toBe(USER_SESSION_SAVED);
            expect(actions[1].id).toBe(1);
            expect(actions[1].session.sample1).toBe("sample1");
            expect(actions[1].session.sample2).toBe("sample2");
        }, initialState, done);
    });
    it('user session name is taken from idSelector during save', (done) => {
        mockAxios.onPost().reply(200, "1");
        mockAxios.onGet().reply(200, {});
        testEpic(saveUserSessionEpicCreator(idSelector, sessionSelector), 2, saveUserSession(), (actions) => {
            expect(actions[0].type).toBe(USER_SESSION_LOADING);
            expect(actions[1].type).toBe(USER_SESSION_SAVED);
            expect(mockAxios.history.post[0].data).toContain("id.myuser");
        }, initialState, done);
    });
    it('user session is indexed by username during save', (done) => {
        mockAxios.onPost().reply(200, "1");
        mockAxios.onGet().reply(200, {});
        testEpic(saveUserSessionEpicCreator(idSelector, sessionSelector), 2, saveUserSession(), (actions) => {
            expect(actions[0].type).toBe(USER_SESSION_LOADING);
            expect(actions[1].type).toBe(USER_SESSION_SAVED);
            expect(mockAxios.history.post[0].data).toContain("<value>myuser</value>");
        }, initialState, done);
    });
    it('error is shown if there is an error from server when saving session', (done) => {
        mockAxios.onPost().reply(500);
        testEpic(saveUserSessionEpicCreator(idSelector, sessionSelector), 2, saveUserSession(), (actions) => {
            expect(actions[0].type).toBe(USER_SESSION_LOADING);
            expect(actions[1].type).toBe(SHOW_NOTIFICATION);
        }, initialState, done);
    });
    it('if USERSESSION category does not exist it is created', (done) => {
        mockAxios.onPost("/rest/geostore/resources/").replyOnce(404, "Resource Category not found")
            .onPost("/rest/geostore/resources/").replyOnce(200, "1");
        mockAxios.onPost("/rest/geostore/categories").reply(200);
        mockAxios.onPost("/rest/geostore/resources/resource/1/permissions").reply(200);
        mockAxios.onGet().reply(200, {});
        testEpic(saveUserSessionEpicCreator(idSelector, sessionSelector), 2, saveUserSession(), (actions) => {
            expect(actions[0].type).toBe(USER_SESSION_LOADING);
            expect(actions[1].type).toBe(USER_SESSION_SAVED);
        }, initialState, done);
    });
    it('user session is updated if id exists', (done) => {
        mockAxios.onPost().reply(200, "1");
        mockAxios.onPut().reply(200, "1");
        mockAxios.onGet().reply(200, {});
        testEpic(saveUserSessionEpicCreator(idSelector, sessionSelector, () => 1), 2, saveUserSession(), (actions) => {
            expect(actions[0].type).toBe(USER_SESSION_LOADING);
            expect(actions[1].type).toBe(USER_SESSION_SAVED);
            expect(mockAxios.history.put.length).toBe(2);
            expect(mockAxios.history.put[0].url).toBe("/rest/geostore/resources/resource/1");
            expect(mockAxios.history.put[1].url).toBe("/rest/geostore/data/1");
        }, initialState, done);
    });
    it('start and stop user session save', (done) => {
        const store = testEpic(autoSaveSessionEpicCreator('START', 'STOP', 10), (action) => action.type !== "STOP", {type: 'START'}, (actions) => {
            expect(actions[0].type).toBe(SAVE_USER_SESSION);
            expect(actions[actions.length - 1].type).toBe("EPIC_COMPLETED");
        }, initialState, done, true);
        setTimeout(() => {
            store.dispatch({ type: 'STOP' });
        }, 100);
    });
    it('user session name is taken from idSelector when loading', (done) => {
        mockAxios.onGet().reply(200, {});
        testEpic(loadUserSessionEpicCreator(idSelector), 2, loadUserSession(), (actions) => {
            expect(actions[0].type).toBe(USER_SESSION_LOADING);
            expect(actions[1].type).toBe(USER_SESSION_LOADED);
            expect(mockAxios.history.get[0].url).toContain("id.myuser");
            expect(mockAxios.history.get[1].url).toContain("id.myuser");
        }, initialState, done);
    });
});
