/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {SAVE_USER_SESSION, USER_SESSION_SAVED, LOAD_USER_SESSION, USER_SESSION_LOADED, USER_SESSION_LOADING,
    saveUserSession, userSessionSaved, loadUserSession, userSessionLoaded, loading} from "../usersession";

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
        const action = loadUserSession();
        expect(action.type).toBe(LOAD_USER_SESSION);
    });
    it('user session loaded', () => {
        const action = userSessionLoaded(1, {
            attribute: "myvalue"
        });
        expect(action.type).toBe(USER_SESSION_LOADED);
        expect(action.id).toBe(1);
        expect(action.session.attribute).toBe("myvalue");
    });
});
