/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const USERMANAGER_GETUSERS = 'USERMANAGER_GETUSERS';
const USERMANAGER_EDIT_USER = 'USERMANAGER_EDIT_USER';
const USERMANAGER_EDIT_USER_DATA = 'USERMANAGER_EDIT_USER_DATA';
const USERMANAGER_UPDATE_USER = 'USERMANAGER_UPDATE_USER';
const API = require('../api/GeoStoreDAO');
const {get, assign} = require('lodash');

function getUsers(text = "*", options) {
    let {start, limit} = options && options.params;
    return (dispatch) => {
        dispatch({
            type: USERMANAGER_GETUSERS,
            status: "loading",
            searchText: text,
            start,
            limit
        });

        return API.getUsers(text, options).then((response) => {
            let users = get(response, "ExtUserList.User");
            let totalCount = get(response, "ExtUserList.UserCount");
            users = Array.isArray(users) ? users : [users];
            users = users.map((user) => {
                let groups = get(user, "groups.group");
                groups = Array.isArray(groups) ? groups : [groups];
                return assign({}, user, {
                    groups
                });
            });
            dispatch({
                type: USERMANAGER_GETUSERS,
                status: "success",
                searchText: text,
                start,
                limit,
                users,
                totalCount

            });
        }).catch((error) => {
            dispatch({
                type: USERMANAGER_GETUSERS,
                status: "error",
                searchText: text,
                start,
                limit,
                error
            });
        });
    };
}

function editUser(user, options ={params: {includeattributes: true}} ) {
    return (dispatch) => {
        if (user && user.id) {
            dispatch({
                type: USERMANAGER_EDIT_USER,
                status: "loading",
                user
            });
            return API.getUser(user.id, options).then((userDetails) => {
                let userLoaded = userDetails.User;
                let attribute = userLoaded.attribute;
                if (attribute) {
                    userLoaded = {
                        ...userLoaded,
                        attribute: Array.isArray() ? attribute : [attribute]
                    };
                }
                dispatch({
                    type: USERMANAGER_EDIT_USER,
                    status: "success",
                    user: userLoaded
                });
            }).catch((error) => {
                dispatch({
                    type: USERMANAGER_EDIT_USER,
                    status: "error",
                    user,
                    error
                });
            });
        }
        dispatch({
            type: USERMANAGER_EDIT_USER,
            user: user
        });
    };
}
function saveUser(user, options = {}) {
    return (dispatch) => {
        if (user && user.id) {
            dispatch({
                type: USERMANAGER_UPDATE_USER,
                status: "saving",
                user
            });
            return API.updateUser(user.id, user, options).then((userDetails) => {
                dispatch({
                    type: USERMANAGER_UPDATE_USER,
                    status: "saved",
                    user: userDetails && userDetails.User
                });
            }).catch((error) => {
                dispatch({
                    type: USERMANAGER_UPDATE_USER,
                    status: "error",
                    user,
                    error
                });
            });
        }
        // createUser
        dispatch({
            type: USERMANAGER_UPDATE_USER,
            status: "creating",
            user
        });
        return API.createUser(user, options).then((id) => {
            dispatch({
                type: USERMANAGER_UPDATE_USER,
                status: "created",
                user: { ...user, id}
            });
        }).catch((error) => {
            dispatch({
                type: USERMANAGER_UPDATE_USER,
                status: "error",
                user,
                error
            });
        });
    };
}
function changeUserMetadata(key, newValue) {
    return {
        type: USERMANAGER_EDIT_USER_DATA,
        key,
        newValue
    };
}
module.exports = {
    getUsers, USERMANAGER_GETUSERS,
    editUser, USERMANAGER_EDIT_USER,
    changeUserMetadata, USERMANAGER_EDIT_USER_DATA,
    saveUser, USERMANAGER_UPDATE_USER
};
