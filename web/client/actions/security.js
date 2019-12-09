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
const AuthenticationAPI = require('../api/GeoStoreDAO');
const SecurityUtils = require('../utils/SecurityUtils');

const {loadMaps} = require('./maps');
const ConfigUtils = require('../utils/ConfigUtils');

const CHECK_LOGGED_USER = 'CHECK_LOGGED_USER';
const LOGIN_SUBMIT = 'LOGIN_SUBMIT';
const LOGIN_PROMPT_CLOSED = "LOGIN:LOGIN_PROMPT_CLOSED";
const LOGIN_REQUIRED = "LOGIN:LOGIN_REQUIRED";
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_FAIL = 'LOGIN_FAIL';
const RESET_ERROR = 'RESET_ERROR';
const CHANGE_PASSWORD = 'CHANGE_PASSWORD';
const CHANGE_PASSWORD_SUCCESS = 'CHANGE_PASSWORD_SUCCESS';
const CHANGE_PASSWORD_FAIL = 'CHANGE_PASSWORD_FAIL';
const LOGOUT = 'LOGOUT';
const REFRESH_SUCCESS = 'REFRESH_SUCCESS';
const SESSION_VALID = 'SESSION_VALID';

function loginSuccess(userDetails, username, password, authProvider) {
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

function loginFail(e) {
    return {
        type: LOGIN_FAIL,
        error: e
    };
}

function resetError() {
    return {
        type: RESET_ERROR
    };
}

function logout(redirectUrl) {
    return {
        type: LOGOUT,
        redirectUrl: redirectUrl
    };
}

/**
 * Asks for  login
 */
function loginRequired() {
    return {
        type: LOGIN_REQUIRED
    };
}

/**
 * event of login close after a LOGIN_REQUIRED event
 * @param {string} owner
 */
function loginPromptClosed() {
    return {
        type: LOGIN_PROMPT_CLOSED
    };
}

function logoutWithReload() {
    return (dispatch, getState) => {
        dispatch(logout(null));
        dispatch(loadMaps(false, getState().maps && getState().maps.searchText || ConfigUtils.getDefaults().initialMapFilter || "*"));
    };
}

function login(username, password) {
    return (dispatch, getState) => {
        return AuthenticationAPI.login(username, password).then((response) => {
            dispatch(loginSuccess(response, username, password, AuthenticationAPI.authProviderName));
            dispatch(loadMaps(false, getState().maps && getState().maps.searchText || ConfigUtils.getDefaults().initialMapFilter || "*"));
        }).catch((e) => {
            dispatch(loginFail(e));
        });
    };
}

function changePasswordSuccess(user, newPassword) {
    return {
        type: CHANGE_PASSWORD_SUCCESS,
        user: user,
        authHeader: 'Basic ' + btoa(user.name + ':' + newPassword)
    };
}

function changePasswordFail(e) {
    return {
        type: CHANGE_PASSWORD_FAIL,
        error: e
    };
}

function changePassword(user, newPassword) {
    return (dispatch) => {
        AuthenticationAPI.changePassword(user, newPassword).then(() => {
            dispatch(changePasswordSuccess(user, newPassword));
        }).catch((e) => {
            dispatch(changePasswordFail(e));
        });
    };
}

function refreshSuccess(userDetails, authProvider) {
    return {
        type: REFRESH_SUCCESS,
        userDetails: userDetails,
        authProvider: authProvider
    };
}

function refreshAccessToken() {
    return (dispatch) => {
        const accessToken = SecurityUtils.getToken();
        const refreshToken = SecurityUtils.getRefreshToken();
        AuthenticationAPI.refreshToken(accessToken, refreshToken).then((response) => {
            dispatch(refreshSuccess(response, AuthenticationAPI.authProviderName));
        }).catch(() => {
            dispatch(logout(null));
        });
    };
}

function sessionValid(userDetails, authProvider) {
    return {
        type: SESSION_VALID,
        userDetails: userDetails,
        authProvider: authProvider
    };
}

function verifySession() {
    return (dispatch) => {
        AuthenticationAPI.verifySession().then((response) => {
            dispatch(sessionValid(response, AuthenticationAPI.authProviderName));
        }).catch(() => {
            dispatch(logout(null));
        });
    };
}

const checkLoggedUser = () => ({type: CHECK_LOGGED_USER});

module.exports = {
    CHECK_LOGGED_USER,
    LOGIN_SUBMIT,
    LOGIN_PROMPT_CLOSED,
    LOGIN_REQUIRED,
    CHANGE_PASSWORD,
    CHANGE_PASSWORD_SUCCESS,
    CHANGE_PASSWORD_FAIL,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    RESET_ERROR,
    LOGOUT,
    REFRESH_SUCCESS,
    SESSION_VALID,
    checkLoggedUser,
    login,
    loginPromptClosed,
    loginRequired,
    loginSuccess,
    loginFail,
    logout,
    changePassword,
    logoutWithReload,
    resetError,
    refreshAccessToken,
    verifySession,
    sessionValid
};
