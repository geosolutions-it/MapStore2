/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const axios = require('../libs/ajax');
const _ = require('lodash');
const assign = require('object-assign');

const ConfigUtils = require('../utils/ConfigUtils');

var parseOptions = (opts) => opts;
/**
 * API for local config
 */
var Api = {
    getData: function(id, options) {
        let url = "data/" + id;
        return axios.get(url, this.addBaseUrl(parseOptions(options))).then(function(response) {
            return response.data;
        });
    },
    getResourcesByCategory: function(category, query, options) {
        let q = query || "*";
        let url = "extjs/search/category/" + category + "/*" + q + "*/thumbnail"; // comma-separated list of wanted attributes
        return axios.get(url, this.addBaseUrl(parseOptions(options))).then(function(response) {return response.data; });
    },
    basicLogin: function(username, password, options) {
        let url = "users/user/details";
        return axios.get(url, this.addBaseUrl(_.merge({
            auth: {
                username: username,
                password: password
            },
            params: {
                includeattributes: true
            }
        }, options))).then(function(response) {
            return response.data;
        });
    },
    changePassword: function(user, newPassword, options) {
        return axios.put(
            "users/user/" + user.id, "<User><newPassword>" + newPassword + "</newPassword></User>",
            this.addBaseUrl(_.merge({
                headers: {
                    'Content-Type': "application/xml"
                }
            }, options)));
    },
    addBaseUrl: function(options) {
        return assign(options, {baseURL: ConfigUtils.getDefaults().geoStoreUrl});
    }
};

module.exports = Api;
