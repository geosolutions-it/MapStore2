/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT,
    CHANGE_PASSWORD_SUCCESS,
    CHANGE_PASSWORD_FAIL,
    RESET_ERROR,
    REFRESH_SUCCESS,
    SESSION_VALID,
    CHANGE_PASSWORD
} from '../actions/security';

import { SET_CONTROL_PROPERTY } from '../actions/controls';
import { USERMANAGER_UPDATE_USER } from '../actions/users';
import {getUserAttributes} from '../utils/SecurityUtils';
import assign from 'object-assign';
import { cloneDeep, head } from 'lodash';

function security(state = {user: null, errorCause: null}, action) {
    switch (action.type) {
    case USERMANAGER_UPDATE_USER:
        if (state.user && action.user && state.user.id === action.user.id) {
            return assign({}, state, {
                user: cloneDeep(action.user)
            });
        }
        return state;
    case SET_CONTROL_PROPERTY:
        if (action.control === 'ResetPassword' && action.property === 'enabled') {
            return assign({}, state, {
                passwordChanged: false,
                passwordError: null
            });
        }
        return state;
    case LOGIN_SUCCESS:
    {
        const userAttributes = getUserAttributes(action.userDetails.User);
        const userUuid = head(userAttributes.filter(attribute => attribute.name.toLowerCase() === 'uuid'));
        const timestamp = new Date() / 1000 | 0;
        return assign({}, state, {
            user: action.userDetails.User,
            token: (action.userDetails && action.userDetails.access_token) || (userUuid && userUuid.value),
            refresh_token: (action.userDetails && action.userDetails.refresh_token),
            expires: (action.userDetails && action.userDetails.expires) ? timestamp + action.userDetails.expires : timestamp + 48 * 60 * 60,
            authHeader: action.authHeader,
            loginError: null
        });
    }
    case REFRESH_SUCCESS:
    {
        const timestamp = new Date() / 1000 | 0;
        return assign({}, state, {
            token: (action.userDetails && action.userDetails.access_token),
            refresh_token: (action.userDetails && action.userDetails.refresh_token),
            expires: (action.userDetails && action.userDetails.expires) ? timestamp + action.userDetails.expires : timestamp + 48 * 60 * 60
        });
    }
    case LOGIN_FAIL:
        return assign({}, state, {
            loginError: action.error
        });
    case RESET_ERROR:
        return assign({}, state, {
            loginError: null
        });
    case LOGOUT:
        return assign({}, state, {
            user: null,
            token: null,
            refresh_token: null,
            expires: null,
            authHeader: null,
            loginError: null
        });
    case CHANGE_PASSWORD:
        return  assign({}, state, {
            passwordError: null,
            changePasswordLoading: true
        });
    case CHANGE_PASSWORD_SUCCESS:
        return assign({}, state, {
            user: assign({}, state.user, assign({}, action.user, {date: new Date().getTime()})),
            authHeader: action.authHeader,
            passwordChanged: true,
            passwordError: null,
            changePasswordLoading: false
        });
    case CHANGE_PASSWORD_FAIL:
        return assign({}, state, {
            passwordError: action.error,
            passwordChanged: false,
            changePasswordLoading: false

        });
    case SESSION_VALID:
    {
        return assign({}, state, {
            user: action.userDetails.User,
            loginError: null
        });
    }
    default:
        return state;
    }
}

export default security;
