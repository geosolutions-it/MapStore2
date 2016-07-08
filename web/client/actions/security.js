/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
// const axios = require('axios');
const GeoStoreAPI = require('../api/GeoStoreDAO');

const LOGIN_SUBMIT = 'LOGIN_SUBMIT';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_FAIL = 'LOGIN_FAIL';
const CHANGE_PASSWORD = 'CHANGE_PASSWORD';
const CHANGE_PASSWORD_SUCCESS = 'CHANGE_PASSWORD_SUCCESS';
const CHANGE_PASSWORD_FAIL = 'CHANGE_PASSWORD_FAIL';
const LOGOUT = 'LOGOUT';


function loginSuccess(userDetails, username, password, authProvider) {
    return {
        type: LOGIN_SUCCESS,
        userDetails: userDetails,
        // set here for compatibility reasons
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

function logout(redirectUrl) {
    return {
        type: LOGOUT,
        redirectUrl: redirectUrl
    };
}

function geoStoreLoginSubmit(username, password) {
    return (dispatch) => {
        GeoStoreAPI.basicLogin(username, password).then((response) => {
            dispatch(loginSuccess(response, username, password, 'geostore'));
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
function geoStoreChangePassword(user, newPassword) {
    return (dispatch) => {
        GeoStoreAPI.changePassword(user, newPassword).then(() => {
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
    LOGOUT,
    geoStoreLoginSubmit,
    loginSuccess,
    loginFail,
    logout,
    geoStoreChangePassword
};
