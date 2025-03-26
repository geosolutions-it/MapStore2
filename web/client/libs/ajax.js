/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from 'axios';
import combineURLs from 'axios/lib/helpers/combineURLs';
import ConfigUtils from '../utils/ConfigUtils';
import {
    isAuthenticationActivated,
    getAuthenticationRule,
    getToken,
    getBasicAuthHeader
} from '../utils/SecurityUtils';

import assign from 'object-assign';
import isObject from 'lodash/isObject';
import omitBy from 'lodash/omitBy';
import isNil from 'lodash/isNil';
import urlUtil from 'url';
import { getProxyCacheByUrl, setProxyCacheByUrl } from '../utils/ProxyUtils';

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

/**
 * Internal helper that will add to the axios config object the correct
 * authentication method based on the request URL.
 */
function addAuthenticationToAxios(axiosConfig) {
    if (!axiosConfig || !axiosConfig.url || !isAuthenticationActivated()) {
        return axiosConfig;
    }
    const axiosUrl = combineURLs(axiosConfig.baseURL || '', axiosConfig.url);
    const rule = getAuthenticationRule(axiosUrl);

    switch (rule && rule.method) {
    case 'browserWithCredentials':
    {
        axiosConfig.withCredentials = true;
        return axiosConfig;
    }
    case 'authkey':
    {
        const token = getToken();
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
        const basicAuthHeader = getBasicAuthHeader();
        if (!basicAuthHeader) {
            return axiosConfig;
        }
        addHeaderToAxiosConfig(axiosConfig, 'Authorization', basicAuthHeader);
        return axiosConfig;
    case 'bearer':
    {
        const token = getToken();
        if (!token) {
            return axiosConfig;
        }
        addHeaderToAxiosConfig(axiosConfig, 'Authorization', "Bearer " + token);
        return axiosConfig;
    }
    case 'header': {
        Object.entries(rule.headers).map(([headerName, headerValue]) => addHeaderToAxiosConfig(axiosConfig, headerName, headerValue));
        return axiosConfig;
    }
    default:
        // we cannot handle the required authentication method
        return axiosConfig;
    }
}

const checkSameOrigin = (uri) => {
    var sameOrigin = !(uri.indexOf("http") === 0);
    var urlParts = !sameOrigin && uri.match(/([^:]*:)\/\/([^:]*:?[^@]*@)?([^:\/\?]*):?([^\/\?]*)/);
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
    return sameOrigin;
};

axios.interceptors.request.use(config => {
    addAuthenticationToAxios(config);
    const uri = config.url || '';
    const sameOrigin = checkSameOrigin(uri);
    if (!sameOrigin) {
        let proxyUrl = ConfigUtils.getProxyUrl(config);
        if (proxyUrl) {
            let useCORS = [];
            if (isObject(proxyUrl)) {
                useCORS = proxyUrl.useCORS || [];
                proxyUrl = proxyUrl.url;
            }
            const isCORS = useCORS.some((current) => uri.indexOf(current) === 0);
            const proxyNeeded = getProxyCacheByUrl(uri);
            if (!isCORS && proxyNeeded) {
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
            }
            if (isCORS && proxyNeeded === undefined) {
                setProxyCacheByUrl(uri, false);
            }
        }
    }
    return config;
});

axios.interceptors.response.use(response => response, (error) => {
    let proxyUrl = ConfigUtils.getProxyUrl();
    const sameOrigin = checkSameOrigin(error.config.url || '');
    const errorResponseFunc = () => Promise.reject(error.response ? {...error.response, originalError: error} : error);
    if (error.config && !error.config.url.includes(proxyUrl.url) && !sameOrigin) {
        if (getProxyCacheByUrl(error.config.url) === undefined && typeof error.response === 'undefined') {
            setProxyCacheByUrl(error.config.url, true);
            // noProxy is a custom configuration
            // to avoid the retry call
            if (error.config.noProxy) {
                return errorResponseFunc();
            }
            return new Promise((resolve, reject) => {
                axios({ ...error.config }).then(resolve).catch(reject);
            });
        }
    }
    return errorResponseFunc();
});

export default axios;
