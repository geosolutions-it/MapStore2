/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const axios = require('../libs/ajax');
const _ = require('lodash');
var defaultBaseURL = "/mapstore/rest/geostore/";
var geoStoreClient = axios.create({
    baseURL: defaultBaseURL
});
var parseOptions = (opts) => opts;
/**
 * API for local config
 */
var Api = {
    getData: function(id, options) {
        let url = "data/" + id;
        return geoStoreClient.get(url, parseOptions(options)).then(function(response) {
            return response.data;
        });
    },
    getResourcesByCategory: function(category, query, options) {
        let q = query || "*";
        let url = "extjs/search/category/" + category + "/*" + q + "*/";
        return geoStoreClient.get(url, parseOptions(options)).then(function(response) {return response.data; });
    },
    basicLogin: function(username, password, options) {
        let url = "users/user/details";
        return geoStoreClient.get(url, _.merge({
            auth: {
                username: username,
                password: password
            },
            params: {
                includeattributes: true
            }
        }, options)).then(function(response) {
            return response.data;
        });
    },
    logout() {
        geoStoreClient = axios.create({
            baseURL: defaultBaseURL
        });
    },
    changePassword: function(user, newPassword, options) {
        return geoStoreClient.put(
            "users/user/" + user.id, "<User><newPassword>" + newPassword + "</newPassword></User>",
            _.merge({
                headers: {
                    'Content-Type': "application/xml"
                }
            }, options));
    },
    // utility function
    // parses the state to get the auth header and so on.
    getAuthOptionsFromState: function(state, baseParams = {}) {
        let authHeader = state && state.userDetails && state.userDetails.authHeader;
        if (authHeader) {
            return _.merge({
                // TODO support deep merge of attributes
                headers: {
                    'Authorization': authHeader
                }
            }, baseParams);
        }
        return baseParams;

    }
};

module.exports = Api;
