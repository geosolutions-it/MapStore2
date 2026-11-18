/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import ConfigUtils from './ConfigUtils';
import { getCookieValue } from './CookieUtils';
import AuthenticationAPI from '../api/GeoStoreDAO';

/**
 * Utilities for the `loginPersistence` configuration property.
 * @module utils.LoginPersistenceUtils
 */

/**
 * Value of `loginPersistence` that ties the login to the browser session: a login persisted by
 * an earlier browser session is not restored.
 */
export const BROWSER_SESSION = 'browserSession';

/**
 * Name of the session cookie that marks the browser session the login belongs to.
 */
export const LOGIN_SESSION_COOKIE = 'ms2-login-session';

/**
 * @returns {boolean} true when `loginPersistence` is `browserSession`
 */
export const isLoginTiedToBrowserSession = () =>
    ConfigUtils.getConfigProp('loginPersistence') === BROWSER_SESSION;

// The folder of the application page, so that applications on the same host keep their own marker.
const cookiePath = () => (window.location.pathname || '/').replace(/[^/]*$/, '') || '/';

/**
 * Marks the current browser session as the one the login belongs to. The marker is a session
 * cookie (no expiry), which the browser drops when it is closed.
 */
export const markLoginBrowserSession = () => {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${LOGIN_SESSION_COOKIE}=1; Path=${cookiePath()}; SameSite=Lax${secure}`;
};

/**
 * Removes the marker set by {@link markLoginBrowserSession}.
 */
export const clearLoginBrowserSession = () => {
    document.cookie = `${LOGIN_SESSION_COOKIE}=; Path=${cookiePath()}; Max-Age=0; SameSite=Lax`;
};

/**
 * @returns {boolean} true when the current browser session is marked as the one of the login
 */
export const isLoginBrowserSessionMarked = () => getCookieValue(LOGIN_SESSION_COOKIE) === '1';

/**
 * Tells whether a persisted security state can be restored. With `loginPersistence` set to
 * `browserSession`, a login persisted by an earlier browser session cannot.
 * @param {object} security the persisted security state
 * @returns {boolean}
 */
export const canRestorePersistedLogin = (security) =>
    !isLoginTiedToBrowserSession() || !security?.user || isLoginBrowserSessionMarked();

/**
 * Ends a session on the server with the given access token, even when it is no longer the one in
 * the application state. GeoStore removes the session and, where it is configured for it, ends
 * the session at the identity provider too. Errors are ignored: the session may already be gone.
 * @param {string} accessToken the access token of the session
 * @returns {Promise}
 */
export const endServerSession = (accessToken) => {
    if (!accessToken) {
        return Promise.resolve();
    }
    return AuthenticationAPI.logout({ headers: { Authorization: `Bearer ${accessToken}` } })
        .catch(() => {});
};

let persistedLoginDiscarded = false;

/**
 * Ends on the server the session of a persisted login that is not restored, and records that
 * the login was dropped, so that it can be notified once the application has started (see
 * {@link consumeDiscardedPersistedLogin}).
 * @param {object} security the persisted security state
 * @returns {Promise}
 */
export const discardPersistedLogin = (security) => {
    persistedLoginDiscarded = true;
    return endServerSession(security?.token);
};

/**
 * @returns {boolean} true, once, after a persisted login was dropped by {@link discardPersistedLogin}
 */
export const consumeDiscardedPersistedLogin = () => {
    const discarded = persistedLoginDiscarded;
    persistedLoginDiscarded = false;
    return discarded;
};
