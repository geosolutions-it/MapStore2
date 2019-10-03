/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const axios = require('../../../libs/ajax');

// apply filters to results
const filterRoles = (f = "") => (role = "") => role.toUpperCase().indexOf(f.toUpperCase().replace('%', '')) >= 0;
const filterUsers = (f = "") => ({ userName = "" }) => userName.toUpperCase().indexOf(f.toUpperCase().replace('%', '')) >= 0;


// simulate pagination.
const virtualPagingFilter = (page, size) => (r, i) => i >= page * size && i < (page + 1) * size;

/**
 * Implementation of GeoFence API of UserService that uses GeoServer REST API
 * This implementation interacts with the GeoServer integrated version of GeoFence.
 */
module.exports = ({ addBaseUrlGS, getUserService = () => {} }) => {
    // retrieves roles from rest API
    // TODO: cache
    const getRoles = () => axios.get(`/rest/security/roles.json`, addBaseUrlGS({
        'headers': {
            'Accept': 'application/json'
        }
    })).then(response => response && response.data && response.data.roles || []);

    // retrieves users from rest API
    const getUsers = (service) => axios.get(`/rest/security/usergroup/${service ? `service/${service}/` : ''}users.json`, addBaseUrlGS({
        'headers': {
            'Accept': 'application/json'
        }
    })).then(response => response && response.data && response.data.users || []);


    return {
        getRolesCount: (filter = "") => {
            return getRoles()
                .then((roles = []) => roles.filter(filterRoles(filter)).length);
        },

        getRoles: (filter, page, size = 10) => {
            return getRoles()
                // filter by `filter` parameter
                .then((roles = []) => roles.filter(filterRoles(filter)))
                // paginate
                .then(roles => roles.filter(virtualPagingFilter(page, size)))
                // transform from GeoServer in to the expected format
                .then(roles => ({
                    roles: roles
                        .map(name => ({enabled: true, name}))
                }));
        },
        getUsersCount: (filter = "") => {
            return getUsers(getUserService())
                .then((users = []) => users.filter(filterUsers(filter)).length);
        },

        getUsers: (filter, page, size = 10) => {
            return getUsers(getUserService())
                // filter by `filter` parameter
                .then((users = []) => users.filter(filterUsers(filter)))
                // paginate
                .then(users => users.filter(virtualPagingFilter(page, size)))
                // convert into the expected format
                .then(users => ({
                    users: users.map(({ userName, enabled}) => ({
                        userName,
                        enabled
                    })) }));
        }
    };
};
