/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { castArray, get } from 'lodash';

import axios from '../../libs/ajax';
import ConfigUtils from '../../utils/ConfigUtils';
import CatalogAPI from '../CSW';
import gsRuleService from './geofence/RuleService';
import gsUserService from './geofence/UserService';
import RuleService from '../geofence/RuleService';
import UserService from '../geofence/UserService';
import GSInstancesServices from "../geofence/GSInstanceService";
/**
 * Services to retrieve users and groups (roles)
 */
const USER_SERVICES = {
    geofence: UserService,
    geoserver: gsUserService
};

const RULE_SERVICES = {
    geofence: RuleService,
    geoserver: gsRuleService
};

const LAYER_SERVICES = {
    csw: ({ getGeoServerInstance}) => ({
        getLayers: (layerFilter = "", page = 0, size = 10, parentsFilter = {}, {gsInstanceURL, isStandAloneGeofence}) => {
            let { url: baseURL } = getGeoServerInstance() || {};
            // in case of stand-alone geofence, use gsInstanceURL
            if (isStandAloneGeofence && gsInstanceURL) {
                baseURL = gsInstanceURL;
            }
            // ensure URL ends with a slash to prevent path issues
            if (baseURL) {
                baseURL = baseURL.endsWith("/") ? baseURL : baseURL + "/";
            }
            const catalogUrl = baseURL + 'csw';
            const { workspace = "" } = parentsFilter;
            return CatalogAPI.workspaceSearch(catalogUrl, (page) * size + 1, size, layerFilter, workspace)
                .then((layers) => ({ data: layers.records.map(layer => ({ name: layer.dc.identifier.replace(/^.*?:/g, '') })), count: layers.numberOfRecordsMatched }));
        }
    }),
    rest: ({ addBaseUrlGS }) => ({
        getLayers: (_layerFilter, page = 0, size = 10, parentsFilter = {}, {gsInstanceURL}) => {
            const { workspace = "" } = parentsFilter;
            return axios.get('/rest/layers.json', addBaseUrlGS({
                'headers': {
                    'Accept': 'application/json'
                }
            }, gsInstanceURL))
                .then(response => get(response, 'data.layers.layer'))
                .then((layers = []) => castArray(layers))
                .then(layers => layers.filter(l => !workspace || l && l.name && l.name.indexOf(`${workspace}:`) === 0))
                .then(layers => ({
                    data: layers
                        .filter((r, i) => i >= page * size && i < (page + 1) * size) // emulate pagination
                        .map(layer => ({ name: layer.name.replace(/^.*?:/g, '') })),
                    count: layers.length
                }));
        }
    })
};
const GS_INSTANCES_SERVICES = {
    geofence: GSInstancesServices       // stand-alone geofence
};

/**
 * API for GeoFence Services
 * The API can be configured to use Standalone version or GeoServer integrated one.
 */
var Api = {
    // RULES
    cleanCache: () => {
        return Api.getRuleService().cleanCache();
    },
    loadRules: (page, rulesFiltersValues, entries = 10) => {
        return Api.getRuleService().loadRules(page, rulesFiltersValues, entries);
    },

    /**
     * Call the API to get the RulesCount with the provided rulesFilter
     * @returns {Promise<Number>} a promise that emits the count of rules using the current filter
     */
    getRulesCount: (rulesFiltersValues) => {
        return Api.getRuleService().getRulesCount(rulesFiltersValues);
    },

    moveRules: (targetPriority, rules) => {
        return Api.getRuleService().moveRules(targetPriority, rules);
    },

    updateRule: (rule) => {
        return Api.getRuleService().updateRule(rule);
    },
    deleteRule: (ruleId) => {
        return Api.getRuleService().deleteRule(ruleId);
    },

    addRule: (rule) => {
        return Api.getRuleService().addRule(rule);
    },

    // USERS-ROLES
    getRolesCount: function(filter = " ") {
        return Api.getUserService().getRolesCount(filter);
    },
    /**
     * Create a promise that resolves the users matched with the filter passed
     * @param {String} [filter] the text to search
     * @returns {Promise<object>} the object with this shape: `{roles: [{name: "USER"}]}`
     */
    getRoles: function(filter, page, entries = 10) {
        return Api.getUserService().getRoles(filter, page, entries);
    },

    getUsersCount: function(filter = " ") {
        return Api.getUserService().getUsersCount(filter);
    },
    /**
     * Create a promise that resolves the users matched with the filter passed
     * @param {String} [filter] the text to search
     * @returns {Promise<object>} the object with this shape: `{users: [{name: "USER"}]}`
     */
    getUsers: function(filter, page, entries = 10) {
        return Api.getUserService().getUsers(filter, page, entries);
    },
    getWorkspaces: function(gsInstanceURL) {
        return axios.get('rest/workspaces', Api.addBaseUrlGS({
            'headers': {
                'Accept': 'application/json'
            }
        }, gsInstanceURL)).then(function(response) {
            return response.data;
        });
    },
    /**
     * Returns a promise that resolves the list of layer, paginated, based on the filter search.
     *
     * @returns {Promise<object>} an object with this shape: `{data: [{name: "LAYER_NAME"}], count: 1}`. Count is the total number of result, out of pagination
     */
    getLayers: (layerFilter = "", page = 0, size = 10, parentsFilter = {}, gsInstanceURL) => {
        const isStandAloneGeofence = Api.getRuleServiceType() === 'geofence';
        return Api.getLayerService().getLayers(layerFilter, page, size, parentsFilter, {gsInstanceURL, isStandAloneGeofence});
    },
    getGeoServerInstance: () => ConfigUtils.getDefaults().geoFenceGeoServerInstance,

    /**
     * Get the API to use as user service (to retrieve users and roles)
     */
    getUserService: () => USER_SERVICES[Api.getUserServiceType()]({ addBaseUrl: Api.addBaseUrl, addBaseUrlGS: Api.addBaseUrlGS, getUserService: Api.getUserServiceName }),
    getRuleService: () => RULE_SERVICES[Api.getRuleServiceType()]({ addBaseUrl: Api.addBaseUrl, addBaseUrlGS: Api.addBaseUrlGS, getGeoServerInstance: Api.getGeoServerInstance}),
    getLayerService: () => LAYER_SERVICES[Api.getLayerServiceType()]({ addBaseUrl: Api.addBaseUrl, addBaseUrlGS: Api.addBaseUrlGS, getGeoServerInstance: Api.getGeoServerInstance }),
    getGSInstacesService: () => GS_INSTANCES_SERVICES[Api.getRuleServiceType()]({ addBaseUrl: Api.addBaseUrl, addBaseUrlGS: Api.addBaseUrlGS, getGeoServerInstance: Api.getGeoServerInstance}),
    /**
     * Get the user service type configured
     * @returns {string} one of `geofence`| `geoserver`. TODO: add other service types `geostore`
     */
    getUserServiceType: () => ConfigUtils.getDefaults().geoFenceUserServiceType || ConfigUtils.getDefaults().geoFenceServiceType || 'geofence',
    /**
    * Get the rule service type type configured. Can be geoserver or geofence.
    * @returns {string} one of `geofence`. TODO: add other service types (geostore, geoserver)
    */
    getRuleServiceType: () => ConfigUtils.getDefaults().geoFenceServiceType || 'geofence',
    // autocomplete service type for layers. Can be "rest" or "csw"
    getLayerServiceType: () => ConfigUtils.getDefaults().geoFenceLayerServiceType || 'csw',
    // returns the user service name (for GeoServer user name autocomplete that points to specific servic (i.e. geostore))
    getUserServiceName: () => ConfigUtils.getDefaults().geoserverUserServiceName,

    addBaseUrl: function(options = {}) {
        return Object.assign(options, {
            baseURL: ConfigUtils.getDefaults().geoFenceUrl + ( ConfigUtils.getDefaults().geoFencePath || 'geofence/rest' )});
    },
    addBaseUrlGS: function(options = {}, gsInstanceURL) {
        // in case of stand-alone geofence, use gsInstanceURL
        const isStandAloneGeofence = Api.getRuleServiceType() === 'geofence';
        let {url: baseURL} = ConfigUtils.getDefaults().geoFenceGeoServerInstance || {};
        if (isStandAloneGeofence && gsInstanceURL) {
            baseURL = gsInstanceURL;
        }
        // ensure URL ends with a slash to prevent path issues
        if (baseURL) {
            baseURL = baseURL.endsWith("/") ? baseURL : baseURL + "/";
        }
        return Object.assign(options, {baseURL});
    },
    // for gs instrances
    updateGSInstance: (gsInstance) => {
        return Api.getGSInstacesService().updateGSInstance(gsInstance);
    },
    deleteGSInstance: (gsInstanceId) => {
        return Api.getGSInstacesService().deleteGSInstance(gsInstanceId);
    },

    addGSInstance: (gsInstance) => {
        return Api.getGSInstacesService().addGSInstance(gsInstance);
    },
    loadGSInstances: () => {
        return Api.getGSInstacesService().loadGSInstances();
    },
    /**
     * Returns a promise that resolves the list of gs instances.
     *
     * @returns {Promise<object>} an object with this shape: `{data: [{name: "GS NAME", id: 0, url:""}], count: 1}`. Count is the total number of result, out of pagination
     */
    getGSInstancesForDD: () => {
        return Api.getGSInstacesService().loadGSInstancesForDD();
    }
};

export default Api;
