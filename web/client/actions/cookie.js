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
