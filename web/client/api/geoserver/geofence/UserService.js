/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const axios = require('../../../libs/ajax');


module.exports = ({ addBaseUrlGS }) => {
    // TODO: cache;
    const getRoles = () => axios.get(`/rest/security/roles.json`, addBaseUrlGS({
        'headers': {
            'Accept': 'application/xml'
        }
    }))
        .then(response => response && response.data && response.data.roles || []);
    const filterRoles = (f = "") => (role = "") => role.indexOf(f.replace('%', '')) >= 0;

    const getUsers = () => axios.get(`/rest/security/usergroup/users.json`, addBaseUrlGS({
        'headers': {
            'Accept': 'application/xml'
        }
    }))
        .then(response => response && response.data && response.data.users || []);
    // TODO: implement
    const filterUsers = (f = "") => ({ userName = "" }) => userName.indexOf(f.replace('%', '')) >= 0;
    return {
        getGroupsCount: (filter = " ") => {
            return getRoles()
                .then((roles = []) => roles.filter(filterRoles(filter)).length);
        },
        getGroups: (filter, page, entries = 10) => {
            return getRoles()
                .then((roles = []) => roles.filter(filterRoles(filter)))
                // paginate
                .then(roles => roles.filter((r, i) => i >= page * entries))
                // TODO: fix this bad naming that uses the users variable to contain roles
                .then(users => ({ users }));
        },
        getUsersCount: (filter = " ") => {
            return getUsers()
                .then((users = []) => users.filter(filterUsers(filter)).length);
        },

        getUsers: (filter, page, entries = 10) => {
            return getUsers()
                .then((users = []) => users.filter(filterUsers(filter)))
                // paginate
                .then(roles => roles.filter((r, i) => i >= page * entries))
                .then(users => ({ users }));
        }
    };
};
