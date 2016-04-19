/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT } = require('../actions/security');

const assign = require('object-assign');

function security(state = {userDetails: null, errorCause: null}, action) {
    switch (action.type) {

        case LOGIN_SUCCESS:
            return assign({}, state, {
                user: action.userDetails.User,
                token: (action.userDetails.User.attribute || []).reduce((prev, curr) => {
                    if (curr.name === "UUID") {
                        return curr.value;
                    }
                    return '';
                }, ''),
                authHeader: action.authHeader,
                loginError: null
            });
        case LOGIN_FAIL:
            return assign({}, state, {
                loginError: action.error
            });
        case LOGOUT:
            return assign({}, state, {
                user: null,
                token: null,
                authHeader: null,
                loginError: null
            });
        default:
            return state;
    }
}

module.exports = security;
