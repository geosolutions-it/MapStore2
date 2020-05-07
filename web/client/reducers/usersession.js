/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
    USER_SESSION_SAVED, USER_SESSION_LOADING, USER_SESSION_LOADED, USER_SESSION_REMOVED, ENABLE_AUTO_SAVE,
    SAVE_MAP_CONFIG } from "../actions/usersession";

/**
 * Handles state for userSession
 * ```javascript
 * {
 *    autoSave: true|false // enable/disable auto save
 *    id: id of the session
 *    session: the session loaded/saved
 *    config: the config of the map
 *    loading: {} // an object containing loading state
 * }
 * ```
 * @name usersession
 * @memberof reducers
 */
export default (state = {}, action) => {
    switch (action.type) {
    case ENABLE_AUTO_SAVE: {
        return {
            ...state,
            autoSave: action.enabled
        };
    }
    case USER_SESSION_SAVED:
        return {
            ...state,
            id: action.id,
            session: action.session
        };
    case USER_SESSION_LOADED:
        return {
            ...state,
            id: action.id,
            session: action.session
        };
    case USER_SESSION_LOADING:
        return {
            ...state,
            loading: {
                name: action.name,
                value: action.value
            }
        };
    case USER_SESSION_REMOVED:
        return {
            ...state,
            id: undefined,
            session: undefined
        };
    case SAVE_MAP_CONFIG:
        return {
            ...state,
            config: action.config
        };
    default:
        return state;
    }
};
