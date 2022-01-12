/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Here you can change the API to use for AuthenticationAPI
 */
import AuthenticationAPI from '../api/GeoStoreDAO';

import {getToken, getRefreshToken} from '../utils/SecurityUtils';
import { loadMaps } from './maps';
import ConfigUtils from '../utils/ConfigUtils';

export const CHECK_LOGGED_USER = 'CHECK_LOGGED_USER';
export const LOGIN_SUBMIT = 'LOGIN_SUBMIT';
export const LOGIN_PROMPT_CLOSED = "LOGIN:LOGIN_PROMPT_CLOSED";
export const LOGIN_REQUIRED = "LOGIN:LOGIN_REQUIRED";
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAIL = 'LOGIN_FAIL';
export const RESET_ERROR = 'RESET_ERROR';
export const CHANGE_PASSWORD = 'CHANGE_PASSWORD';
export const CHANGE_PASSWORD_SUCCESS = 'CHANGE_PASSWORD_SUCCESS';
export const CHANGE_PASSWORD_FAIL = 'CHANGE_PASSWORD_FAIL';
export const LOGOUT = 'LOGOUT';
export const REFRESH_SUCCESS = 'REFRESH_SUCCESS';
export const SESSION_VALID = 'SESSION_VALID';

export function loginSuccess(userDetails, username, password, authProvider) {
    return {
        type: LOGIN_SUCCESS,
        userDetails: userDetails,
        // set here for compatibility reasons
        // TODO: verify if the compatibility reasons still hold and remove otherwise
        authHeader: 'Basic ' + btoa(username + ':' + password),
        username: username,
        password: password,
        authProvider: authProvider
    };
}

export function loginFail(e) {
    return {
        type: LOGIN_FAIL,
        error: e
    };
}

export function resetError() {
    return {
        type: RESET_ERROR
    };
}

export function logout(redirectUrl) {
    return {
        type: LOGOUT,
        redirectUrl: redirectUrl
    };
}

/**
 * Asks for  login
 */
export function loginRequired() {
    return {
        type: LOGIN_REQUIRED
    };
}

/**
 * event of login close after a LOGIN_REQUIRED event
 * @param {string} owner
 */
export function loginPromptClosed() {
    return {
        type: LOGIN_PROMPT_CLOSED
    };
}

export function logoutWithReload() {
    return (dispatch, getState) => {
        dispatch(logout(null));
        dispatch(loadMaps(false, getState().maps && getState().maps.searchText || ConfigUtils.getDefaults().initialMapFilter || "*"));
    };
}

export function login(username, password) {
    return (dispatch, getState) => {
        return AuthenticationAPI.login(username, password).then((response) => {
            dispatch(loginSuccess(response, username, password, AuthenticationAPI.authProviderName));
            dispatch(loadMaps(false, getState().maps && getState().maps.searchText || ConfigUtils.getDefaults().initialMapFilter || "*"));
        }).catch((e) => {
            dispatch(loginFail(e));
        });
    };
}

export function changePasswordSuccess(user, newPassword) {
    return {
        type: CHANGE_PASSWORD_SUCCESS,
        user: user,
        authHeader: 'Basic ' + btoa(user.name + ':' + newPassword)
    };
}

export function changePasswordFail(e) {
    return {
        type: CHANGE_PASSWORD_FAIL,
        error: e
    };
}

export function changePasswordStart() {
    return {
        type: CHANGE_PASSWORD
    };
}

export function changePassword(user, newPassword) {
    return (dispatch) => {
        dispatch(changePasswordStart());
        AuthenticationAPI.changePassword(user, newPassword).then(() => {
            dispatch(changePasswordSuccess(user, newPassword));
        }).catch((e) => {
            dispatch(changePasswordFail(e));
        });
    };
}

export function refreshSuccess(userDetails, authProvider) {
    return {
        type: REFRESH_SUCCESS,
        userDetails: userDetails,
        authProvider: authProvider
    };
}

export function refreshAccessToken() {
    return (dispatch) => {
        const accessToken = getToken();
        const refreshToken = getRefreshToken();
        AuthenticationAPI.refreshToken(accessToken, refreshToken).then((response) => {
            dispatch(refreshSuccess(response, AuthenticationAPI.authProviderName));
        }).catch(() => {
            dispatch(logout(null));
        });
    };
}

export function sessionValid(userDetails, authProvider) {
    return {
        type: SESSION_VALID,
        userDetails: userDetails,
        authProvider: authProvider
    };
}

export function verifySession() {
    return (dispatch) => {
        AuthenticationAPI.verifySession().then((response) => {
            dispatch(sessionValid(response, AuthenticationAPI.authProviderName));
        }).catch(() => {
            dispatch(logout(null));
        });
    };
}

export const checkLoggedUser = () => ({type: CHECK_LOGGED_USER});
