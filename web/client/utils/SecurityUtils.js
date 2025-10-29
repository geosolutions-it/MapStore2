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
import template from "lodash/template";
import get from "lodash/get";

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
 * Parses request configuration by replacing variables with actual values using lodash template
 * @param {Object} config - Configuration object with headers/params
 * @param {Object} securityProperties - Security properties to replace variables
 * @returns {Object} Parsed configuration with replaced variables
 */
const parseRequestConfiguration = (config = {}, securityProperties) => {
    return Object.fromEntries(
        Object.entries(config)
            .map((entry) => {
                const [name, value] = entry;
                if (typeof value === 'string' && value.includes('${')) {
                    try {
                        // Use lodash template for variable substitution
                        const compiled = template(value);
                        const result = compiled(securityProperties);
                        return [name, result];
                    } catch (error) {
                        console.warn(`Template parsing error for ${name}:`, error);
                        return entry; // Return original if template fails
                    }
                }
                return entry;
            })
            .filter(entry => entry)
    );
};

/**
 * Legacy compatibility: Converts old authenticationRules to new format
 * @param {Array} authRules - Old authentication rules
 * @returns {Array} New request configuration rules
 */
export const convertAuthenticationRulesToRequestConfiguration = (authRules = []) => {
    return authRules.map(rule => {
        const newRule = {
            urlPattern: rule.urlPattern
        };

        switch (rule.method) {
        case 'bearer':
            newRule.headers = {
                'Authorization': 'Bearer ${securityToken}'
            };
            break;
        case 'authkey':
            newRule.params = {
                [rule.authkeyParamName || 'authkey']: '${securityToken}'
            };
            break;
        case 'basic':
            newRule.headers = {
                'Authorization': '${authHeader}'
            };
            break;
        case 'header':
            newRule.headers = rule.headers || {};
            break;
        case 'browserWithCredentials':
            newRule.withCredentials = true;
            break;
        default:
            // Unknown method, skip this rule
            return null;
        }

        return newRule;
    }).filter(rule => rule !== null);
};

/**
 * Gets all request configuration rules from Redux state or config
 * Automatically converts authenticationRules to new format if requestsConfigurationRules is missing
 * @returns {Array} Array of request configuration rules
 */
export const getRequestConfigurationRules = () => {
    // First try to get from Redux state (if available)
    const stateRules = get(getState(), 'security.rules', []);
    if (!isEmpty(stateRules)) {
        return stateRules;
    }

    // Try to get new format from config
    const configRules = ConfigUtils.getConfigProp('requestsConfigurationRules');
    if (!isEmpty(configRules)) {
        return configRules;
    }

    // If new format is missing, convert old authenticationRules format
    const authRules = ConfigUtils.getConfigProp('authenticationRules');
    if (!isEmpty(authRules)) {
        return convertAuthenticationRulesToRequestConfiguration(authRules);
    }

    // No rules found
    return [];
};

/**
 * Gets the request configuration rule that matches the provided URL
 * @param {string} url - The URL to match against rules
 * @returns {Object|null} Matching rule or null
 */
export const getRequestConfigurationRule = (url) => {
    const rules = getRequestConfigurationRules();
    return head(rules.filter(
        rule => rule && rule.urlPattern && url.match(new RegExp(rule.urlPattern, "i"))
    ));
};

/**
 * Checks if request configuration is activated
 * Returns true only when user is authenticated and rules are present
 * @returns {boolean} True if request configuration is activated
 */
export const isRequestConfigurationActivated = () => {
    // Check if user is authenticated (has a token)
    const token = getToken();
    if (!token) {
        return false; // Not authenticated
    }

    // Check if redux state exist
    const state = getState();
    if (!isEmpty(state?.security?.rules)) {
        return true;
    }

    const newRules = ConfigUtils.getConfigProp('requestsConfigurationRules');
    if (!isEmpty(newRules)) {
        return true;
    }

    // Legacy support
    const useLegacyRules = ConfigUtils.getConfigProp('useAuthenticationRules');
    const oldRules = ConfigUtils.getConfigProp('authenticationRules');
    if (isNil(useLegacyRules)) {
        return !isEmpty(oldRules);
    }
    return useLegacyRules;
};

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
 * Gets request configuration (headers and params) for a given URL
 * This is the main function that centralizes all request configuration logic
 * @param {string} url - The URL to get configuration for
 * @param {string} securityToken - Optional security token override
 * @param {string} [sourceId] - Optional source ID for sessionStorage-based credentials
 * @returns {Object} Object containing headers and/or params
 */
export const  getRequestConfigurationByUrl = (url, securityToken, sourceId) => {
    if (!url || !isRequestConfigurationActivated()) {
        if (!isNil(sourceId)) {
            return { headers: getAuthorizationBasic(sourceId) };
        }
        return {};
    }

    const rule = getRequestConfigurationRule(url);
    if (!rule) return {};

    const token = !isNil(securityToken) ? securityToken : getToken();
    let authHeader = getBasicAuthHeader();

    // Fallback to sessionStorage credentials sourceId and credentials is stored
    let basicAuthHeader;
    if (sourceId) {
        basicAuthHeader = getAuthorizationBasic(sourceId);
        authHeader = basicAuthHeader?.Authorization;
    }

    const securityProperties = {
        ...(!isNil(token) && { securityToken: token }),
        ...(!isNil(authHeader) && { authHeader })
    };

    const parsedHeaders = parseRequestConfiguration(rule.headers, securityProperties);
    const parsedParams = parseRequestConfiguration(rule.params, securityProperties);

    let finalHeaders;
    if (!isEmpty(parsedHeaders)) {
        finalHeaders = parsedHeaders;
    } else if (sourceId && !isEmpty(basicAuthHeader)) {
        finalHeaders = basicAuthHeader;
    }

    return {
        ...(!isEmpty(finalHeaders) && { headers: finalHeaders }),
        ...(!isEmpty(parsedParams) && { params: parsedParams })
    };
};

export function getAuthKeyParameter(url) {
    // Use the new request configuration system
    const rule = getRequestConfigurationRule(url);
    if (rule && rule.params) {
        // Find the parameter that contains the securityToken placeholder
        const authKeyParam = Object.keys(rule.params).find(key =>
            rule.params[key] && (rule.params[key].includes('${securityToken}'))
        );
        if (authKeyParam) {
            return authKeyParam;
        }
    }
    return 'authkey';
}

export function getAuthenticationHeaders(url, securityToken, security) {
    const requestConfig = getRequestConfigurationByUrl(url, securityToken, security?.sourceId);
    if (!isEmpty(requestConfig.headers)) {
        return requestConfig.headers;
    }
    return null;
}

/**
 * This method will add query parameter based authentications to an object
 * containing query parameters.
 */
export function addAuthenticationParameter(url, parameters, securityToken, sourceId) {
    const requestConfig = getRequestConfigurationByUrl(url, securityToken, sourceId);
    if (!isEmpty(requestConfig.params)) {
        return {...parameters, ...requestConfig.params};
    }
    return parameters;
}

/**
 * This method will add query parameter based authentications to an url.
 */
export function addAuthenticationToUrl(url) {
    if (!url || !isRequestConfigurationActivated()) {
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
    addAuthenticationToUrl,
    addAuthenticationParameter,
    clearNilValuesForParams,
    addAuthenticationToSLD,
    getAuthKeyParameter,
    cleanAuthParamsFromURL,
    getAuthenticationHeaders,
    getRequestConfigurationByUrl,
    getRequestConfigurationRules,
    getRequestConfigurationRule,
    isRequestConfigurationActivated,
    convertAuthenticationRulesToRequestConfiguration,
    USER_GROUP_ALL
};

export default SecurityUtils;
