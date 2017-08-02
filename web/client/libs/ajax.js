/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const axios = require('axios');
const ConfigUtils = require('../utils/ConfigUtils');

const SecurityUtils = require('../utils/SecurityUtils');
const assign = require('object-assign');
const {isObject} = require('lodash');
const urlUtil = require('url');

/**
 * Internal helper that adds an extra paramater to an axios configuration.
 */
function addParameterToAxiosConfig(axiosConfig, parameterName, parameterValue) {
    // FIXME: the parameters can also be a URLSearchParams
    axiosConfig.params = assign({}, axiosConfig.params, {[parameterName]: parameterValue});
}

/**
 * Internal helper that adds or overrides an http header in a axios configuration.
 */
function addHeaderToAxiosConfig(axiosConfig, headerName, headerValue) {
    axiosConfig.headers = assign({}, axiosConfig.headers, {[headerName]: headerValue});
}

/**
 * Internal helper that will add to the axios config object the correct
 * authentication method based on the request URL.
 */
function addAuthenticationToAxios(axiosConfig) {
    if (!axiosConfig || !axiosConfig.url || !SecurityUtils.isAuthenticationActivated()) {
        return axiosConfig;
    }
    const rule = SecurityUtils.getAuthenticationRule(axiosConfig.url);

    switch (rule && rule.method) {
        case 'authkey':
        {
            const token = SecurityUtils.getToken();
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
            if (isObject(proxyUrl)) {
                useCORS = proxyUrl.useCORS || [];
                proxyUrl = proxyUrl.url;
            }
            const isCORS = useCORS.reduce((found, current) => found || uri.indexOf(current) === 0, false);
            if (!isCORS) {
                const parsedUri = urlUtil.parse(uri, true, true);
                config.url = proxyUrl + encodeURIComponent(
                    urlUtil.format(
                        assign({}, parsedUri, {
                            search: null,
                            query: assign({}, parsedUri.query, config.params )
                        })
                    )
                );
                config.params = undefined;
            }
        }
    }
    return config;
});

module.exports = axios;
