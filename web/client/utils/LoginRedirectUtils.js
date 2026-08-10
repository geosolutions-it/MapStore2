/**
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const LOGIN_REDIRECT_STORAGE_KEY = 'mapstore.loginRedirectHash';

/**
 * Saves the current hash route so it can be restored after an external login.
 *
 * @param {string} hash the hash route to save
 * @param {Storage} storage optional storage implementation
 * @returns {boolean} true when the route has been saved
 */
export const saveLoginRedirect = (hash = window.location.hash, storage) => {
    if (!hash) {
        return false;
    }
    try {
        (storage ?? sessionStorage).setItem(LOGIN_REDIRECT_STORAGE_KEY, hash);
        return true;
    } catch (e) {
        return false;
    }
};

/**
 * Returns and removes the hash route saved before an external login.
 *
 * @param {Storage} storage optional storage implementation
 * @returns {string|null} the saved hash route, if available
 */
export const consumeLoginRedirect = (storage) => {
    try {
        const targetStorage = storage ?? sessionStorage;
        const hash = targetStorage.getItem(LOGIN_REDIRECT_STORAGE_KEY);
        if (hash !== null) {
            targetStorage.removeItem(LOGIN_REDIRECT_STORAGE_KEY);
        }
        return hash;
    } catch (e) {
        return null;
    }
};
