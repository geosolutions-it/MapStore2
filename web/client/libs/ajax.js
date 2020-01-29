/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const axios = require('axios');
const combineURLs = require('axios/lib/helpers/combineURLs');
const url = require('url');
const ConfigUtils = require('../utils/ConfigUtils');
const SecurityUtils = require('../utils/SecurityUtils');

const assign = require('object-assign');
const {isObject, omitBy, isNil} = require('lodash');
const urlUtil = require('url');

/**
 * Internal helper that adds an extra paramater to an axios configuration.
 */
function addParameterToAxiosConfig(axiosConfig, parameterName, parameterValue) {
    // FIXME: the parameters can also be a URLSearchParams
    axiosConfig.params = assign({}, axiosConfig.params, {[parameterName]: parameterValue});
    // remove from URL auth parameters if any, to avoid possible duplication
    axiosConfig.url = axiosConfig.url ? ConfigUtils.getUrlWithoutParameters(axiosConfig.url, [parameterName]) : axiosConfig.url;
}

/**
 * Internal helper that adds or overrides an http header in a axios configuration.
 */
function addHeaderToAxiosConfig(axiosConfig, headerName, headerValue) {
    axiosConfig.headers = assign({}, axiosConfig.headers, {[headerName]: headerValue});
}

const corsDisabled = [];

/**
 * Internal helper that will add to the axios config object the correct
 * authentication method based on the request URL.
 */
function addAuthenticationToAxios(axiosConfig) {
    if (!axiosConfig || !axiosConfig.url || !SecurityUtils.isAuthenticationActivated()) {
        return axiosConfig;
    }
    const axiosUrl = combineURLs(axiosConfig.baseURL || '', axiosConfig.url);
    const rule = SecurityUtils.getAuthenticationRule(axiosUrl);

    switch (rule && rule.method) {
    case 'browserWithCredentials':
    {
        axiosConfig.withCredentials = true;
        return axiosConfig;
    }
    case 'authkey':
    {
        const token = SecurityUtils.getToken();
        if (!token) {
            return axiosConfig;
        }
        addParameterToAxiosConfig(axiosConfig, rule.authkeyParamName || 'authkey', token);
        return axiosConfig;
    }
    case 'test': {
        const token = rule ? rule.token : "";
        if (!token) {
            return axiosConfig;
        }
        addParameterToAxiosConfig(axiosConfig, rule.authkeyParamName || 'authkey', token);
        return axiosConfig;
    }
    case 'basic':
        const basicAuthHeader = SecurityUtils.getBasicAuthHeader();
        if (!basicAuthHeader) {
            return axiosConfig;
        }
        addHeaderToAxiosConfig(axiosConfig, 'Authorization', basicAuthHeader);
        return axiosConfig;
    case 'bearer':
    {
        const token = SecurityUtils.getToken();
        if (!token) {
            return axiosConfig;
        }
        addHeaderToAxiosConfig(axiosConfig, 'Authorization', "Bearer " + token);
        return axiosConfig;
    }
    default:
        // we cannot handle the required authentication method
        return axiosConfig;
    }
}

axios.interceptors.request.use(config => {
    var uri = config.url || '';
    var sameOrigin = !(uri.indexOf("http") === 0);
    var urlParts = !sameOrigin && uri.match(/([^:]*:)\/\/([^:]*:?[^@]*@)?([^:\/\?]*):?([^\/\?]*)/);
    addAuthenticationToAxios(config);
    if (urlParts) {
        let location = window.location;
        sameOrigin =
            urlParts[1] === location.protocol &&
            urlParts[3] === location.hostname;
        let uPort = urlParts[4];
        let lPort = location.port;
        let defaultPort = location.protocol.indexOf("https") === 0 ? 443 : 80;
        uPort = uPort === "" ? defaultPort + "" : uPort + "";
        lPort = lPort === "" ? defaultPort + "" : lPort + "";
        sameOrigin = sameOrigin && uPort === lPort;
    }
    if (!sameOrigin) {
        let proxyUrl = ConfigUtils.getProxyUrl(config);
        if (proxyUrl) {
            let useCORS = [];
            let autoDetectCORS = false;
            if (isObject(proxyUrl)) {
                useCORS = proxyUrl.useCORS || [];
                autoDetectCORS = proxyUrl.autoDetectCORS || false;
                proxyUrl = proxyUrl.url;
            }
            const isCORS = useCORS.reduce((found, current) => found || uri.indexOf(current) === 0, false);
            const cannotUseCORS = corsDisabled.reduce((found, current) => found || uri.indexOf(current) === 0, false);
            if (!isCORS && (!autoDetectCORS || cannotUseCORS)) {
                const parsedUri = urlUtil.parse(uri, true, true);
                const params = omitBy(config.params, isNil);
                config.url = proxyUrl + encodeURIComponent(
                    urlUtil.format(
                        assign({}, parsedUri, {
                            search: null,
                            query: assign({}, parsedUri.query, params)
                        })
                    )
                );
                config.params = undefined;
            } else if (autoDetectCORS) {
                config.autoDetectCORS = true;
            }
        }
    }
    return config;
});

axios.interceptors.response.use(response => response, (error) => {
    if (error.config && error.config.autoDetectCORS) {
        const urlParts = url.parse(error.config.url);
        const baseUrl = urlParts.protocol + "//" + urlParts.host + urlParts.pathname;
        if (corsDisabled.indexOf(baseUrl) === -1) {
            corsDisabled.push(baseUrl);
            return new Promise((resolve, reject) => {
                axios({ ...error.config, autoDetectCORS: false}).then(resolve).catch(reject);
            });
        }
    }
    return Promise.reject(error.response ? {...error.response, originalError: error} : error);
});

module.exports = axios;
