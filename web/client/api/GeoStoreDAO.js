/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const axios = require('../libs/ajax');
const _ = require('lodash');
const assign = require('object-assign');
const uuidv1 = require('uuid/v1');
const ConfigUtils = require('../utils/ConfigUtils');
const {utfEncode} = require('../utils/EncodeUtils');

let parseOptions = (opts) => opts;

let parseAdminGroups = (groupsObj) => {
    if (!groupsObj || !groupsObj.UserGroupList || !groupsObj.UserGroupList.UserGroup || !_.isArray(groupsObj.UserGroupList.UserGroup)) return [];
    return groupsObj.UserGroupList.UserGroup.filter(obj => !!obj.id).map((obj) => _.pick(obj, ["id", "groupName", "description"]));
};

let parseUserGroups = (groupsObj) => {
    if (!groupsObj || !groupsObj.User || !groupsObj.User.groups || !groupsObj.User.groups.group || !_.isArray(groupsObj.User.groups.group)) {
        if (_.has(groupsObj.User.groups.group, "id", "groupName")) {
            return [groupsObj.User.groups.group];
        }
        return [];
    }
    return groupsObj.User.groups.group.filter(obj => !!obj.id).map((obj) => _.pick(obj, ["id", "groupName", "description"]));
};

const encodeContent = function(content) {
    return utfEncode(content);
};

/**
 * API for local config
 */
var Api = {
    authProviderName: "geostore",
    addBaseUrl: function(options) {
        return assign(options || {}, {baseURL: ConfigUtils.getDefaults().geoStoreUrl});
    },
    getData: function(id, options) {
        const url = "data/" + id;
        return axios.get(url, this.addBaseUrl(parseOptions(options))).then(function(response) {
            return response.data;
        });
    },
    getResource: function(resourceId, options) {
        return axios.get(
            "resources/resource/" + resourceId,
            this.addBaseUrl(parseOptions(options))).then(function(response) {return response.data; });
    },
    getResourcesByCategory: function(category, query, options) {
        const q = query || "*";
        const url = "extjs/search/category/" + category + "/*" + q + "*/thumbnail"; // comma-separated list of wanted attributes
        return axios.get(url, this.addBaseUrl(parseOptions(options))).then(function(response) {return response.data; });
    },
    getUserDetails: function(username, password, options) {
        const url = "users/user/details";
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
    login: function(username, password, options) {
        const url = "session/login";
        let authData;
        return axios.post(url, null, this.addBaseUrl(_.merge({
            auth: {
                username: username,
                password: password
            }
        }, options))).then((response) => {
            authData = response.data;
            return axios.get("users/user/details", this.addBaseUrl(_.merge({
                headers: {
                    'Authorization': 'Bearer ' + response.data.access_token
                },
                params: {
                    includeattributes: true
                }
            }, options)));
        }).then((response) => {
            return { ...response.data, ...authData};
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
    updateResourceAttribute: function(resourceId, name, value, type, options) {
        return axios.put(
            "resources/resource/" + resourceId + "/attributes/" + name + "/" + value, null,
            this.addBaseUrl(_.merge({
                headers: {
                    'Content-Type': "application/xml"
                }
            }, options)));
    },
    putResourceMetadata: function(resourceId, newName, newDescription, options) {
        return axios.put(
            "resources/resource/" + resourceId,
            "<Resource><description>" + (newDescription || "") + "</description><metadata></metadata>" +
            "<name>" + (newName || "") + "</name></Resource>",
            this.addBaseUrl(_.merge({
                headers: {
                    'Content-Type': "application/xml"
                }
            }, options)));
    },
    encodeContent,
    putResource: function(resourceId, content, options) {
        return axios.put(
            "data/" + resourceId,
            encodeContent(content),
            this.addBaseUrl(_.merge({
                headers: {
                    'Content-Type': "text/plain;charset=utf-8"
                }
            }, options)));
    },
    updateResourcePermissions: function(resourceId, securityRules) {
        let payload = "<SecurityRuleList>";
        for (let rule of securityRules.SecurityRuleList.SecurityRule) {
            if (rule.canRead || rule.canWrite) {
                if (rule.user) {
                    payload = payload + "<SecurityRule>";
                    payload = payload + "<canRead>" + (rule.canRead || rule.canWrite ? "true" : "false") + "</canRead>";
                    payload = payload + "<canWrite>" + (rule.canWrite ? "true" : "false") + "</canWrite>";
                    payload = payload + "<user><id>" + (rule.user.id || "") + "</id><name>" + (rule.user.name || "") + "</name></user>";
                    payload = payload + "</SecurityRule>";
                } else if (rule.group) {
                    payload = payload + "<SecurityRule>";
                    payload = payload + "<canRead>" + (rule.canRead || rule.canWrite ? "true" : "false") + "</canRead>";
                    payload = payload + "<canWrite>" + (rule.canWrite ? "true" : "false") + "</canWrite>";
                    payload = payload + "<group><id>" + (rule.group.id || "") + "</id><groupName>" + (rule.group.groupName || "") + "</groupName></group>";
                    payload = payload + "</SecurityRule>";
                }
                // NOTE: if rule has no group or user, it is skipped
                // NOTE: if rule is "no read and no write", it is skipped
            }
        }
        payload = payload + "</SecurityRuleList>";
        return axios.post(
            "resources/resource/" + resourceId + "/permissions",
            payload,
            this.addBaseUrl({
                headers: {
                    'Content-Type': "application/xml"
                }
            }));
    },
    createResource: function(metadata, data, category, options) {
        const name = metadata.name;
        const description = metadata.description || "";
        // filter attributes from the metadata object excluding the default ones
        const attributes = metadata.attributes || _.pick(metadata, Object.keys(metadata).filter(function(key) {
            return key !== "name" && key !== "description" && key !== "id";
        }));

        const xmlAttrs = Object.keys(attributes).map((key) => {
            return "<attribute><name>" + key + "</name><value>" + attributes[key] + "</value><type>STRING</type></attribute>";
        });
        let attributesSection = "";
        if (xmlAttrs.length > 0) {
            attributesSection = "<Attributes>" + xmlAttrs.join("") + "</Attributes>";
        }
        return axios.post(
            "resources/",
                "<Resource><description>" + description + "</description><metadata></metadata>" +
                "<name>" + (name || "") + "</name><category><name>" + (category || "") + "</name></category>" +
                attributesSection +
                "<store><data><![CDATA[" + (data || "") + "]]></data></store></Resource>",
            this.addBaseUrl(_.merge({
                headers: {
                    'Content-Type': "application/xml"
                }
            }, options)));
    },
    deleteResource: function(resourceId, options) {
        return axios.delete(
            "resources/resource/" + resourceId,
            this.addBaseUrl(_.merge({
            }, options)));
    },
    getUserGroups: function(options) {
        const url = "usergroups/";
        return axios.get(url, this.addBaseUrl(parseOptions(options))).then(function(response) {
            return response.data;
        });
    },
    getPermissions: function(mapId, options) {
        const url = "resources/resource/" + mapId + "/permissions";
        return axios.get(url, this.addBaseUrl(parseOptions(options))).then(function(response) {return response.data; });
    },
    getAvailableGroups: function(user) {
        if (user && user.role === "ADMIN") {
            return axios.get(
                "usergroups/?all=true",
                this.addBaseUrl({
                    headers: {
                        'Accept': "application/json"
                    }
                })).then(function(response) {
                    return parseAdminGroups(response.data);
                });
        }
        return axios.get(
            "users/user/details",
            this.addBaseUrl({
                headers: {
                    'Accept': "application/json"
                }
            })).then(function(response) {
                return parseUserGroups(response.data);
            });
    },
    getUsers: function(textSearch, options = {}) {
        const url = "extjs/search/users" + (textSearch ? "/" + textSearch : "");
        return axios.get(url, this.addBaseUrl(parseOptions(options))).then(function(response) {return response.data; });
    },
    getUser: function(id, options = {params: {includeattributes: true}}) {
        const url = "users/user/" + id;
        return axios.get(url, this.addBaseUrl(parseOptions(options))).then(function(response) {return response.data; });
    },
    updateUser: function(id, user, options) {
        const url = "users/user/" + id;
        const postUser = assign({}, user);
        if (postUser.newPassword === "") {
            delete postUser.newPassword;
        }
        return axios.put(url, {User: postUser}, this.addBaseUrl(parseOptions(options))).then(function(response) {return response.data; });
    },
    createUser: function(user, options) {
        const url = "users/";

        return axios.post(url, {User: Api.utils.initUser(user)}, this.addBaseUrl(parseOptions(options))).then(function(response) {return response.data; });
    },
    deleteUser: function(id, options = {}) {
        const url = "users/user/" + id;
        return axios.delete(url, this.addBaseUrl(parseOptions(options))).then(function(response) {return response.data; });
    },
    getGroups: function(textSearch, options = {}) {
        const url = "extjs/search/groups" + (textSearch ? "/" + textSearch : "");
        return axios.get(url, this.addBaseUrl(parseOptions(options))).then(function(response) {return response.data; });
    },
    getGroup: function(id, options = {}) {
        const url = "usergroups/group/" + id;
        return axios.get(url, this.addBaseUrl(parseOptions(options))).then(function(response) {
            let groupLoaded = response.data.UserGroup;
            let users = groupLoaded && groupLoaded.restUsers && groupLoaded.restUsers.User;
            return {...groupLoaded, users: users && (Array.isArray(users) ? users : [users]) || []};
        });
    },
    createGroup: function(group, options) {
        const url = "usergroups/";
        let groupId;
        return axios.post(url, {UserGroup: {...group}}, this.addBaseUrl(parseOptions(options)))
            .then(function(response) {
                groupId = response.data;
                return Api.updateGroupMembers({...group, id: groupId}, options);
            }).then(() => groupId);
    },
    updateGroupMembers: function(group, options) {
        // No GeoStore API to update group name and description. only update new users
        if (group.newUsers) {
            let restUsers = group.users || group.restUsers && group.restUsers.User || [];
            restUsers = Array.isArray(restUsers) ? restUsers : [restUsers];
            // old users not present in the new users list
            let toRemove = restUsers.filter( (user) => _.findIndex(group.newUsers, u => u.id === user.id) < 0);
            // new users not present in the old users list
            let toAdd = group.newUsers.filter( (user) => _.findIndex(restUsers, u => u.id === user.id) < 0);

            // create callbacks
            let removeCallbacks = toRemove.map( (user) => () => this.removeUserFromGroup(user.id, group.id, options) );
            let addCallbacks = toAdd.map( (user) => () => this.addUserToGroup(user.id, group.id), options );
            let requests = [...removeCallbacks.map( call => call.call(this)), ...addCallbacks.map(call => call())];
            return axios.all(requests).then(() => {
                return {
                    ...group,
                    newUsers: null,
                    restUsers: { User: group.newUsers},
                    users: group.newUsers
                };
            });
        }
        return new Promise( (resolve) => {
            resolve({
                ...group
            });
        });
    },
    deleteGroup: function(id, options = {}) {
        const url = "usergroups/group/" + id;
        return axios.delete(url, this.addBaseUrl(parseOptions(options))).then(function(response) {return response.data; });
    },
    addUserToGroup(userId, groupId, options = {}) {
        const url = "/usergroups/group/" + userId + "/" + groupId + "/";
        return axios.post(url, null, this.addBaseUrl(parseOptions(options)));
    },
    removeUserFromGroup(userId, groupId, options = {}) {
        const url = "/usergroups/group/" + userId + "/" + groupId + "/";
        return axios.delete(url, this.addBaseUrl(parseOptions(options)));
    },
    verifySession: function(options) {
        const url = "users/user/details";
        return axios.get(url, this.addBaseUrl(_.merge({
            params: {
                includeattributes: true
            }
        }, options))).then(function(response) {
            return response.data;
        });
    },
    refreshToken: function(accessToken, refreshToken, options) {
        // accessToken is actually the sessionID
        const url = "session/refresh/" + accessToken + "/" + refreshToken;
        return axios.post(url, null, this.addBaseUrl(parseOptions(options))).then(function(response) {
            return response.data;
        });
    },
    utils: {
        /**
         * initialize User with newPassword and UUID
         * @param  {object} user The user object
         * @return {object}      The user object adapted for creation (newPassword, UUID)
         */
        initUser: (user) => {
            const postUser = assign({}, user);
            if (postUser.newPassword) {
                postUser.password = postUser.newPassword;
            }
            // uuid is time-based
            const uuidAttr = {
                name: "UUID", value: uuidv1()
            };
            postUser.attribute = postUser.attribute && postUser.attribute.length > 0 ? [...postUser.attribute, uuidAttr] : [uuidAttr];
            return postUser;
        }
    }
};

module.exports = Api;
