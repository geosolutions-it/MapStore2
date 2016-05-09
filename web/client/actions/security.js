/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
// const axios = require('axios');
const GeoStoreAPI = require('../api/GeoStoreDAO');

const GEOSTORE_LOGIN_SUBMIT = 'GEOSTORE_LOGIN_SUBMIT';
const LOGIN_SUCCESS = 'GEOSTORE_LOGIN_SUCCESS';
const LOGIN_FAIL = 'GEOSTORE_LOGIN_FAIL';
const GEOSTORE_CHANGE_PASSWORD = 'GEOSTORE_CHANGE_PASSWORD';
const GEOSTORE_CHANGE_PASSWORD_SUCCESS = 'GEOSTORE_CHANGE_PASSWORD_SUCCESS';
const GEOSTORE_CHANGE_PASSWORD_FAIL = 'GEOSTORE_CHANGE_PASSWORD_FAIL';
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
    GeoStoreAPI.logout(); // this resets the credentials
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
        type: GEOSTORE_CHANGE_PASSWORD_SUCCESS,
        user: user,
        authHeader: 'Basic ' + btoa(user.name + ':' + newPassword)
    };
}

function changePasswordFail(e) {
    return {
        type: GEOSTORE_CHANGE_PASSWORD_FAIL,
        error: e
    };
}
function geoStoreChangePassword(user, newPassword) {
    return (dispatch, getState) => {
        let opts = GeoStoreAPI.getAuthOptionsFromState(getState());
        GeoStoreAPI.changePassword(user, newPassword, opts).then(() => {
            dispatch(changePasswordSuccess(user, newPassword));
        }).catch((e) => {
            dispatch(changePasswordFail(e));
        });
    };
}

module.exports = {
    GEOSTORE_LOGIN_SUBMIT,
    GEOSTORE_CHANGE_PASSWORD,
    GEOSTORE_CHANGE_PASSWORD_SUCCESS,
    GEOSTORE_CHANGE_PASSWORD_FAIL,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT,
    geoStoreLoginSubmit,
    loginSuccess,
    loginFail,
    logout,
    geoStoreChangePassword
};
