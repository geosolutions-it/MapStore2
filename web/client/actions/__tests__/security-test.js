/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import * as security from '../security';
import { base64ToUtf8 } from '../../utils/EncodeUtils';
import { getCredentials } from '../../utils/SecurityUtils';


describe('Test correctness of the close actions', () => {
    it('resetError', () => {
        const retval = security.resetError();
        expect(retval).toExist().toIncludeKey('type');
        expect(retval.type).toBe(security.RESET_ERROR);
    });
    it('loginSuccess', () => {
        const retval = security.loginSuccess();
        expect(retval).toExist().toIncludeKey('type')
            .toIncludeKey('userDetails')
            .toIncludeKey('authHeader')
            .toIncludeKey('username')
            .toIncludeKey('password')
            .toIncludeKey('authProvider');
        expect(retval.type).toBe(security.LOGIN_SUCCESS);
    });
    it('loginSuccess encoding of UTF-8', () => {
        const TESTS = [
            ["✓", "✓"],
            ["àèìòù€", "àèìòù€"]
        ];
        TESTS.forEach(([username, password], index) => {
            const action = security.loginSuccess({}, username, password);
            expect(base64ToUtf8(action.authHeader.split(" ")[1])).toEqual(`${TESTS[index][0]}:${TESTS[index][1]}`);
        });
    });
    it('loginFail', () => {
        const retval = security.loginFail();
        expect(retval).toExist().toIncludeKey('type')
            .toIncludeKey('error');
        expect(retval.type).toBe(security.LOGIN_FAIL);
    });
    it('logout', () => {
        const retval = security.logout();
        expect(retval).toExist().toIncludeKey('type')
            .toIncludeKey('redirectUrl');
        expect(retval.type).toBe(security.LOGOUT);
    });
    /* These are not exposed by the API
    it('changePasswordSuccess', () => {
        const retval = security.changePasswordSuccess();
        expect(retval).toExist().toIncludeKey('type')
        .toIncludeKey('user')
        .toIncludeKey('authHeader');
        expect(retval.type).toBe(security.CHANGE_PASSWORD_SUCCESS);
    });
    it('changePasswordFail', () => {
        const retval = security.changePasswordFail();
        expect(retval).toExist().toIncludeKey('type')
        .toIncludeKey('error');
        expect(retval.type).toBe(security.CHANGE_PASSWORD_FAIL);
    });
    */
    it('sessionValid', () => {
        const retval = security.sessionValid("aaa", "bbb");
        expect(retval).toExist().toIncludeKey('type')
            .toIncludeKey('userDetails')
            .toIncludeKey('authProvider');
        expect(retval.type).toBe(security.SESSION_VALID);
        expect(retval.userDetails).toBe("aaa");
        expect(retval.authProvider).toBe("bbb");
    });
    it('loginRequired, loginPromptClosed', () => {
        expect(security.loginRequired().type).toBe(security.LOGIN_REQUIRED);
        expect(security.loginPromptClosed().type).toBe(security.LOGIN_PROMPT_CLOSED);
    });
    it('setShowModalStatus', () => {
        expect(security.setShowModalStatus(true)).toEqual({
            type: security.SET_SHOW_MODAL_STATUS,
            status: true
        });
    });
    it('setProtectedServices ', () => {
        expect(security.setProtectedServices({})).toEqual({
            type: security.SET_PROTECTED_SERVICES,
            protectedServices: {}
        });
    });
    it('clearSecurity ', () => {
        expect(security.clearSecurity("id")).toEqual({
            type: security.CLEAR_SECURITY,
            protectedId: "id"
        });
    });
    it('setCredentialsAction ', () => {
        expect(security.setCredentialsAction({
            protectedId: "123"
        }, {name: "creds"})).toEqual({
            type: security.SET_CREDENTIALS,
            protectedService: {protectedId: "123"}
        });
        expect(getCredentials("123")).toEqual({name: "creds"});
    });
    it('checkLoggedUser', () => {
        expect(security.checkLoggedUser().type).toBe(security.CHECK_LOGGED_USER);
    });
    it('refreshSecurityLayers', () => {
        const action = security.refreshSecurityLayers();
        expect(action.type).toBe(security.REFRESH_SECURITY_LAYERS);
    });
});
