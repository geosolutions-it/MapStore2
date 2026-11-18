/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import * as security from '../security';
import { getCredentials } from '../../utils/SecurityUtils';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../libs/ajax';
import { setStore } from '../../utils/StateUtils';


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
            .toIncludeKey('username')
            .toIncludeKey('password')
            .toIncludeKey('authProvider');
        expect(retval.authHeader).toNotExist();
        expect(retval.type).toBe(security.LOGIN_SUCCESS);
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
    it('sessionEnded', () => {
        const action = security.sessionEnded(security.SESSION_END_REASONS.BROWSER_SESSION);
        expect(action).toEqual({ type: security.SESSION_ENDED, reason: 'browserSession' });
        expect(security.SESSION_END_REASONS.REFRESH_FAILED).toBe('refreshFailed');
    });
    it('setLoginLoading', () => {
        const action = security.setLoginLoading(true);
        expect(action.loading).toBe(true);
        expect(action.type).toBe(security.LOGIN_LOADING);
    });
});

describe('refreshAccessToken', () => {
    let mockAxios;
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
        setStore({ getState: () => ({ security: { token: 'old-token', refresh_token: 'refresh' } }) });
    });
    afterEach(() => {
        mockAxios.restore();
        setStore({});
    });
    it('a failed refresh logs out locally and ends the session on the server', (done) => {
        const actions = [];
        mockAxios.onPost(/session\/refreshToken/).reply(403);
        mockAxios.onDelete(/session\/logout/).reply((config) => {
            try {
                expect(config.headers.Authorization).toBe('Bearer old-token');
                expect(actions.map(({type}) => type)).toEqual([security.LOGOUT, security.SESSION_ENDED]);
                expect(actions[1].reason).toBe(security.SESSION_END_REASONS.REFRESH_FAILED);
                done();
            } catch (e) {
                done(e);
            }
            return [204];
        });
        security.refreshAccessToken()(action => actions.push(action));
    });
    it('a successful refresh does not log out', (done) => {
        mockAxios.onPost(/session\/refreshToken/).reply(200, { sessionToken: { access_token: 'new-token' } });
        security.refreshAccessToken()((action) => {
            try {
                expect(action.type).toBe(security.REFRESH_SUCCESS);
                setTimeout(() => {
                    expect(mockAxios.history.delete.length).toBe(0);
                    done();
                }, 20);
            } catch (e) {
                done(e);
            }
        });
    });
});
