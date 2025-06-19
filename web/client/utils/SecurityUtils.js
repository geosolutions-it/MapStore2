/**
import { keys } from 'lodash';
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ConfigUtils from "./ConfigUtils";
import URL from "url";
import head from "lodash/head";
import isNil from "lodash/isNil";
import isArray from "lodash/isArray";
import isEmpty from "lodash/isEmpty";

import {setStore as stateSetStore, getState} from "./StateUtils";

export const USER_GROUP_ALL = 'everyone';

export function getCredentials(id) {
    const securityStorage = JSON.parse(sessionStorage.getItem('credentialStorage') ?? "{}");
    return securityStorage[id] || {};
}
export function setCredentials(id, credentials) {
    const securityStorage = JSON.parse(sessionStorage.getItem('credentialStorage') ?? "{}");
    sessionStorage.setItem('credentialStorage', JSON.stringify(Object.assign({}, securityStorage, {[id]: credentials})));
}
/**
 * Stores the logged user security information.
 */
export function setStore(store) {
    stateSetStore(store);
}

/**
 * Gets security state form the store.
 */
export function getSecurityInfo() {
    return getState().security || {};
}

/**
 * Returns the current user or undefined if not available.
 */
export function getUser() {
    return getSecurityInfo()?.user;
}

/**
 * Returns the current user basic authentication header value.
 */
export function getBasicAuthHeader() {
    return getSecurityInfo()?.authHeader;
}

/**
 * Returns the current user access token value.
 */
export function getToken() {
    return getSecurityInfo()?.token;
}

/**
 * Returns the current user refresh token value.
 * The refresh token is used to get a new access token.
 */
export function getRefreshToken() {
    return getSecurityInfo()?.refresh_token;
}

/**
 * Return the user attributes as an array. If the user is undefined or
 * doesn't have any attributes an empty array is returned.
 */
export function getUserAttributes(providedUser) {
    const user = providedUser || getUser();
    if (!user || !user.attribute) {
        // not user defined or the user doesn't have any attributes
        return [];
    }
    const attributes = user.attribute;
    // if the user has only one attribute we need to put it in an array
    return isArray(attributes) ? attributes : [attributes];
}

/**
 * Search in the user attributes an attribute that matches the provided
 * attribute name. The search will not be case sensitive. Undefined is
 * returned if the attribute could not be found.
 */
export function findUserAttribute(attributeName) {
    // getting the user attributes
    const userAttributes = getUserAttributes();
    if (!userAttributes || !attributeName ) {
        // the user as no attributes or the provided attribute name is undefined
        return null;
    }
    return head(userAttributes.filter(attribute => attribute.name
        && attribute.name.toLowerCase() === attributeName.toLowerCase()));
}

/**
 * Search in the user attributes an attribute that matches the provided
 * attribute name. The search will not be case sensitive. Undefined is
 * returned if the attribute could not be found otherwise the attribute
 * value is returned.
 */
export function findUserAttributeValue(attributeName) {
    const userAttribute = findUserAttribute(attributeName);
    return userAttribute?.value;
}

/**
 * Returns an array with the configured authentication rules. If no rules
 * were configured an empty array is returned.
 */
export function getAuthenticationRules() {
    return ConfigUtils.getConfigProp('authenticationRules') || [];
}

/**
 * Checks if authentication is activated or not.
 */
export function isAuthenticationActivated() {
    return ConfigUtils.getConfigProp('useAuthenticationRules') || false;
}

/**
 * Returns the authentication method that should be used for the provided URL.
 * We go through the authentication rules and find the first one that matches
 * the provided URL, if no rule matches the provided URL undefined is returned.
 */
export function getAuthenticationMethod(url) {
    const foundRule = head(getAuthenticationRules().filter(
        rule => rule && rule.urlPattern && url.match(new RegExp(rule.urlPattern, "i"))));
    return foundRule?.method;
}

/**
 * Returns the authentication rule that should be used for the provided URL.
 * We go through the authentication rules and find the first one that matches
 * the provided URL, if no rule matches the provided URL undefined is returned.
 */
export function getAuthenticationRule(url) {
    return head(getAuthenticationRules().filter(
        rule => rule && rule.urlPattern && url.match(new RegExp(rule.urlPattern, "i"))));
}

export function getAuthKeyParameter(url) {
    const foundRule = getAuthenticationRule(url);
    return foundRule?.authkeyParamName ?? 'authkey';
}

export function getAuthenticationHeaders(url, securityToken, security) {
    if (!url || !isAuthenticationActivated()) {
        return null;
    }
    const storedProtectedService = getCredentials(security?.sourceId);
    if (security && storedProtectedService) {
        return {
            "Authorization": `Basic ${btoa(storedProtectedService.username + ":" + storedProtectedService.password)}`
        };
    }
    switch (getAuthenticationMethod(url)) {
    case 'bearer': {
        const token = !isNil(securityToken) ? securityToken : getToken();
        if (!token) {
            return null;
        }
        return {
            "Authorization": `Bearer ${token}`
        };
    }
    case 'header': {
        const rule = getAuthenticationRule(url);
        return rule.headers;
    }
    default:
        // we cannot handle the required authentication method
        return null;
    }
}

/**
 * This method will add query parameter based authentications to an object
 * containing query parameters.
 */
export function addAuthenticationParameter(url, parameters, securityToken) {
    if (!url || !isAuthenticationActivated()) {
        return parameters;
    }
    switch (getAuthenticationMethod(url)) {
    case 'authkey': {
        const token = !isNil(securityToken) ? securityToken : getToken();
        if (!token) {
            return parameters;
        }
        const authParam = getAuthKeyParameter(url);
        return Object.assign(parameters || {}, {[authParam]: token});
    }
    case 'test': {
        const rule = getAuthenticationRule(url);
        const token = rule ? rule.token : "";
        const authParam = getAuthKeyParameter(url);
        return Object.assign(parameters || {}, { [authParam]: token });
    }
    default:
        // we cannot handle the required authentication method
        return parameters;
    }
}

/**
 * This method will add query parameter based authentications to an url.
 */
export function addAuthenticationToUrl(url) {
    if (!url || !isAuthenticationActivated()) {
        return url;
    }
    const parsedUrl = URL.parse(url, true);
    parsedUrl.query = addAuthenticationParameter(url, parsedUrl.query);
    // we need to remove this to force the use of query
    delete parsedUrl.search;
    return URL.format(parsedUrl);
}

export function clearNilValuesForParams(params = {}) {
    return Object.keys(params).reduce((pre, cur) => {
        return !isNil(params[cur]) ? {...pre, [cur]: params[cur]} : pre;
    }, {});
}

export function addAuthenticationToSLD(layerParams, options) {
    if (layerParams.SLD) {
        const parsed = URL.parse(layerParams.SLD, true);
        const params = addAuthenticationParameter(layerParams.SLD, parsed.query, options.securityToken);
        return Object.assign({}, layerParams, {
            SLD: URL.format(Object.assign({}, parsed, {
                query: params,
                search: undefined
            }))
        });
    }
    return layerParams;
}

export function cleanAuthParamsFromURL(url) {
    return ConfigUtils.filterUrlParams(url, [getAuthKeyParameter(url)].filter(p => p));
}

/**
 * it creates the headers function for axios config, if it finds a reference in sessionStorage
 * @param {string} protectedId the id of the protected service to look for in sessionStorage
 * @returns {object} the headers Basic
 */
export const getAuthorizationBasic = (protectedId) => {
    let headers = {};
    const storedProtectedService = getCredentials(protectedId);
    if (!isEmpty(storedProtectedService)) {
        headers = {
            Authorization: `Basic ${btoa(storedProtectedService.username + ":" + storedProtectedService.password)}`
        };
    }
    return headers;
};

/**
 * This utility class will get information about the current logged user directly from the store.
 */
const SecurityUtils = {
    getAuthorizationBasic,
    getCredentials,
    setCredentials,
    setStore,
    getSecurityInfo,
    getUser,
    getBasicAuthHeader,
    getToken,
    getRefreshToken,
    getUserAttributes,
    findUserAttribute,
    findUserAttributeValue,
    getAuthenticationRules,
    isAuthenticationActivated,
    getAuthenticationMethod,
    getAuthenticationRule,
    addAuthenticationToUrl,
    addAuthenticationParameter,
    clearNilValuesForParams,
    addAuthenticationToSLD,
    getAuthKeyParameter,
    cleanAuthParamsFromURL,
    getAuthenticationHeaders,
    USER_GROUP_ALL
};

export default SecurityUtils;
