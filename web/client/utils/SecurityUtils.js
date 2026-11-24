/**
import { keys } from 'lodash';
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import axios from '../libs/ajax';

import ConfigUtils from "./ConfigUtils";
import URL from "url";
import head from "lodash/head";
import isNil from "lodash/isNil";
import isArray from "lodash/isArray";
import isEmpty from "lodash/isEmpty";
import isString from "lodash/isString";
import template from "lodash/template";
import get from "lodash/get";
import castArray from "lodash/castArray";

import {setStore as stateSetStore, getState} from "./StateUtils";
import { parseUrl, WMS_GET_CAPABILITIES_VERSION } from '../api/WMS';
import { getMonitoredState, handleExpression } from './PluginsUtils';

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
 * Validates WMS service credentials using a GetCapabilities request.
 * @param {string} url - The WMS service URL.
 * @param {Object} credentials - Credentials object.
 * @param {string} credentials.username - Username for Basic Auth.
 * @param {string} credentials.password - Password for Basic Auth.
 * @returns {Promise<{valid: boolean, reason?: string}>}
 *   - `{valid: true}` if credentials work (200 response)
 *   - `{valid: false, reason: '...'}` if not. Reasons:
 *     `'invalid_credentials'` | `'forbidden'` | `'server_error'` |
 *     `'timeout'` | `'cors_blocked'` | `'network_error'` | `'unknown'`
 */
export async function validateServiceCredentials(url, credentials) {
    try {
        const credentialsEncoded = btoa(credentials.username + ":" + credentials.password);

        const response = await axios.get(parseUrl(url, {
            service: "WMS",
            version: WMS_GET_CAPABILITIES_VERSION,
            request: "GetCapabilities"
        }), {
            headers: {
                Authorization: `Basic ${credentialsEncoded}`,
                'Accept': 'application/xml, text/xml, */*'
            },
            timeout: 10000,
            validateStatus: (status) => status < 500,
            withCredentials: false
        });

        if (response.status === 200) return { valid: true };
        if (response.status === 401) return { valid: false, reason: 'invalid_credentials' };
        if (response.status === 403) return { valid: false, reason: 'forbidden' };

        return { valid: false, reason: 'server_error'};

    } catch (error) {
        if (!error.response) {
            if (error.code === 'ECONNABORTED') {
                return { valid: false, reason: 'timeout' };
            }
            if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
                // This is likely CORS blocking
                return { valid: false, reason: 'cors_blocked' };
            }
            return { valid: false, reason: 'network_error' };
        }

        // If we have a response but didn't catch it above
        if (error.response.status === 401) {
            return { valid: false, reason: 'invalid_credentials' };
        }

        return { valid: false, reason: 'unknown'};
    }
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
                        let result = compiled(securityProperties);
                        result = result === "" ? undefined : result;
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
                'Authorization': 'Basic ${securityToken}'
            };
            break;
        case 'test':
            newRule.params = {
                [rule.authkeyParamName || 'authkey']: rule.token ?? ""
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
 * Filters out the request configuration rules whose `enabled` property resolves to a falsy value.
 * `enabled` can be a plain boolean or a plugin expression string (e.g. `"{includes(state('usergroups'), 'editor')}"`),
 * evaluated with the same syntax used for `cfg.disablePluginIf` (see `PluginsUtils.handleExpression`).
 * Rules without an `enabled` property are always applied.
 * The monitored state is resolved only when at least one rule needs it, because building it requires
 * serializing every monitored entry.
 * @param {object[]} rules the request configuration rules
 * @returns {object[]} the enabled rules
 */
const filterEnabledRules = (rules = []) => {
    const needsMonitoredState = rules.some(rule => isString(rule?.enabled));
    const monitoredState = needsMonitoredState ? getMonitoredState(getState(), ConfigUtils.getConfigProp('monitorState')) : {};
    const getMonitored = (path) => get(monitoredState, path);
    return rules.filter(rule => !!handleExpression(getMonitored, undefined, rule?.enabled ?? true));
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
        return filterEnabledRules(stateRules);
    }

    // Try to get new format from config
    const configRules = ConfigUtils.getConfigProp('requestsConfigurationRules');
    if (!isEmpty(configRules)) {
        return filterEnabledRules(configRules);
    }

    // If new format is missing, convert old authenticationRules format
    const authRules = ConfigUtils.getConfigProp('authenticationRules');
    if (!isEmpty(authRules)) {
        return filterEnabledRules(convertAuthenticationRulesToRequestConfiguration(authRules));
    }

    // No rules found
    return [];
};

/**
 * Gets the request configuration rule that matches the provided URL
 * @param {string|string[]} url - The URL to match against rules
 * @returns {Object|null} Matching rule or null
 */
const URL_TEMPLATE_PLACEHOLDER = /\{[^}]*\}/g;
const URL_TEMPLATE_MARKER = /msplaceholder(\d+)/g;

/**
 * Resolves a request URL against the page.
 * Template placeholders such as {s} are not valid in a host name,
 * so they are resolved as markers and restored in the returned parts.
 * @param {string} url URL of the request, relative or absolute
 * @returns {object} origin, pathname and search of the URL, and if it is on the application origin
 */
const resolveRequestUrl = (url) => {
    const placeholders = url.match(URL_TEMPLATE_PLACEHOLDER) ?? [];
    let count = 0;
    try {
        const resolved = new window.URL(url.replace(URL_TEMPLATE_PLACEHOLDER, () => `msplaceholder${count++}`), document.baseURI);
        const restore = (text) => text.replace(URL_TEMPLATE_MARKER, (marker, index) => placeholders[index] ?? marker);
        return {
            origin: restore(resolved.origin),
            pathname: restore(resolved.pathname),
            search: restore(resolved.search),
            isApplicationOrigin: resolved.origin === window.location.origin
        };
    } catch (e) {
        return null;
    }
};

const PLACEHOLDER_HOST_PART = 'invalid';
const PLACEHOLDER_ORIGIN = `https://domain.${PLACEHOLDER_HOST_PART}`;
const ORIGIN_PARTS = /^(.*:\/\/)(.*?)(:\d+)?$/;

/**
 * Gets the origins a pattern is compared with, to know if it names the host of an origin:
 * a placeholder domain, and the origin with only one part of its host name kept,
 * once for each part (`gs.example.com` gives `gs.invalid.invalid`, `invalid.example.invalid` and `invalid.invalid.com`).
 * A host name of one part, such as `localhost`, is compared with the placeholder domain only.
 * @param {string} origin origin of the request URL
 * @returns {string[]} the origins to compare
 */
const getComparisonOrigins = (origin) => {
    const [, scheme, host, port = ''] = origin.match(ORIGIN_PARTS) ?? [];
    const hostParts = host?.split('.') ?? [];
    const singlePartOrigins = hostParts.length > 1
        ? hostParts.map((kept, keptIndex) =>
            scheme + hostParts.map((part, index) => index === keptIndex ? kept : PLACEHOLDER_HOST_PART).join('.') + port)
        : [];
    return [PLACEHOLDER_ORIGIN, ...singlePartOrigins];
};

/**
 * Checks if a pattern matches a URL because it names the host of the URL.
 * The pattern is tested, free and anchored at the start, on the service address and on the full URL,
 * then again on the comparison origins: the pattern names the host when none of them matches,
 * that is when the match needs at least two parts of the host name.
 * @param {string} urlPattern pattern of the rule
 * @param {object} url resolved parts of the request URL
 * @returns {boolean} true when the pattern names the host of the URL
 */
const matchesOrigin = (urlPattern, url) => {
    const patterns = [new RegExp(urlPattern, "i"), new RegExp(`^(?:${urlPattern})`, "i")];
    const targets = [url.pathname, url.pathname + url.search];
    const comparisonOrigins = getComparisonOrigins(url.origin);
    return patterns.some(pattern => targets.some(target =>
        pattern.test(url.origin + target) && !comparisonOrigins.some(origin => pattern.test(origin + target))));
};

/**
 * Checks if a request configuration rule applies to a URL.
 * For the application origin, the pattern is tested on the URL and on its path,
 * so a path pattern applies to relative and absolute URLs of the application.
 * For another origin, the rule applies only when the pattern matches because of that origin,
 * that is when the pattern names the host of the service.
 * @param {object} rule request configuration rule
 * @param {string} url URL of the request, relative or absolute
 * @returns {boolean} true when the rule applies to the URL
 */
const isRuleMatchingUrl = (rule, url) => {
    const resolved = resolveRequestUrl(url);
    if (!resolved) {
        return false;
    }
    const pattern = new RegExp(rule.urlPattern, "i");
    if (resolved.isApplicationOrigin) {
        return pattern.test(url) || pattern.test(resolved.pathname + resolved.search);
    }
    return pattern.test(url) && matchesOrigin(rule.urlPattern, resolved);
};

const getServletPath = (pathname) => pathname.replace(/;[^/]*/g, '').replace(/\/+/g, '/').replace(/\/$/, '');

/**
 * Gets the URL that a request asks to the application proxy.
 * @param {string} url URL of the request, relative or absolute
 * @returns {string} the URL passed to the proxy, or null when the request is not for the proxy
 */
const getProxyRequestTarget = (url) => {
    const proxyUrl = ConfigUtils.getProxyUrl();
    const proxy = isString(proxyUrl) ? proxyUrl : proxyUrl?.url;
    if (!proxy) {
        return null;
    }
    try {
        const proxyLocation = new window.URL(proxy, document.baseURI);
        const requestLocation = new window.URL(url, document.baseURI);
        const proxyPath = getServletPath(proxyLocation.pathname);
        const requestPath = getServletPath(requestLocation.pathname);
        if (requestLocation.origin !== proxyLocation.origin || !(requestPath === proxyPath || requestPath.startsWith(`${proxyPath}/`))) {
            return null;
        }
        const parameter = [...proxyLocation.searchParams.keys()].pop();
        return requestLocation.searchParams.get(parameter) ?? '';
    } catch (e) {
        return null;
    }
};

/**
 * Checks if a request configuration rule applies to a request.
 * A request to the application proxy uses the rules of the URL it asks to the proxy,
 * so a service gets the same rules when it is requested directly or through the proxy.
 * @param {object} rule request configuration rule
 * @param {string} url URL of the request, relative or absolute
 * @returns {boolean} true when the rule applies to the request
 */
export const isRequestConfigurationRuleMatching = (rule, url) => {
    if (!rule?.urlPattern || !isString(url)) {
        return false;
    }
    const proxyTarget = getProxyRequestTarget(url);
    if (proxyTarget === null) {
        return isRuleMatchingUrl(rule, url);
    }
    // the proxy is asked for one service: a target that is the proxy again has no rules
    return getProxyRequestTarget(proxyTarget) === null && isRuleMatchingUrl(rule, proxyTarget);
};

const findRequestConfigurationRule = (rules, url) =>
    head(rules.filter(rule => isRequestConfigurationRuleMatching(rule, url)));

/**
 * Gets the request configuration rule that applies to a URL.
 * The first rule that matches, in configuration order, is returned.
 * A layer with several URLs (for example tile servers) shares one request configuration,
 * so all of its URLs must match the same rule.
 * @param {string|string[]} url URL of the request, or all the URLs of a layer. With several URLs, the rule is returned only when every URL matches the same rule.
 * @returns {object} the matching rule, or undefined when no rule applies
 */
export const getRequestConfigurationRule = (url) => {
    const rules = getRequestConfigurationRules();
    const [rule, ...otherRules] = castArray(url ?? []).map(current => findRequestConfigurationRule(rules, current ?? ""));
    // a layer with several URLs shares one request configuration across all of them
    return otherRules.every(otherRule => otherRule === rule) ? rule : undefined;
};

/**
 * Gets the authentication method for a given URL based on request configuration rules.
 * Infers the method type from the rule structure for backward compatibility.
 * @param {string|string[]} url URL of the request, or all the URLs of a layer. With several URLs, the rule is returned only when every URL matches the same rule.
 * @returns {string} The inferred authentication method.
 */
export function getAuthenticationMethod(url) {
    const rule = getRequestConfigurationRule(url);
    if (!rule) return null;

    if (rule.params && Object.keys(rule.params).length > 0) {
        const hasTokenParam = Object.values(rule.params)
            .some(val => typeof val === 'string' && val.includes('${securityToken}'));
        if (hasTokenParam) return 'authkey';
    }

    if (rule.headers) {
        const authHeader = rule.headers.Authorization || rule.headers.authorization;
        if (typeof authHeader === 'string') {
            if (authHeader.includes('Bearer')) return 'bearer';
            if (authHeader.includes('Basic')) return 'basic';
        }
    }

    return null;
}

/**
 * Checks if request configuration is activated
 * Returns true only when user is authenticated and rules are present
 * @returns {boolean} True if request configuration is activated
 */
export const isRequestConfigurationActivated = () => {
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
// herer
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
 * Filter out headers/params that still contain unresolved template variables
 * @param {object} obj - The object to filter
 * @returns {object} The filtered object
 */
const filterUnresolvedTemplates = (obj) => {
    if (typeof obj !== 'object' || !obj) return obj;
    return Object.fromEntries(
        Object.entries(obj).filter(([, v]) => !String(v).includes('${securityToken}'))
    );
};

const basicAuthorizationHeader = (sourceId) => {
    return !isNil(sourceId) ? { headers: getAuthorizationBasic(sourceId) } : {};
};

/**
 * Gets request configuration (headers and params) for a given URL
 * This is the main function that centralizes all request configuration logic
 * @param {string|string[]} url URL of the request, or all the URLs of a layer. With several URLs, the rule is returned only when every URL matches the same rule.
 * @param {string} securityToken - Optional security token override
 * @param {string} [sourceId] - Optional source ID for sessionStorage-based credentials
 * @returns {Object} Object containing headers and/or params
 */
export const getRequestConfigurationByUrl = (url, securityToken, sourceId) => {
    if (!url || !isRequestConfigurationActivated()) {
        return basicAuthorizationHeader(sourceId);
    }

    const rule = getRequestConfigurationRule(url);
    if (!rule) return basicAuthorizationHeader(sourceId);

    const token = securityToken ?? getToken();
    const basicAuth = sourceId ? getAuthorizationBasic(sourceId) : null;
    const authHeader = basicAuth?.Authorization ?? getBasicAuthHeader();

    const securityProps = {
        ...(!isNil(token) && { securityToken: token }),
        ...(!isNil(authHeader) && { authHeader: authHeader })
    };

    const parsedHeaders = filterUnresolvedTemplates(
        parseRequestConfiguration(rule.headers, securityProps)
    );
    const params = filterUnresolvedTemplates(
        parseRequestConfiguration(rule.params, securityProps)
    );
    const headers = !isEmpty(parsedHeaders)
        ? parsedHeaders : (!isEmpty(basicAuth) && sourceId ? basicAuth : undefined);

    return {
        ...(!isEmpty(headers) && { headers: headers }),
        ...(!isEmpty(params) && { params: params })
    };
};

/**
 * Checks if a URL gets headers or parameters from the request configuration.
 * @param {string|string[]} url URL of the request, or all the URLs of a layer. With several URLs, the rule is returned only when every URL matches the same rule.
 * @param {string} [securityToken] optional security token override
 * @param {string} [sourceId] optional source ID for sessionStorage-based credentials
 * @returns {boolean} true when headers or parameters apply
 */
export const hasRequestConfigurationByUrl = (url, securityToken, sourceId) => {
    const { headers, params } = getRequestConfigurationByUrl(url, securityToken, sourceId);
    return !!(headers || params);
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

/**
 * Gets the authentication headers for a URL from the request configuration.
 * @param {string|string[]} url URL of the request, or all the URLs of a layer. With several URLs, the rule is returned only when every URL matches the same rule.
 * @param {string} [securityToken] optional security token override
 * @param {object} [security] layer security options, with the optional `sourceId` of stored credentials
 * @returns {object} the headers, or null when no headers apply
 */
export function getAuthenticationHeaders(url, securityToken, security) {
    const requestConfig = getRequestConfigurationByUrl(url, securityToken, security?.sourceId);
    if (!isEmpty(requestConfig.headers)) {
        return requestConfig.headers;
    }
    return null;
}

export function clearNilValuesForParams(params = {}) {
    return Object.keys(params).reduce((pre, cur) => {
        const value = params[cur];
        return !isNil(value) ? {...pre, [cur]: value} : pre;
    }, {});
}

/**
 * This method will add query parameter based authentications to an object
 * containing query parameters.
 * @param {string|string[]} url URL of the request, or all the URLs of a layer. With several URLs, the rule is returned only when every URL matches the same rule.
 * @param {object} parameters query parameters to extend
 * @param {string} [securityToken] optional security token override
 * @param {string} [sourceId] optional source ID for sessionStorage-based credentials
 * @returns {object} the query parameters with the authentication parameters added
 */
export function addAuthenticationParameter(url, parameters, securityToken, sourceId) {
    let params = {...(parameters ?? {})};
    const requestConfig = getRequestConfigurationByUrl(url, securityToken, sourceId);
    if (!isEmpty(requestConfig.params)) {
        params = {...params, ...requestConfig.params};
    }
    return clearNilValuesForParams(params);
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
    isRequestConfigurationRuleMatching,
    getAuthenticationMethod,
    isRequestConfigurationActivated,
    convertAuthenticationRulesToRequestConfiguration,
    USER_GROUP_ALL,
    validateServiceCredentials
};

export default SecurityUtils;
