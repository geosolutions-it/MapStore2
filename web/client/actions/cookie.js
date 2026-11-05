/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

export const SET_COOKIE_VISIBILITY = 'SET_COOKIE_VISIBILITY';

export function setCookieVisibility(status) {
    return {
        type: SET_COOKIE_VISIBILITY,
        status
    };
}

export const SET_PRIVACY_CHOICE = 'SET_PRIVACY_CHOICE';
export const setPrivacyChoice = choice => ({type: SET_PRIVACY_CHOICE, choice});

export const ADD_PRIVACY_ACCESS = 'COOKIE:ADD_PRIVACY_ACCESS';
export const REMOVE_PRIVACY_ACCESS = 'COOKIE:REMOVE_PRIVACY_ACCESS';
/**
 * Records that a container of the page shows an access to the privacy settings.
 * @param {string} id the container, one of the `PRIVACY_ACCESS` values
 */
export const addPrivacyAccess = id => ({type: ADD_PRIVACY_ACCESS, id});
/**
 * Records that a container of the page no longer shows its access to the privacy settings.
 * @param {string} id the container, one of the `PRIVACY_ACCESS` values
 */
export const removePrivacyAccess = id => ({type: REMOVE_PRIVACY_ACCESS, id});
