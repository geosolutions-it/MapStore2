/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import MockAdapter from 'axios-mock-adapter';

import axios from '../../libs/ajax';
import ConfigUtils from '../ConfigUtils';
import {
    BROWSER_SESSION,
    isLoginTiedToBrowserSession,
    markLoginBrowserSession,
    clearLoginBrowserSession,
    isLoginBrowserSessionMarked,
    canRestorePersistedLogin,
    endServerSession,
    discardPersistedLogin,
    consumeDiscardedPersistedLogin
} from '../LoginPersistenceUtils';

describe('LoginPersistenceUtils', () => {
    let mockAxios;
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
        clearLoginBrowserSession();
    });
    afterEach(() => {
        mockAxios.restore();
        clearLoginBrowserSession();
        ConfigUtils.removeConfigProp('loginPersistence');
    });

    it('isLoginTiedToBrowserSession follows loginPersistence', () => {
        expect(isLoginTiedToBrowserSession()).toBe(false);
        ConfigUtils.setConfigProp('loginPersistence', 'local');
        expect(isLoginTiedToBrowserSession()).toBe(false);
        ConfigUtils.setConfigProp('loginPersistence', BROWSER_SESSION);
        expect(isLoginTiedToBrowserSession()).toBe(true);
    });

    it('marks and clears the browser session with a session cookie', () => {
        expect(isLoginBrowserSessionMarked()).toBe(false);
        markLoginBrowserSession();
        expect(isLoginBrowserSessionMarked()).toBe(true);
        clearLoginBrowserSession();
        expect(isLoginBrowserSessionMarked()).toBe(false);
    });

    it('canRestorePersistedLogin restores everything by default', () => {
        expect(canRestorePersistedLogin({ user: { name: 'user' }, token: 'token' })).toBe(true);
    });

    it('canRestorePersistedLogin with browserSession needs the marker', () => {
        ConfigUtils.setConfigProp('loginPersistence', BROWSER_SESSION);
        const security = { user: { name: 'user' }, token: 'token' };
        expect(canRestorePersistedLogin(security)).toBe(false);
        expect(canRestorePersistedLogin({})).toBe(true);
        expect(canRestorePersistedLogin(undefined)).toBe(true);
        markLoginBrowserSession();
        expect(canRestorePersistedLogin(security)).toBe(true);
    });

    it('endServerSession sends the logout with the given token', (done) => {
        mockAxios.onDelete(/session\/logout/).reply(204);
        endServerSession('expired-token').then(() => {
            expect(mockAxios.history.delete.length).toBe(1);
            expect(mockAxios.history.delete[0].headers.Authorization).toBe('Bearer expired-token');
            done();
        }).catch(done);
    });

    it('endServerSession ignores errors and does nothing without a token', (done) => {
        mockAxios.onDelete(/session\/logout/).reply(500);
        endServerSession('expired-token')
            .then(() => endServerSession(undefined))
            .then(() => {
                expect(mockAxios.history.delete.length).toBe(1);
                done();
            })
            .catch(done);
    });

    it('discardPersistedLogin ends the session and is reported once', (done) => {
        consumeDiscardedPersistedLogin();
        mockAxios.onDelete(/session\/logout/).reply(204);
        expect(consumeDiscardedPersistedLogin()).toBe(false);
        discardPersistedLogin({ user: { name: 'user' }, token: 'old-token' }).then(() => {
            expect(mockAxios.history.delete.length).toBe(1);
            expect(mockAxios.history.delete[0].headers.Authorization).toBe('Bearer old-token');
            expect(consumeDiscardedPersistedLogin()).toBe(true);
            expect(consumeDiscardedPersistedLogin()).toBe(false);
            done();
        }).catch(done);
    });
});
