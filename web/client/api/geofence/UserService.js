/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const axios = require('../../libs/ajax');
const { toJSONPromise } = require('./common');

/**
 * Implementation for GeoFence API of UserService that uses GeoFence REST API
 * This implementation interacts with the Stand-Alone version of GeoFence.
 */
module.exports = ({ addBaseUrl }) => ({
    getRolesCount: (filter = " ") => {
        const encodedFilter = encodeURIComponent(`%${filter}%`);
        return axios.get(`/groups/count/${encodedFilter}`, addBaseUrl({
            'headers': {
                'Accept': 'text/plain'
            }
        })).then((response) => {
            return response.data;
        });
    },
    getRoles: (filter, page, entries = 10) => {
        const params = {
            page,
            entries,
            nameLike: `%${filter}%`
        };
        const options = { params };
        return axios.get(`/groups`, addBaseUrl(options))
            .then((response) => toJSONPromise(response.data))
            .then(({UserGroupList = {}}) => ({roles: [].concat(UserGroupList.UserGroup || [])}));
    },
    getUsersCount: (filter = " ") => {
        const encodedFilter = encodeURIComponent(`%${filter}%`);
        return axios.get(`/users/count/${encodedFilter}`, addBaseUrl({
            'headers': {
                'Accept': 'text/plain'
            }
        })).then((response) => {
            return response.data;
        });
    },

    getUsers: (filter, page, entries = 10) => {
        const params = {
            page,
            entries,
            nameLike: `%${filter}%`
        };
        const options = { params };
        return axios.get(`/users`, addBaseUrl(options)).then((response) => {
            return toJSONPromise(response.data);
        })
            .then(({ UserList = {} }) => ({ users: [].concat(UserList.User || []) }));
    }
});
