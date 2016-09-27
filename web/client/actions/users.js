/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const USERMANAGER_GETUSERS = 'USERMANAGER_GETUSERS';
const USERMANAGER_EDIT_USER = 'USERMANAGER_EDIT_USER';
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

function editUser(user = {}) {
    return {
        type: USERMANAGER_EDIT_USER,
        user
    };
}
module.exports = {
    getUsers, USERMANAGER_GETUSERS,
    editUser
};
