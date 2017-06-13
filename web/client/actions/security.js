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

const {loadMaps} = require('./maps');
const ConfigUtils = require('../utils/ConfigUtils');

const LOGIN_SUBMIT = 'LOGIN_SUBMIT';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_FAIL = 'LOGIN_FAIL';
const RESET_ERROR = 'RESET_ERROR';
const CHANGE_PASSWORD = 'CHANGE_PASSWORD';
const CHANGE_PASSWORD_SUCCESS = 'CHANGE_PASSWORD_SUCCESS';
const CHANGE_PASSWORD_FAIL = 'CHANGE_PASSWORD_FAIL';
const LOGOUT = 'LOGOUT';

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

function logoutWithReload() {
    return (dispatch) => {
        dispatch(logout(null));
        dispatch(loadMaps(false, ConfigUtils.getDefaults().initialMapFilter || "*"));
    };
}

function login(username, password) {
    return (dispatch) => {
        AuthenticationAPI.login(username, password).then((response) => {
            dispatch(loginSuccess(response, username, password, AuthenticationAPI.authProviderName));
            dispatch(loadMaps(false, ConfigUtils.getDefaults().initialMapFilter || "*"));
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

module.exports = {
    LOGIN_SUBMIT,
    CHANGE_PASSWORD,
    CHANGE_PASSWORD_SUCCESS,
    CHANGE_PASSWORD_FAIL,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    RESET_ERROR,
    LOGOUT,
    login,
    loginSuccess,
    loginFail,
    logout,
    changePassword,
    logoutWithReload,
    resetError
};
