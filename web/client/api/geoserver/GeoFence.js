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
const EMPTY_RULE = {
        constraints: {},
        ipaddress: "",
        layer: "",
        request: "",
        rolename: "",
        service: "",
        username: "",
        workspace: ""
    };
const cleanConstraints = (rule) => {
    if (!rule.constraints ) {
        return rule;
    }else if (rule.grant === "DENY") {
        const {constraints: omit, ...r} = rule;
        return r;
    }
    let constraints = {...rule.constraints};
    constraints.allowedStyles = constraints.allowedStyles && constraints.allowedStyles.style || [];
    constraints.attributes = constraints.attributes && constraints.attributes.attribute || [];
    constraints.restrictedAreaWkt = constraints.restrictedAreaWkt || "";
    return {...rule, constraints};
};
var Api = {
    cleanCache: () => {
        return axios.get('rest/geofence/ruleCache/invalidate', Api.addBaseUrlGS())
            .then(function(response) {
                return response.data;
            }
        );
    },
    loadRules: function(page, rulesFiltersValues, entries = 10) {
        const params = {
            page,
            entries,
            ...this.assignFiltersValue(rulesFiltersValues)
        };
        const options = {params, 'headers': {
            'Content': 'application/json'
        }};
        return axios.get('geofence/rest/rules', this.addBaseUrl(options))
            .then(function(response) {
                return response.data;
            }
        );
    },

    getRulesCount: function(rulesFiltersValues) {
        const options = {
            'params': this.assignFiltersValue(rulesFiltersValues)
        };
        return axios.get('geofence/rest/rules/count', this.addBaseUrl(options)).then(function(response) {
            return response.data;
        });
    },

    moveRules: function(targetPriority, rules) {
        const options = {
            'params': {
                'targetPriority': targetPriority,
                'rulesIds': rules && rules.map(rule => rule.id).join()
            }
        };
        return axios.get('geofence/rest/rules/move', this.addBaseUrl(options)).then(function(response) {
            return response.data;
        });
    },

    deleteRule: function(ruleId) {
        return axios.delete('geofence/rest/rules/id/' + ruleId, this.addBaseUrl({}));
    },

    addRule: function(rule) {
        const newRule = {...rule};
        if (!newRule.instance) {
            const {id: instanceId} = ConfigUtils.getDefaults().geoFenceGeoServerInstance;
            newRule.instance = {id: instanceId};
        }
        if (!newRule.grant) {
            newRule.grant = "ALLOW";
        }
        return axios.post('geofence/rest/rules', cleanConstraints(newRule), this.addBaseUrl({
            'headers': {
                'Content': 'application/json'
            }
        }));
    },

    updateRule: function(rule) {
        // id, priority and grant aren't updatable
        const {id, priority, grant, position, ...others} = cleanConstraints(rule);
        const newRule = {...EMPTY_RULE, ...others};
        return axios.put(`geofence/rest/rules/id/${id}`, newRule, this.addBaseUrl({
            'headers': {
                'Content': 'application/json'
            }
        }));
    },

    assignFiltersValue: function(rulesFiltersValues = {}) {
        return Object.keys(rulesFiltersValues).map(key => ({key, normKey: this.normalizeKey(key)}))
                .reduce((params, {key, normKey}) => ({...params, [normKey]: this.normalizeFilterValue(rulesFiltersValues[key])}), {});
    },

    normalizeFilterValue(value) {
        return value === "*" ? undefined : value;
    },
    normalizeKey(key) {
        switch (key) {
            case 'username':
                return 'userName';
            case 'rolename':
                return 'groupName';
            default:
                return key;
        }
    },
    assignFilterValue: function(queryParameters, filterName, filterAny, filterValue) {
        if (!filterValue) {
            return;
        }
        if (filterValue === '*') {
            assign(queryParameters, {[filterAny]: 1});
        } else {
            assign(queryParameters, {[filterName]: filterValue});
        }
    },
    getGroupsCount: function(filter = " ") {
        const encodedFilter = encodeURIComponent(`%${filter}%`);
        return axios.get(`geofence/rest/groups/count/${encodedFilter}`, this.addBaseUrl({
            'headers': {
                'Accept': 'text/plain'
            }
        })).then(function(response) {
            return response.data;
        });
    },
    getGroups: function(filter, page, entries = 10) {
        const params = {
            page,
            entries,
            nameLike: `%${filter}%`
        };
        const options = {params};
        return axios.get(`geofence/rest/groups`, this.addBaseUrl(options)).then(function(response) {
            return response.data;
        });
    },
    getUsersCount: function(filter = " ") {
        const encodedFilter = encodeURIComponent(`%${filter}%`);
        return axios.get(`geofence/rest/users/count/${encodedFilter}`, this.addBaseUrl({
            'headers': {
                'Accept': 'text/plain'
            }
        })).then(function(response) {
            return response.data;
        });
    },

    getUsers: function(filter, page, entries = 10) {
        const params = {
            page,
            entries,
            nameLike: `%${filter}%`
        };
        const options = {params};
        return axios.get(`geofence/rest/users`, this.addBaseUrl(options)).then(function(response) {
            return response.data;
        });
    },

    getWorkspaces: function() {
        return axios.get('rest/workspaces', this.addBaseUrlGS({
            'headers': {
                'Accept': 'application/json'
            }
        })).then(function(response) {
            return response.data;
        });
    },

    nullToAny: function(value) {
        return !value ? '*' : value;
    },

    addBaseUrl: function(options = {}) {
        return assign(options, {baseURL: ConfigUtils.getDefaults().geoFenceUrl});
    },
    addBaseUrlGS: function(options = {}) {
        const {url: baseURL} = ConfigUtils.getDefaults().geoFenceGeoServerInstance || {};
        return assign(options, {baseURL});
    }
};

module.exports = Api;
