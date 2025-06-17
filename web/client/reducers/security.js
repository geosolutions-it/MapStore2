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
    CHANGE_PASSWORD,
    SET_SHOW_MODAL_STATUS,
    SET_PROTECTED_SERVICES
} from '../actions/security';

import { RESET_CONTROLS, SET_CONTROL_PROPERTY } from '../actions/controls';
import { USERMANAGER_UPDATE_USER } from '../actions/users';
import {getUserAttributes} from '../utils/SecurityUtils';
import { cloneDeep, head } from 'lodash';
const initialState = {user: null, errorCause: null};
function security(state = initialState, action) {
    switch (action.type) {
    case USERMANAGER_UPDATE_USER:
        if (state.user && action.user && state.user.id === action.user.id) {
            return Object.assign({}, state, {
                user: cloneDeep(action.user)
            });
        }
        return state;
    case SET_CONTROL_PROPERTY:
        if (action.control === 'ResetPassword' && action.property === 'enabled') {
            return Object.assign({}, state, {
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
        return Object.assign({}, state, {
            user: action.userDetails.User,
            token: (action.userDetails && action.userDetails.access_token) || (userUuid && userUuid.value),
            refresh_token: (action.userDetails && action.userDetails.refresh_token),
            expires: (action.userDetails && action.userDetails.expires) ? timestamp + action.userDetails.expires : timestamp + 48 * 60 * 60,
            authHeader: action.authHeader,
            authProvider: action.userDetails?.authProvider,
            loginError: null
        });
    }
    case REFRESH_SUCCESS:
    {
        const timestamp = new Date() / 1000 | 0;
        return Object.assign({}, state, {
            token: (action.userDetails && action.userDetails.access_token),
            refresh_token: (action.userDetails && action.userDetails.refresh_token),
            expires: (action.userDetails && action.userDetails.expires) ? timestamp + action.userDetails.expires : timestamp + 48 * 60 * 60
        });
    }
    case LOGIN_FAIL:
        return Object.assign({}, state, {
            loginError: action.error
        });
    case RESET_ERROR:
        return Object.assign({}, state, {
            loginError: null
        });
    case LOGOUT:
        return Object.assign({}, state, {
            user: null,
            token: null,
            refresh_token: null,
            expires: null,
            authHeader: null,
            authProvider: null,
            loginError: null
        });
    case CHANGE_PASSWORD:
        return  Object.assign({}, state, {
            passwordError: null,
            changePasswordLoading: true
        });
    case CHANGE_PASSWORD_SUCCESS:
        return Object.assign({}, state, {
            user: Object.assign({}, state.user, Object.assign({}, action.user, {date: new Date().getTime()})),
            authHeader: action.authHeader,
            passwordChanged: true,
            passwordError: null,
            changePasswordLoading: false
        });
    case CHANGE_PASSWORD_FAIL:
        return Object.assign({}, state, {
            passwordError: action.error,
            passwordChanged: false,
            changePasswordLoading: false

        });
    case SESSION_VALID:
    {
        return Object.assign({}, state, {
            user: action.userDetails.User,
            loginError: null
        });
    }
    case SET_SHOW_MODAL_STATUS:
    {
        return {
            ...state,
            showModalSecurityPopup: action.status
        };
    }
    case SET_PROTECTED_SERVICES:
    {
        return {
            ...state,
            protectedServices: action.protectedServices

        };
    }
    case RESET_CONTROLS:
    {
        return {
            ...state,
            showModalSecurityPopup: false,
            protectedServices: []

        };
    }
    default:
        return state;
    }
}

export default security;
