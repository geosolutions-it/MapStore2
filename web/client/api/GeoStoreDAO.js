/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { castArray, findIndex, get, has, isArray, merge, omit, pick } from 'lodash';

import assign from 'object-assign';
import uuidv1 from 'uuid/v1';
import xml2js from 'xml2js';
const xmlBuilder = new xml2js.Builder();

import axios from '../libs/ajax';
import ConfigUtils from '../utils/ConfigUtils';
import { registerErrorParser } from '../utils/LocaleUtils';
import { encodeUTF8 } from '../utils/EncodeUtils';


const generateMetadata = (name = "", description = "", advertised = true) =>
    "<description><![CDATA[" + description + "]]></description>"
    + "<metadata></metadata>"
    + "<name><![CDATA[" + (name) + "]]></name>"
    + "<advertised>" + advertised + "</advertised>";
const createAttributeList = (metadata = {}) => {
    const attributes = metadata.attributes || omit(metadata, ["name", "description", "id", "advertised"]);

    const xmlAttrs = Object.keys(attributes).map((key) => {
        return "<attribute><name>" + key + "</name><value><![CDATA[" + attributes[key] + "]]></value><type>STRING</type></attribute>";
    });
    let attributesSection = "";
    if (xmlAttrs.length > 0) {
        attributesSection = "<Attributes>" + xmlAttrs.join("") + "</Attributes>";
    }
    return attributesSection;
};
let parseOptions = (opts) => opts;

let parseAdminGroups = (groupsObj) => {
    if (!groupsObj || !groupsObj.UserGroupList || !groupsObj.UserGroupList.UserGroup) return [];

    const pickFromObj = (obj) => pick(obj, ["id", "groupName", "description"]);
    if (isArray(groupsObj.UserGroupList.UserGroup)) {
        return groupsObj.UserGroupList.UserGroup.filter(obj => !!obj.id).map(pickFromObj);
    }
    return [pickFromObj(groupsObj.UserGroupList.UserGroup)];
};

let parseUserGroups = (groupsObj) => {
    if (!groupsObj || !groupsObj.User || !groupsObj.User.groups || !groupsObj.User.groups.group || !isArray(groupsObj.User.groups.group)) {
        if (has(groupsObj.User.groups.group, "id", "groupName")) {
            return [groupsObj.User.groups.group];
        }
        return [];
    }
    return groupsObj.User.groups.group.filter(obj => !!obj.id).map((obj) => pick(obj, ["id", "groupName", "description"]));
};

const boolToString = (b) => b ? "true" : "false";

const errorParser = {
    /**
     * Returns localized message for geostore map errors
     * @param  {object} e error object
     * @return {object} {title, message}
     */
    mapsError: e => {
        if (e.status === 403 || e.status === 404 || e.status === 409 || e.status === 500) {
            return {
                title: 'map.mapError.errorTitle',
                message: 'map.mapError.error' + e.status
            };
        }
        return {
            title: 'map.mapError.errorTitle',
            message: 'map.mapError.errorDefault'
        };
    }
};

registerErrorParser('geostore', {...errorParser});

/**
 * API for local config
 */
const Api = {
    createAttributeList,
    generateMetadata,
    authProviderName: "geostore",
    /**
     * add the geostore base url, default is /mapstore/rest/geostore/
     * @param {object} options axios options
     * @return {object} options with baseURL
     */
    addBaseUrl: function(options) {
        return assign({}, options, {baseURL: options && options.baseURL || ConfigUtils.getDefaults().geoStoreUrl});
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
    getResourceIdByName: function(category, name, options) {
        return axios.get(
            "misc/category/name/" + category + "/resource/name/" + name,
            this.addBaseUrl(parseOptions(options))).then(response => get(response, 'data.Resource.id'));
    },
    getResourceDataByName: function(category, name, options) {
        return axios.get(
            "misc/category/name/" + category + "/resource/name/" + name + "/data",
            this.addBaseUrl(parseOptions(options))).then(response => get(response, 'data'));
    },
    getShortResource: function(resourceId, options) {
        return axios.get(
            "extjs/resource/" + resourceId,
            this.addBaseUrl(parseOptions(options))).then(function(response) { return response.data; });
    },
    getResourcesByCategory: function(category, query, options) {
        const q = query || "*";
        const url = "extjs/search/category/" + category + "/*" + q + "*/thumbnail,details,featured"; // comma-separated list of wanted attributes
        return axios.get(url, this.addBaseUrl(parseOptions(options))).then(function(response) {return response.data; });
    },
    createCategory: function(category) {
        return axios.post(
            "categories",
            `<Category><name>${category}</name></Category>`,
            this.addBaseUrl({
                headers: {
                    'Content-Type': "application/xml"
                }
            })
        ).then(response => response.data);
    },
    getUserDetailsBasic: function(username, password, options) {
        const url = "users/user/details";
        return axios.get(url, this.addBaseUrl(merge({
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
    /**
     * Gets the user details using the given access token.
     * Can be used to finalize access with openID after redirect, using the token passed by the service to retrieve the
     * remaining information.
     * @param {object} params contains access_token to pass in the bearer header
     * @returns {object} user details
     */
    getUserDetails: function({access_token: accessToken}) {
        const url = "users/user/details";
        return axios.get(url, {
            baseURL: "rest/geostore",
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            params: {
                includeattributes: true
            }
        }).then(function(response) {
            return response.data;
        });
    },
    /**
     * Gets the tokens for a given identifier, created during openID login.
     * @param {string} provider the provider name (e.g. keycloak)
     * @param {string} identifier the identifier of the token
     * @returns {object}
     */
    getTokens: function(provider, identifier) {
        return axios.get(
            `openid/${provider}/tokens`,
            this.addBaseUrl({params: {identifier}})
        ).then(response => response.data?.sessionToken);
    },
    login: function(username, password, options) {
        const url = "session/login";
        let authData;
        return axios.post(url, null, this.addBaseUrl(merge((username && password) ? {
            auth: {
                username: encodeUTF8(username),
                password: password // password is already encoded by axios
            }
        } : {}, options))).then((response) => {
            authData = response.data?.sessionToken ?? response.data;
            return axios.get("users/user/details", this.addBaseUrl(merge({
                headers: {
                    'Authorization': 'Bearer ' + authData?.access_token
                },
                params: {
                    includeattributes: true
                }
            }, options)));
        }).then((response) => {
            return { ...response.data, ...authData};
        });
    },
    logout: function() {
        const url = "session/logout";
        return axios.delete(url, this.addBaseUrl({}));
    },
    changePassword: function(user, newPassword, options) {
        return axios.put(
            "users/user/" + user.id, {
                User: {
                    newPassword
                }
            },
            this.addBaseUrl(merge({
                headers: {
                    'Content-Type': "application/json"
                }
            }, options)));
    },
    updateResourceAttribute: function(resourceId, name, value, type, options) {
        return axios.put(
            "resources/resource/" + resourceId + "/attributes/", {
                "restAttribute": {
                    name,
                    value
                }
            },
            this.addBaseUrl(merge({
                headers: {
                    'Content-Type': "application/json"
                }
            }, options)));
    },
    getResourceAttribute: function(resourceId, name, options = {}) {
        return axios.get(
            "resources/resource/" + resourceId + "/attributes/" + name,
            this.addBaseUrl(merge({
                headers: {
                    'Content-Type': "application/xml"
                }
            }, options)));
    },
    getResourceAttributes: function(resourceId, options = {}) {
        return axios.get(
            "resources/resource/" + resourceId + "/attributes",
            this.addBaseUrl({
                headers: {
                    'Accept': "application/json"
                },
                ...options
            })).then(({ data } = {}) => data)
            .then(data => castArray(get(data, "AttributeList.Attribute") || []))
            .then(attributes => attributes || []);
    },
    /**
     * same of getPermissions but clean data properly and returns only the array of rules.
     */
    getResourcePermissions: function(resourceId, options, withSelector = true) {
        return Api.getPermissions(resourceId, options)
            .then(rl => castArray( withSelector ? get(rl, 'SecurityRuleList.SecurityRule') : rl))
            .then(rules => (rules && rules[0] && rules[0] !== "") ? rules : []);
    },
    putResourceMetadata: function(resourceId, newName, newDescription, advertised, options) {
        return axios.put(
            "resources/resource/" + resourceId,
            "<Resource>" + generateMetadata(newName, newDescription, advertised) + "</Resource>",
            this.addBaseUrl(merge({
                headers: {
                    'Content-Type': "application/xml"
                }
            }, options)));
    },
    putResourceMetadataAndAttributes: function(resourceId, metadata, options) {
        return axios.put(
            "resources/resource/" + resourceId,
            "<Resource>" + generateMetadata(metadata.name, metadata.description, metadata.advertised) + createAttributeList(metadata) + "</Resource>",
            this.addBaseUrl(merge({
                headers: {
                    'Content-Type': "application/xml"
                }
            }, options)));
    },
    putResource: function(resourceId, content, options) {
        return axios.put(
            "data/" + resourceId,
            content,
            this.addBaseUrl(merge({
                headers: {
                    'Content-Type': typeof content === 'string' ? "text/plain; charset=utf-8" : 'application/json; charset=utf-8'
                }
            }, options)));
    },
    writeSecurityRules: function(SecurityRuleList = {}) {
        return "<SecurityRuleList>" +
        (castArray(SecurityRuleList.SecurityRule) || []).map( rule => {
            if (rule.canRead || rule.canWrite) {
                if (rule.user) {
                    return "<SecurityRule>"
                        + "<canRead>" + boolToString(rule.canRead || rule.canWrite) + "</canRead>"
                        + "<canWrite>" + boolToString(rule.canWrite) + "</canWrite>"
                        + "<user><id>" + (rule.user.id || "") + "</id><name>" + (rule.user.name || "") + "</name></user>"
                        + "</SecurityRule>";
                } else if (rule.group) {
                    return "<SecurityRule>"
                        + "<canRead>" + boolToString(rule.canRead || rule.canWrite) + "</canRead>"
                        + "<canWrite>" + boolToString(rule.canWrite) + "</canWrite>"
                        + "<group><id>" + (rule.group.id || "") + "</id><groupName>" + (rule.group.groupName || "") + "</groupName></group>"
                        + "</SecurityRule>";
                }
                // NOTE: if rule has no group or user, it is skipped
                // NOTE: if rule is "no read and no write", it is skipped
            }
            return "";
        }).join('') + "</SecurityRuleList>";
    },
    updateResourcePermissions: function(resourceId, securityRules) {
        const payload = Api.writeSecurityRules(securityRules.SecurityRuleList);
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
        const attributesSection = createAttributeList(metadata);
        return axios.post(
            "resources/",
            "<Resource>" + generateMetadata(name, description, metadata.advertised) + "<category><name>" + (category || "") + "</name></category>" +
                attributesSection +
                "<store><data><![CDATA[" + (
                data
                        && (
                            (typeof data === 'object')
                                ? JSON.stringify(data)
                                : data)
                        || "") + "]]></data></store></Resource>",
            this.addBaseUrl(merge({
                headers: {
                    'Content-Type': "application/xml"
                }
            }, options)));
    },
    deleteResource: function(resourceId, options) {
        return axios.delete(
            "resources/resource/" + resourceId,
            this.addBaseUrl(merge({
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
                "usergroups/?all=true&users=false",
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
            const groupLoaded = response.data.UserGroup;
            const users = groupLoaded?.restUsers?.User;
            const attributes = groupLoaded?.attributes;
            return {
                ...groupLoaded,
                users: users ? castArray(users) : undefined,
                attributes: attributes ? castArray(attributes) : undefined
            };
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
    updateGroup: function(group, options) {
        const id = group?.id;
        const url = `usergroups/group/${id}`;
        return axios.put(url, {UserGroup: {...group}}, this.addBaseUrl(parseOptions(options)))
            .then(function() {
                return Api.updateGroupMembers(group, options);
            })
            .then(() => id);
    },
    updateGroupMembers: function(group, options) {
        // No GeoStore API to update group name and description. only update new users
        if (group.newUsers) {
            let restUsers = group.users || group.restUsers && group.restUsers.User || [];
            restUsers = Array.isArray(restUsers) ? restUsers : [restUsers];
            // old users not present in the new users list
            let toRemove = restUsers.filter( (user) => findIndex(group.newUsers, u => u.id === user.id) < 0);
            // new users not present in the old users list
            let toAdd = group.newUsers.filter( (user) => findIndex(restUsers, u => u.id === user.id) < 0);

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
        return axios.get(url, this.addBaseUrl(merge({
            params: {
                includeattributes: true
            }
        }, options))).then(function(response) {
            return response.data;
        });
    },
    refreshToken: function(accessToken, refreshToken, options) {
        const url = "session/refreshToken";
        return axios.post(url, {
            sessionToken: {
                access_token: accessToken,
                refresh_token: refreshToken
            }
        }, this.addBaseUrl(parseOptions(options))).then(function(response) {
            return response.data?.sessionToken ?? response.data;
        });
    },
    /**
     * send a request to /extjs/search/list
     * @param  {object} filters
     * @param  {object} options additional axios options
     * @return {object}
     * @example
     *
     *  const filters = {
     *      AND: {
     *          ATTRIBUTE: [
     *              {
     *                  name: ['featured'],
     *                  operator: ['EQUAL_TO'],
     *                  type: ['STRING'],
     *                  value: [true]
     *              }
     *          ]
     *      }
     *  }
     *
     *  searchListByAttributes(filters)
     *      .then(results => results)
     *      .catch(error => error);
     *
     */
    searchListByAttributes: (filter, options, url = "/extjs/search/list") => {
        const xmlFilter = xmlBuilder.buildObject(filter);
        return axios.post(
            url,
            xmlFilter,
            Api.addBaseUrl({
                ...parseOptions(options),
                headers: {
                    "Content-Type": "application/xml",
                    "Accept": "application/json"
                }
            })
        )
            .then(response => response.data);
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
    },
    errorParser,
    /**
     * get the available tags
     * @param {string} textSearch search text query
     * @param {object} options additional axios options
     */
    getTags: (textSearch, options = {}) => {
        const url = '/resources/tag';
        return axios.get(url, Api.addBaseUrl(parseOptions({
            ...options,
            params: {
                ...options?.params,
                ...(textSearch && { nameLike: textSearch })
            }
        }))).then((response) => response.data);
    },
    /**
     * update/create a tag
     * @param {object} tag a tag object { id, name, description, color } (it will create a new tag if id is undefined)
     * @param {object} options additional axios options
     */
    updateTag: (tag = {}, options = {}) => {
        const url = `/resources/tag${tag.id ? `/${tag.id}` : ''}`;
        return axios[tag.id ? 'put' : 'post'](
            url,
            [
                '<Tag>',
                `<name><![CDATA[${tag.name}]]></name>`,
                `<description><![CDATA[${tag.description}]]></description>`,
                `<color>${tag.color}</color>`,
                '</Tag>'
            ].join(''),
            Api.addBaseUrl(
                parseOptions({
                    ...options,
                    headers: {
                        'Content-Type': "application/xml"
                    }
                })
            )).then((response) => response.data);
    },
    /**
     * get the available tags
     * @param {string} tagId tag identifier
     * @param {object} options additional axios options
     */
    deleteTag: (tagId, options = {}) => {
        const url = `/resources/tag/${tagId}`;
        return axios.delete(url, Api.addBaseUrl(parseOptions(options))).then((response) => response.data);
    },
    /**
     * link a tag to a resource
     * @param {string} tagId tag identifier
     * @param {string} resourceId resource identifier
     * @param {object} options additional axios options
     */
    linkTagToResource: (tagId, resourceId, options) => {
        const url = `/resources/tag/${tagId}/resource/${resourceId}`;
        return axios.post(url, undefined, Api.addBaseUrl(parseOptions(options))).then((response) => response.data);
    },
    /**
     * unlink a tag from a resource
     * @param {string} tagId tag identifier
     * @param {string} resourceId resource identifier
     * @param {object} options additional axios options
     */
    unlinkTagFromResource: (tagId, resourceId, options) => {
        const url = `/resources/tag/${tagId}/resource/${resourceId}`;
        return axios.delete(url, Api.addBaseUrl(parseOptions(options))).then((response) => response.data);
    },
    /**
     * add a resource to user favorites
     * @param  {string} userId user identifier
     * @param  {string} resourceId resource identifier
     * @param  {object} options additional axios options
     */
    addFavoriteResource: (userId, resourceId, options) => {
        const url = `/users/user/${userId}/favorite/${resourceId}`;
        return axios.post(url, undefined, Api.addBaseUrl(parseOptions(options))).then((response) => response.data);
    },
    /**
     * remove a resource from user favorites
     * @param  {string} userId user identifier
     * @param  {string} resourceId resource identifier
     * @param  {object} options additional axios options
     */
    removeFavoriteResource: (userId, resourceId, options) => {
        const url = `/users/user/${userId}/favorite/${resourceId}`;
        return axios.delete(url, Api.addBaseUrl(parseOptions(options))).then((response) => response.data);
    }
};

export default Api;
