/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const USERMANAGER_GETUSERS = 'USERMANAGER_GETUSERS';
export const USERMANAGER_EDIT_USER = 'USERMANAGER_EDIT_USER';
export const USERMANAGER_EDIT_USER_DATA = 'USERMANAGER_EDIT_USER_DATA';
export const USERMANAGER_UPDATE_USER = 'USERMANAGER_UPDATE_USER';
export const USERMANAGER_DELETE_USER = 'USERMANAGER_DELETE_USER';
export const USERMANAGER_GETGROUPS = 'USERMANAGER_GETGROUPS';
export const USERS_SEARCH_TEXT_CHANGED = 'USERS_SEARCH_TEXT_CHANGED';

import API from '../api/GeoStoreDAO';
import { get, assign } from 'lodash';
import SecurityUtils from '../utils/SecurityUtils';

export function getUsersloading(text, start, limit) {
    return {
        type: USERMANAGER_GETUSERS,
        status: "loading",
        searchText: text,
        start,
        limit
    };
}
export function getUsersSuccess(text, start, limit, users, totalCount) {
    return {
        type: USERMANAGER_GETUSERS,
        status: "success",
        searchText: text,
        start,
        limit,
        users,
        totalCount

    };
}
export function getUsersError(text, start, limit, error) {
    return {
        type: USERMANAGER_GETUSERS,
        status: "error",
        searchText: text,
        start,
        limit,
        error
    };
}
export function getUsers(searchText, options) {
    let params = options && options.params;
    let start;
    let limit;
    if (params) {
        start = params.start;
        limit = params.limit;
    }
    return (dispatch, getState) => {
        let text = searchText;
        let state = getState && getState();
        if (state) {
            let oldText = get(state, "users.searchText");
            text = searchText || oldText || "*";
            start = start !== null && start !== undefined ? start : get(state, "users.start") || 0;
            limit = limit || get(state, "users.limit") || 12;
        }
        dispatch(getUsersloading(text, start, limit));

        return API.getUsers(text, {...options, params: {start, limit}}).then((response) => {
            let users;
            // this because _.get returns an array with an undefined element isntead of null
            if (!response || !response.ExtUserList || !response.ExtUserList.User) {
                users = [];
            } else {
                users = get(response, "ExtUserList.User");
            }

            let totalCount = get(response, "ExtUserList.UserCount");
            users = Array.isArray(users) ? users : [users];
            users = users.map((user) => {
                let groups = get(user, "groups.group");
                groups = Array.isArray(groups) ? groups : [groups];
                return assign({}, user, {
                    groups
                });
            });
            dispatch(getUsersSuccess(text, start, limit, users, totalCount));
        }).catch((error) => {
            dispatch(getUsersError(text, start, limit, error));
        });
    };
}

export function getGroupsSuccess(groups) {
    return {
        type: USERMANAGER_GETGROUPS,
        status: "success",
        groups
    };
}

export function getGroupsError(error) {
    return {
        type: USERMANAGER_GETGROUPS,
        status: "error",
        error
    };
}
export function getGroups(user) {
    return (dispatch) => {
        dispatch({
            type: USERMANAGER_GETGROUPS,
            status: "loading"
        });
        return API.getAvailableGroups(user).then((groups) => {
            dispatch(getGroupsSuccess(groups));
        }).catch((error) => {
            dispatch(getGroupsError(error));
        });
    };

}

export function editUserLoading(user) {
    return {
        type: USERMANAGER_EDIT_USER,
        status: "loading",
        user
    };
}

export function editUserSuccess(userLoaded) {
    return {
        type: USERMANAGER_EDIT_USER,
        status: "success",
        user: userLoaded
    };
}

export function editUserError(user, error) {
    return {
        type: USERMANAGER_EDIT_USER,
        status: "error",
        user,
        error
    };
}

export function editNewUser(user) {
    return {
        type: USERMANAGER_EDIT_USER,
        user: user
    };
}
export function editUser(user, options = {params: {includeattributes: true}} ) {
    return (dispatch, getState) => {
        let state = getState && getState();
        if (state) {
            // check if available groups are present
            if (!(state.users && state.users.groups)) {
                // get the current user [it should work]
                let currentUser = state.security && state.security.user;
                dispatch(getGroups(currentUser || {role: "ADMIN"}));
            }
        }
        if (user && user.id) {
            dispatch(editUserLoading(user));
            API.getUser(user.id, options).then((userDetails) => {
                let userLoaded = userDetails.User;
                let attribute = userLoaded.attribute;
                if (attribute) {
                    userLoaded = {
                        ...userLoaded,
                        attribute: Array.isArray(attribute) ? attribute : [attribute]
                    };
                }
                // the service returns groups = "", skip this to avoid overriding
                if (userLoaded) {
                    userLoaded = {...userLoaded, groups: user.groups};
                }
                dispatch(editUserSuccess(userLoaded));
            }).catch((error) => {
                dispatch(editUserError(user, error));
            });
        } else {
            dispatch(editNewUser(user));
        }
    };
}

export function savingUser(user) {
    return {
        type: USERMANAGER_UPDATE_USER,
        status: "saving",
        user
    };
}

export function savedUser(userDetails) {
    return {
        type: USERMANAGER_UPDATE_USER,
        status: "saved",
        user: userDetails && userDetails.User
    };
}

export function saveError(user, error) {
    return {
        type: USERMANAGER_UPDATE_USER,
        status: "error",
        user,
        error
    };
}

export function creatingUser(user) {
    return {
        type: USERMANAGER_UPDATE_USER,
        status: "creating",
        user
    };
}

export function userCreated(id, user) {
    return {
        type: USERMANAGER_UPDATE_USER,
        status: "created",
        user: { ...user, id}
    };
}

export function createError(user, error) {
    return {
        type: USERMANAGER_UPDATE_USER,
        status: "error",
        user,
        error
    };
}

export function saveUser(user, options = {}) {
    return (dispatch) => {
        // remove lastError before save
        let newUser = assign({}, {...user});
        if (newUser && newUser.lastError) {
            delete newUser.lastError;
        }
        if (newUser && newUser.id) {
            dispatch(savingUser(newUser));
            return API.updateUser(newUser.id, {...newUser, groups: { group: newUser.groups}}, options).then((userDetails) => {
                dispatch(savedUser(userDetails));
                dispatch(getUsers());
            }).catch((error) => {
                dispatch(saveError(newUser, error));
            });
        }
        // createUser
        dispatch(creatingUser(newUser));
        let userToPost = {...newUser};
        if (newUser && newUser.groups) {
            userToPost = {...newUser, groups: { group: newUser.groups.filter((g) => {
                return g.groupName !== SecurityUtils.USER_GROUP_ALL; // see:https://github.com/geosolutions-it/geostore/issues/149
            })}};
        }
        return API.createUser(userToPost, options).then((id) => {
            dispatch(userCreated(id, newUser));
            dispatch(getUsers());
        }).catch((error) => {
            dispatch(createError(newUser, error));
        });

    };
}
export function changeUserMetadata(key, newValue) {
    return {
        type: USERMANAGER_EDIT_USER_DATA,
        key,
        newValue
    };
}

export function deletingUser(id) {
    return {
        type: USERMANAGER_DELETE_USER,
        status: "deleting",
        id
    };
}
export function deleteUserSuccess(id) {
    return {
        type: USERMANAGER_DELETE_USER,
        status: "deleted",
        id
    };
}
export function deleteUserError(id, error) {
    return {
        type: USERMANAGER_DELETE_USER,
        status: "error",
        id,
        error
    };
}

export function closeDelete(status, id) {
    return {
        type: USERMANAGER_DELETE_USER,
        status,
        id
    };
}
export function deleteUser(id, status = "confirm") {
    if (status === "confirm" || status === "cancelled") {
        return closeDelete(status, id);
    } else if ( status === "delete") {
        return (dispatch) => {
            dispatch(deletingUser(id));
            API.deleteUser(id).then(() => {
                dispatch(deleteUserSuccess(id));
                dispatch(getUsers());
            }).catch((error) => {
                dispatch(deleteUserError(id, error));
            });
        };
    }
    return () => {};
}

export function usersSearchTextChanged(text) {
    return {
        type: USERS_SEARCH_TEXT_CHANGED,
        text
    };
}
