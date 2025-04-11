/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const EDITGROUP = 'GROUPMANAGER_EDITGROUP';
export const EDITGROUPDATA = 'GROUPMANAGER_EDITGROUP_DATA';
export const UPDATEGROUP = 'GROUPMANAGER_UPDATE_GROUP';
export const DELETEGROUP = 'GROUPMANAGER_DELETEGROUP';
export const SEARCHUSERS = 'GROUPMANAGER_SEARCHUSERS';

export const UPDATE_USER_GROUPS = 'USER_GROUPS:UPDATE_USER_GROUPS';
export const UPDATE_USER_GROUPS_METADATA = 'USER_GROUPS:UPDATE_USER_GROUPS_METADATA';
export const SEARCH_USER_GROUPS = 'USER_GROUPS:SEARCH_USER_GROUPS';
export const RESET_SEARCH_USER_GROUPS = 'USER_GROUPS:RESET_SEARCH_USER_GROUPS';
export const LOADING_USER_GROUPS = 'USER_GROUPS:LOADING_USER_GROUPS';

export const STATUS_LOADING = "loading";
export const STATUS_SUCCESS = "success";
export const STATUS_ERROR = "error";
export const STATUS_SAVING = "saving";
export const STATUS_SAVED = "saved";
export const STATUS_CREATING = "creating";
export const STATUS_CREATED = "created";
export const STATUS_DELETED = "deleted";

import API from '../api/GeoStoreDAO';
import { get } from 'lodash';


export function updateUserGroups(userGroups) {
    return {
        type: UPDATE_USER_GROUPS,
        userGroups
    };
}

export function updateUserGroupsMetadata(metadata) {
    return {
        type: UPDATE_USER_GROUPS_METADATA,
        metadata
    };
}

export function loadingUserGroups(loading) {
    return {
        type: LOADING_USER_GROUPS,
        loading
    };
}

export function searchUserGroups({ params, clear, refresh }) {
    return {
        type: SEARCH_USER_GROUPS,
        clear,
        params,
        refresh
    };
}

export function resetSearchUserGroups() {
    return {
        type: RESET_SEARCH_USER_GROUPS
    };
}


export function editGroupLoading(group) {
    return {
        type: EDITGROUP,
        status: STATUS_LOADING,
        group
    };
}

export function editGroupSuccess(group) {
    return {
        type: EDITGROUP,
        status: STATUS_SUCCESS,
        group
    };
}

export function editGroupError(group, error) {
    return {
        type: EDITGROUP,
        status: STATUS_ERROR,
        group,
        error
    };
}

export function editNewGroup(group) {
    return {
        type: EDITGROUP,
        group
    };
}
// NOTE: not support on server side now for editing groups
export function editGroup(group, options = {params: {includeattributes: true}} ) {
    return (dispatch) => {
        if (group && group.id) {
            dispatch(editGroupLoading(group));
            API.getGroup(group.id, options).then((groupLoaded) => {
                // the service returns restUsers = "", skip this to avoid overriding
                dispatch(editGroupSuccess(groupLoaded));
            }).catch((error) => {
                dispatch(editGroupError(group, error));
            });
        } else {
            dispatch(editNewGroup(group));
        }
    };
}
export function changeGroupMetadata(key, newValue) {
    return {
        type: EDITGROUPDATA,
        key,
        newValue
    };
}

export function savingGroup(group) {
    return {
        type: UPDATEGROUP,
        status: STATUS_SAVING,
        group
    };
}

export function savedGroup(group) {
    return {
        type: UPDATEGROUP,
        status: STATUS_SAVED,
        group: group
    };
}

export function saveError(group, error) {
    return {
        type: UPDATEGROUP,
        status: STATUS_ERROR,
        group,
        error
    };
}

export function creatingGroup(group) {
    return {
        type: UPDATEGROUP,
        status: STATUS_CREATING,
        group
    };
}

export function groupCreated(id, group) {
    return {
        type: UPDATEGROUP,
        status: STATUS_CREATED,
        group: { ...group, id}
    };
}

export function createError(group, error) {
    return {
        type: UPDATEGROUP,
        status: STATUS_ERROR,
        group,
        error
    };
}

export function saveGroup(group, options = {}) {
    return (dispatch) => {
        let newGroup =  {...group};
        if (newGroup && newGroup.lastError) {
            delete newGroup.lastError;
        }
        // update group
        if (newGroup && newGroup.id) {
            dispatch(savingGroup(newGroup));
            return API.updateGroup(newGroup, options).then((groupDetails) => {
                dispatch(savedGroup(groupDetails));
                dispatch(searchUserGroups({ refresh: true }));
            }).catch((error) => {
                dispatch(saveError(newGroup, error));
            });
        }
        // create Group
        dispatch(creatingGroup(newGroup));
        return API.createGroup(newGroup, options).then((id) => {
            dispatch(groupCreated(id, newGroup));
            dispatch(searchUserGroups({ refresh: true }));
        }).catch((error) => {
            dispatch(createError(newGroup, error));
        });

    };
}

export function deletingGroup(id) {
    return {
        type: DELETEGROUP,
        status: "deleting",
        id
    };
}
export function deleteGroupSuccess(id) {
    return {
        type: DELETEGROUP,
        status: STATUS_DELETED,
        id
    };
}
export function deleteGroupError(id, error) {
    return {
        type: DELETEGROUP,
        status: STATUS_ERROR,
        id,
        error
    };
}

export function closeDelete(status, id) {
    return {
        type: DELETEGROUP,
        status,
        id
    };
}
export function deleteGroup(id, status = "confirm") {
    if (status === "confirm" || status === "cancelled") {
        return closeDelete(status, id);
    } else if ( status === "delete") {
        return (dispatch) => {
            dispatch(deletingGroup(id));
            API.deleteGroup(id).then(() => {
                dispatch(deleteGroupSuccess(id));
                dispatch(searchUserGroups({ refresh: true }));
            }).catch((error) => {
                dispatch(deleteGroupError(id, error));
            });
        };
    }
    return () => {};
}
export function searchUsersSuccessLoading() {
    return {
        type: SEARCHUSERS,
        status: STATUS_LOADING
    };
}
export function searchUsersSuccess(users, count = 0) {
    return {
        type: SEARCHUSERS,
        status: STATUS_SUCCESS,
        users,
        count: count
    };
}
export function searchUsersError(error) {
    return {
        type: SEARCHUSERS,
        status: STATUS_ERROR,
        error
    };
}
export function searchUsers(text = "*", start = 0, limit = 5, options = {}, jollyChar = "*") {
    return (dispatch) => {
        dispatch(searchUsersSuccessLoading(text, start, limit));
        return API.getUsers(jollyChar + text + jollyChar, {...options, params: {start, limit}}).then((response) => {
            let users;
            let userCount = 0;
            // this because _.get returns an array with an undefined element instead of null
            if (!response || !response.ExtUserList || !response.ExtUserList.User) {
                users = [];
            } else {
                users = get(response, "ExtUserList.User");
                userCount = get(response, "ExtUserList.UserCount");
            }
            users = Array.isArray(users) ? users : [users];
            dispatch(searchUsersSuccess(users, userCount));
        }).catch((error) => {
            dispatch(searchUsersError(error));
        });
    };
}
