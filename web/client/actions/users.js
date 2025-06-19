/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const USERMANAGER_EDIT_USER = 'USERMANAGER_EDIT_USER';
export const USERMANAGER_EDIT_USER_DATA = 'USERMANAGER_EDIT_USER_DATA';
export const USERMANAGER_UPDATE_USER = 'USERMANAGER_UPDATE_USER';
export const USERMANAGER_DELETE_USER = 'USERMANAGER_DELETE_USER';
export const USERMANAGER_GETGROUPS = 'USERMANAGER_GETGROUPS';

export const UPDATE_USERS = 'USERS:UPDATE_USERS';
export const UPDATE_USERS_METADATA = 'USERS:UPDATE_USERS_METADATA';
export const SEARCH_USERS = 'USERS:SEARCH_USERS';
export const RESET_SEARCH_USERS = 'USERS:RESET_SEARCH_USERS';
export const LOADING_USERS = 'USERS:LOADING_USERS';

import API from '../api/GeoStoreDAO';
import SecurityUtils from '../utils/SecurityUtils';

export function updateUsers(users) {
    return {
        type: UPDATE_USERS,
        users
    };
}

export function updateUsersMetadata(metadata) {
    return {
        type: UPDATE_USERS_METADATA,
        metadata
    };
}

export function loadingUsers(loading) {
    return {
        type: LOADING_USERS,
        loading
    };
}

export function searchUsers({ params, clear, refresh }) {
    return {
        type: SEARCH_USERS,
        clear,
        params,
        refresh
    };
}

export function resetSearchUsers() {
    return {
        type: RESET_SEARCH_USERS
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
        let newUser = { ...user };
        if (newUser && newUser.lastError) {
            delete newUser.lastError;
        }
        if (newUser && newUser.id) {
            dispatch(savingUser(newUser));
            return API.updateUser(newUser.id, {...newUser, groups: { group: newUser.groups}}, options).then((userDetails) => {
                dispatch(savedUser(userDetails));
                dispatch(searchUsers({ refresh: true }));
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
            dispatch(searchUsers({ refresh: true }));
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
                dispatch(searchUsers({ refresh: true }));
            }).catch((error) => {
                dispatch(deleteUserError(id, error));
            });
        };
    }
    return () => {};
}

