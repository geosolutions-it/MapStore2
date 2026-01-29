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
    getAuthenticationMethod,
    getAuthorizationBasic,
    getRequestConfigurationByUrl,
    getRequestConfigurationRule,
    getToken,
    isRequestConfigurationActivated
} from '../utils/SecurityUtils';

import isObject from 'lodash/isObject';
import omitBy from 'lodash/omitBy';
import isNil from 'lodash/isNil';
import urlUtil from 'url';
import { getProxyCacheByUrl, setProxyCacheByUrl } from '../utils/ProxyUtils';
import { isEmpty } from 'lodash';

/**
 * Internal helper that adds an extra paramater to an axios configuration.
 */
function addParameterToAxiosConfig(axiosConfig, parameterName, parameterValue) {
    // FIXME: the parameters can also be a URLSearchParams
    axiosConfig.params = Object.assign({}, axiosConfig.params, {[parameterName]: parameterValue});
    // remove from URL auth parameters if any, to avoid possible duplication
    axiosConfig.url = axiosConfig.url ? ConfigUtils.getUrlWithoutParameters(axiosConfig.url, [parameterName]) : axiosConfig.url;
}

/**
 * Internal helper that adds or overrides an http header in a axios configuration.
 */
function addHeaderToAxiosConfig(axiosConfig, headerName, headerValue) {
    axiosConfig.headers = Object.assign({}, axiosConfig.headers, {[headerName]: headerValue});
}

/**
 * Internal helper that will add to the axios config object the correct
 * authentication method based on the request URL.
 */
function addAuthenticationToAxios(axiosConfig) {
    if (!axiosConfig || !axiosConfig.url) {
        return axiosConfig;
    }
    const axiosUrl = combineURLs(axiosConfig.baseURL || '', axiosConfig.url);

    // Extract custom sourceId from axios config if provided
    const sourceId = axiosConfig._msAuthSourceId;

    const method = getAuthenticationMethod(axiosUrl);
    if (method === "bearer" && !getToken()) return axiosConfig;
    if (method === "authkey" && !getToken()) return axiosConfig;
    if (method === "basic" && sourceId && isEmpty(getAuthorizationBasic(sourceId))) return axiosConfig;

    // If request configuration is not activated but sourceId is provided, still need to handle basic auth
    const { headers, params } = getRequestConfigurationByUrl(axiosUrl, undefined, sourceId);

    if (headers) {
        Object.entries(headers).forEach(([headerName, headerValue]) => {
            addHeaderToAxiosConfig(axiosConfig, headerName, headerValue);
        });
    }
    if (params) {
        Object.entries(params).forEach(([paramName, paramValue]) => {
            addParameterToAxiosConfig(axiosConfig, paramName, paramValue);
        });
    }

    // Check for withCredentials
    if (isRequestConfigurationActivated()) {
        const rule = getRequestConfigurationRule(axiosUrl);
        if (rule?.withCredentials) {
            axiosConfig.withCredentials = true;
        }
    }

    // Remove the custom prop from config to avoid it being sent as a regular param
    delete axiosConfig._msAuthSourceId;

    return axiosConfig;
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
            let autoDetectCORS = true;
            if (isObject(proxyUrl)) {
                useCORS = proxyUrl.useCORS || [];
                autoDetectCORS = proxyUrl.autoDetectCORS ?? true;
                proxyUrl = proxyUrl.url;
            }
            const isCORS = useCORS.some((current) => uri.indexOf(current) === 0);
            const proxyNeeded = getProxyCacheByUrl(uri) ||  !autoDetectCORS;
            if (!isCORS && proxyNeeded) {
                const parsedUri = urlUtil.parse(uri, true, true);
                const params = omitBy(config.params, isNil);
                config.url = proxyUrl + encodeURIComponent(
                    urlUtil.format(
                        Object.assign({}, parsedUri, {
                            search: null,
                            query: Object.assign({}, parsedUri.query, params)
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
    const sameOrigin = checkSameOrigin(error?.config?.url || '');
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
