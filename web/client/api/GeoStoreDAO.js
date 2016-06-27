/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const axios = require('../libs/ajax');
const _ = require('lodash');

const ConfigUtils = require('../utils/ConfigUtils');

const defaultBaseURL = "/mapstore/rest/geostore/";
let geoStoreClient = axios.create({
    baseURL: defaultBaseURL
});

var parseOptions = (opts) => opts;
/**
 * API for local config
 */
var Api = {
    getData: function(id, options) {
        let url = "data/" + id;
        return this.getGeoStoreClient().get(url, parseOptions(options)).then(function(response) {
            return response.data;
        });
    },
    getResourcesByCategory: function(category, query, options) {
        let q = query || "*";
        let url = "extjs/search/category/" + category + "/*" + q + "*/thumbnail"; // comma-separated list of wanted attributes
        return this.getGeoStoreClient().get(url, parseOptions(options)).then(function(response) {return response.data; });
    },
    basicLogin: function(username, password, options) {
        let url = "users/user/details";
        return this.getGeoStoreClient().get(url, _.merge({
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
        this.getGeoStoreClient();
    },
    changePassword: function(user, newPassword, options) {
        return this.getGeoStoreClient().put(
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
        let authHeader = state && state.security && state.security.authHeader;
        if (authHeader) {
            return _.merge({
                // TODO support deep merge of attributes
                headers: {
                    'Authorization': authHeader
                }
            }, baseParams);
        }
        return baseParams;

    },
    getGeoStoreClient: function() {
        geoStoreClient = axios.create({
            baseURL: ConfigUtils.getDefaults().geoStoreUrl
        });

        return geoStoreClient;
    }
};

module.exports = Api;
