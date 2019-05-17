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

/**
 * Services to retrieve users and groups (roles)
 */
const USER_SERVICES = {
    geofence: ({ addBaseUrl }) => ({
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
            return axios.get(`/groups`, this.addBaseUrl(options)).then( (response) => {
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
    }),
    geoserver: ({ addBaseUrlGS }) => {
        // TODO: cache;
        const getRoles = () => axios.get(`/rest/security/roles.json`, addBaseUrlGS({
            'headers': {
                'Accept': 'application/json'
            }
        }))
        .then( response => response && response.data && response.data.roles || []);
        const filterRoles = (f = "") => (role = "") => role.indexOf(f.replace('%', '')) >= 0;

        const getUsers = () => axios.get(`/rest/security/usergroup/users.json`, addBaseUrlGS({
            'headers': {
                'Accept': 'application/json'
            }
        }))
        .then(response => response && response.data && response.data.users || []);
        // TODO: implement
        const filterUsers = (f= "") => ({ userName = "" }) => userName.indexOf(f.replace('%', '')) >= 0;
        return {
            getGroupsCount: (filter = " ") => {
                return getRoles()
                    .then((roles = []) => roles.filter(filterRoles(filter)).length);
            },
            getGroups: (filter, page, entries = 10) => {
                return getRoles()
                    .then((roles = []) => roles.filter(filterRoles(filter)))
                    // paginate
                    .then( roles => roles.filter( (r, i) => i >= page * entries ))
                    // TODO: fix this bad naming that uses the users variable to contain roles
                    .then(users => ({ users }));
            },
            getUsersCount: (filter = " ") => {
                return getUsers()
                    .then((users = []) => users.filter(filterUsers(filter)).length);
            },

            getUsers: (filter, page, entries = 10) => {
                return getUsers()
                    .then((users = []) => users.filter(filterUsers(filter)))
                    // paginate
                    .then(roles => roles.filter((r, i) => i >= page * entries))
                    .then(users => ({ users }));
            }
        };
    }
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
        return axios.get('/rules', this.addBaseUrl(options))
            .then(function(response) {
                return response.data;
            }
        );
    },

    getRulesCount: function(rulesFiltersValues) {
        const options = {
            'params': this.assignFiltersValue(rulesFiltersValues)
        };
        return axios.get('/rules/count', this.addBaseUrl(options)).then(function(response) {
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
        return axios.get('/rules/move', this.addBaseUrl(options)).then(function(response) {
            return response.data;
        });
    },

    deleteRule: function(ruleId) {
        return axios.delete('/rules/id/' + ruleId, this.addBaseUrl({}));
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
        return axios.post('/rules', cleanConstraints(newRule), this.addBaseUrl({
            'headers': {
                'Content': 'application/json'
            }
        }));
    },

    updateRule: function(rule) {
        // id, priority and grant aren't updatable
        const {id, priority, grant, position, ...others} = cleanConstraints(rule);
        const newRule = {...EMPTY_RULE, ...others};
        return axios.put(`/rules/id/${id}`, newRule, this.addBaseUrl({
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
    /**
     * Get the API to use as user service (to retrieve users and roles)
     */
    getUserService: () => USER_SERVICES[Api.getUserServiceType()]({ addBaseUrl: Api.addBaseUrl, addBaseUrlGS: Api.addBaseUrlGS }),
    /**
     * Get the API type configured
     * @returns {string} one of `geofence`. TODO: add other service types (geostore, geoserver)
     */
    getUserServiceType: () => ConfigUtils.getDefaults().geoFenceUserServiceType || 'geoserver',
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
