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
    USER_SESSION_SAVED, USER_SESSION_LOADING, SAVE_USER_SESSION, USER_SESSION_LOADED, userSessionStartSaving, userSessionStopSaving } from "../../actions/usersession";
import expect from "expect";
import {Providers} from  "../../api/usersession";
import {Observable} from "rxjs";
import ConfigUtils from  "../../utils/ConfigUtils";

describe('usersession Epics', () => {
    const initialState = {
        sample1: "sample1",
        sample2: "sample2",
        id: "1",
        usersession: {
            autoSave: true
        },
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
    const idSelector = (state) => state.id;
    const nameSelector = () => "myname";
    beforeEach(() => {
        ConfigUtils.setConfigProp("userSessions", {
            enabled: true,
            provider: "test"
        });
        Providers.test = {
            getSession: () => Observable.of(["1", {}]),
            writeSession: (id) => Observable.of(id),
            removeSession: () => () => Observable.empty()
        };
    });
    afterEach(() =>  {
        ConfigUtils.setConfigProp("userSessions", {
            enabled: false
        });
        delete Providers.test;
    });
    it('user session is saved using data from sessionSelector', (done) => {
        testEpic(saveUserSessionEpicCreator(sessionSelector, nameSelector, idSelector), 2, saveUserSession(), (actions) => {
            expect(actions[0].type).toBe(USER_SESSION_LOADING);
            expect(actions[1].type).toBe(USER_SESSION_SAVED);
            expect(actions[1].session.sample1).toBe("sample1");
            expect(actions[1].session.sample2).toBe("sample2");
        }, initialState, done);
    });
    it('user session id is taken from idSelector during save', (done) => {
        testEpic(saveUserSessionEpicCreator(sessionSelector, () => null, idSelector), 2, saveUserSession(), (actions) => {
            expect(actions[0].type).toBe(USER_SESSION_LOADING);
            expect(actions[1].type).toBe(USER_SESSION_SAVED);
            expect(actions[1].id).toBe("1");
        }, initialState, done);
    });
    it('start and stop user session save', (done) => {
        const store = testEpic(
            autoSaveSessionEpicCreator(10, () => ({type: 'END'})),
            (action) => action.type !== "END",
            userSessionStartSaving(), (actions) => {
                expect(actions[0].type).toBe(SAVE_USER_SESSION);
                expect(actions[actions.length - 1].type).toBe("EPIC_COMPLETED");
            }, initialState, done, true);
        setTimeout(() => {
            store.dispatch(userSessionStopSaving());
        }, 100);
    });
    it('disable autoSave do not allow session saving', (done) => {
        const store = testEpic(
            autoSaveSessionEpicCreator(10, () => ({ type: 'END' })),
            (action) => action.type !== "END", [userSessionStartSaving(), userSessionStopSaving()],
            (actions) => {
                expect(actions[0].type).toBe("EPIC_COMPLETED");
            }, { ...initialState, usersession: { autoSave: false } }, done, true);
        setTimeout(() => {
            store.dispatch({ type: 'STOP' });
        }, 100);
    });
    it('start, stop and restart user session save', (done) => {
        let count = 0;
        const store = testEpic(
            autoSaveSessionEpicCreator(10, () => ({type: 'END' + (count++)})),
            (action) => action.type !== "END1",
            userSessionStartSaving(), (actions) => {
                expect(actions[0].type).toBe(SAVE_USER_SESSION);
                expect(actions[actions.length - 1].type).toBe("EPIC_COMPLETED");
            }, initialState, done, true);
        setTimeout(() => {
            store.dispatch(userSessionStopSaving());
            setTimeout(() => {
                store.dispatch(userSessionStartSaving());
                setTimeout(() => {
                    store.dispatch(userSessionStopSaving());
                }, 100);
            }, 50);
        }, 100);
    });
    it('user session name is taken from idSelector when loading', (done) => {
        testEpic(loadUserSessionEpicCreator(idSelector), 2, loadUserSession(), (actions) => {
            expect(actions[0].type).toBe(USER_SESSION_LOADING);
            expect(actions[1].type).toBe(USER_SESSION_LOADED);
            expect(actions[1].id).toBe("1");
            expect(actions[1].session).toExist();
        }, initialState, done);
    });

});
