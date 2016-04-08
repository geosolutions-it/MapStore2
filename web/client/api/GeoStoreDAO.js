/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const axios = require('../libs/ajax');
const assign = require('object-assign');
var defaultBaseURL = "/mapstore/rest/geostore/";
var geoStoreClient = axios.create({
    baseURL: defaultBaseURL
});

/**
 * API for local config
 */
var Api = {
    getData: function(id, geoStoreBase) {
        let baseURL = geoStoreBase ? geoStoreBase : defaultBaseURL;
        let url = "data/" + id;
        return geoStoreClient.get(url, {
            baseURL: baseURL
        }).then(function(response) {
            return response.data;
        });
    },
    getResourcesByCategory: function(category, query, params, geoStoreBase) {
        let baseURL = geoStoreBase ? geoStoreBase : defaultBaseURL;
        let q = query || "*";
        let url = "extjs/search/category/" + category + "/*" + q + "*/";
        return geoStoreClient.get(url, assign(params, {baseURL: baseURL}, {})).then(function(response) {return response.data; });
    },
    basicLogin: function(username, password, geoStoreBase) {
        let baseURL = geoStoreBase ? geoStoreBase : defaultBaseURL;
        let url = "users/user/details";
        return geoStoreClient.get(url, {
            baseURL: baseURL,
            auth: {
                username: username,
                password: password
            },
            params: {
                includeattributes: true
            }
        }).then(function(response) {
            geoStoreClient = axios.create({
                baseURL: baseURL,
                auth: {
                    username: username,
                    password: password
                }
            });
            return response.data;
        });
    },
    logout() {
        geoStoreClient = axios.create({
            baseURL: defaultBaseURL
        });
    },
    changePassword: function(user, newPassword) {
        return geoStoreClient.put("users/user/" + user.id, "<User><newPassword>" + newPassword + "</newPassword></User>", {
            headers: {
                'Content-Type': "application/xml"
            }
        }).then(function() {
            geoStoreClient = axios.create(
                assign(geoStoreClient.defaultConfig, {
                     auth: {
                        username: user.name,
                        password: newPassword
                    }
                })
            );
        });
    }
};

module.exports = Api;
