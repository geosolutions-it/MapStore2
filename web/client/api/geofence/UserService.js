/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const axios = require('../../libs/ajax');


module.exports = ({ addBaseUrl }) => ({
    getGroupsCount: (filter = " ") => {
        const encodedFilter = encodeURIComponent(`%${filter}%`);
        return axios.get(`/groups/count/${encodedFilter}`, addBaseUrl({
            'headers': {
                'Accept': 'text/plain'
            }
        })).then((response) => {
            return response.data;
        });
    },
    getGroups: (filter, page, entries = 10) => {
        const params = {
            page,
            entries,
            nameLike: `%${filter}%`
        };
        const options = { params };
        return axios.get(`/groups`, addBaseUrl(options)).then((response) => {
            return response.data;
        });
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
            return response.data;
        });
    }
});
