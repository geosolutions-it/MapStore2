/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
    USER_SESSION_SAVED, USER_SESSION_LOADING, USER_SESSION_LOADED, USER_SESSION_REMOVED, ENABLE_AUTO_SAVE,
    SAVE_MAP_CONFIG, SET_CHECKED_SESSION_TO_CLEAR } from "../actions/usersession";

// move to utils
function getCheckedIds(nodes) {
    let ids = [];

    // Iterate over each node in the list
    nodes.forEach(node => {
        // If the node is checked, add its ID to the result array
        if (node.checked) {
            ids.push(node.id);
        }

        // If the node has children, recursively check them
        if (node.children) {
            ids = ids.concat(getCheckedIds(node.children));
        }
    });

    return ids;
}

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
export default (state = {
    autoSave: false,
    checkedSessionToClear: []
}, action) => {
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
            session: action.newSession
        };
    case SAVE_MAP_CONFIG:
        return {
            ...state,
            config: action.config
        };
    case SET_CHECKED_SESSION_TO_CLEAR:
        return {
            ...state,
            checkedSessionToClear: getCheckedIds(action.checks)
        };
    default:
        return state;
    }
};
