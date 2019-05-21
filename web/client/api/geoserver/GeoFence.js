/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const axios = require('../../libs/ajax');
const assign = require('object-assign');


const ConfigUtils = require('../../utils/ConfigUtils');

/**
 * Services to retrieve users and groups (roles)
 */
const USER_SERVICES = {
    geofence: require('../geofence/UserService'),
    geoserver: require('./geofence/UserService')
};

const RULE_SERVICES = {
    geofence: require('../geofence/RuleService'),
    geoserver: require('./geofence/RuleService')
};


/**
 * API for GeoFence Services
 */
var Api = {
    // RULES
    cleanCache: () => {
        return Api.getRuleService().cleanCache();
    },
    loadRules: (page, rulesFiltersValues, entries = 10) => {
        return Api.getRuleService().loadRules(page, rulesFiltersValues, entries);
    },

    getRulesCount: (rulesFiltersValues) => {
        return Api.getRuleService().getRulesCount(rulesFiltersValues);
    },

    moveRules: (targetPriority, rules) => {
        return Api.getRuleService().moveRules(targetPriority, rules);
    },

    deleteRule: (ruleId) => {
        return Api.getRuleService().deleteRule(ruleId);
    },

    addRule: (rule) => {
        return Api.getRuleService().addRule(rule);
    },

    // USERS-ROLES
    getGroupsCount: function(filter = " ") {
        return Api.getUserService().getGroupsCount(filter);
    },
    getGroups: function(filter, page, entries = 10) {
        return Api.getUserService().getGroups(filter, page, entries);
    },
    getUsersCount: function(filter = " ") {
        return Api.getUserService().getUsersCount(filter);
    },

    getUsers: function(filter, page, entries = 10) {
        return Api.getUserService().getUsers(filter, page, entries);
    },
    getWorkspaces: function() {
        return axios.get('rest/workspaces', Api.addBaseUrlGS({
            'headers': {
                'Accept': 'application/json'
            }
        })).then(function(response) {
            return response.data;
        });
    },
    getGeoServerInstance: () => ConfigUtils.getDefaults().geoFenceGeoServerInstance,

    /**
     * Get the API to use as user service (to retrieve users and roles)
     */
    getUserService: () => USER_SERVICES[Api.getUserServiceType()]({ addBaseUrl: Api.addBaseUrl, addBaseUrlGS: Api.addBaseUrlGS }),
    getRuleService: () => RULE_SERVICES[Api.getRuleServiceType()]({ addBaseUrl: Api.addBaseUrl, addBaseUrlGS: Api.addBaseUrlGS, getGeoServerInstance: Api.getGeoServerInstance}),
    /**
     * Get the API type configured
     * @returns {string} one of `geofence`. TODO: add other service types (geostore, geoserver)
     */
    getUserServiceType: () => ConfigUtils.getDefaults().geoFenceUserServiceType || ConfigUtils.getDefaults().geoFenceServiceType || 'geofence',
    getRuleServiceType: () => ConfigUtils.getDefaults().geoFenceServiceType || 'geofence',

    addBaseUrl: function(options = {}) {
        return assign(options, {
            baseURL: ConfigUtils.getDefaults().geoFenceUrl + ( ConfigUtils.getDefaults().geoFencePath || 'geofence/rest' )});
    },
    addBaseUrlGS: function(options = {}) {
        const {url: baseURL} = ConfigUtils.getDefaults().geoFenceGeoServerInstance || {};
        return assign(options, {baseURL});
    }
};

module.exports = Api;
