/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const GETGROUPS = 'GROUPMANAGER_GETGROUPS';
export const EDITGROUP = 'GROUPMANAGER_EDITGROUP';
export const EDITGROUPDATA = 'GROUPMANAGER_EDITGROUP_DATA';
export const UPDATEGROUP = 'GROUPMANAGER_UPDATE_GROUP';
export const DELETEGROUP = 'GROUPMANAGER_DELETEGROUP';
export const SEARCHTEXTCHANGED = 'GROUPMANAGER_SEARCHTEXTCHANGED';
export const SEARCHUSERS = 'GROUPMANAGER_SEARCHUSERS';
export const STATUS_LOADING = "loading";
export const STATUS_SUCCESS = "success";
export const STATUS_ERROR = "error";
// export  const STATUS_NEW = "new";
export const STATUS_SAVING = "saving";
export const STATUS_SAVED = "saved";
export const STATUS_CREATING = "creating";
export const STATUS_CREATED = "created";
export const STATUS_DELETED = "deleted";

/*
export const USERGROUPMANAGER_UPDATE_GROUP = 'USERMANAGER_UPDATE_GROUP';
export const USERGROUPMANAGER_DELETE_GROUP = 'USERMANAGER_DELETE_GROUP';
export const USERGROUPMANAGER_SEARCH_TEXT_CHANGED = 'USERGROUPMANAGER_SEARCH_TEXT_CHANGED';
*/
import API from '../api/GeoStoreDAO';

import { get } from 'lodash';
import assign from 'object-assign';

export function getUserGroupsLoading(text, start, limit) {
    return {
        type: GETGROUPS,
        status: STATUS_LOADING,
        searchText: text,
        start,
        limit
    };
}
export function getUserGroupSuccess(text, start, limit, groups, totalCount) {
    return {
        type: GETGROUPS,
        status: STATUS_SUCCESS,
        searchText: text,
        start,
        limit,
        groups,
        totalCount

    };
}
export function getUserGroupError(text, start, limit, error) {
    return {
        type: GETGROUPS,
        status: STATUS_ERROR,
        searchText: text,
        start,
        limit,
        error
    };
}
export function getUserGroups(searchText, options) {
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
            let oldText = get(state, "usergroups.searchText");
            text = searchText || oldText || "*";
            start = start !== null && start !== undefined ? start : get(state, "usergroups.start") || 0;
            limit = limit || get(state, "usergroups.limit") || 12;
        }
        dispatch(getUserGroupsLoading(text, start, limit));

        return API.getGroups(text, {...options, params: {start, limit}}).then((response) => {
            let groups;
            // this because _.get returns an array with an undefined element isntead of null
            if (!response || !response.ExtGroupList || !response.ExtGroupList.Group) {
                groups = [];
            } else {
                groups = get(response, "ExtGroupList.Group");
            }

            let totalCount = get(response, "ExtGroupList.GroupCount");
            groups = Array.isArray(groups) ? groups : [groups];
            dispatch(getUserGroupSuccess(text, start, limit, groups, totalCount));
        }).catch((error) => {
            dispatch(getUserGroupError(text, start, limit, error));
        });
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
        let newGroup = assign({}, {...group});
        if (newGroup && newGroup.lastError) {
            delete newGroup.lastError;
        }
        if (newGroup && newGroup.id) {
            dispatch(savingGroup(newGroup));
            return API.updateGroupMembers(newGroup, options).then((groupDetails) => {
                dispatch(savedGroup(groupDetails));
                dispatch(getUserGroups());
            }).catch((error) => {
                dispatch(saveError(newGroup, error));
            });
        }
        // create Group
        dispatch(creatingGroup(newGroup));
        return API.createGroup(newGroup, options).then((id) => {
            dispatch(groupCreated(id, newGroup));
            dispatch(getUserGroups());
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
                dispatch(getUserGroups());
            }).catch((error) => {
                dispatch(deleteGroupError(id, error));
            });
        };
    }
    return () => {};
}

export function groupSearchTextChanged(text) {
    return {
        type: SEARCHTEXTCHANGED,
        text
    };
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
