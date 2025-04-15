/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import url from 'url';

import ConfigUtils from './ConfigUtils';

import { isArray, isObject } from 'lodash';

let proxyCache = {};

const getBaseUrl = (uri) => {
    const urlParts = url.parse(uri);
    return urlParts.protocol + "//" + urlParts.host + urlParts.pathname;
};
/**
 * Set the proxy value for cached uri
 * @param {string} uri - uri string to test
 * @param {boolean} value - value to cache
 * @returns the passed value
 */
export const setProxyCacheByUrl = (uri, value)=>{
    const baseUrl = getBaseUrl(uri);
    proxyCache[baseUrl] = value;
};
/**
 * Get the proxy value for cached uri
 * @param {string} uri - uri string to test
 * @returns true, false or undefined, if undefined means the value has not been stored
 */
export const getProxyCacheByUrl = (uri)=>{
    const baseUrl = getBaseUrl(uri);
    return proxyCache[baseUrl];
};

export const needProxy = function(uri, config = {}) {
    if ( isArray(uri) ) {
        return uri.reduce((result, current) => needProxy(current) && result, true);
    }
    let needed = false;
    let sameOrigin = !(uri.indexOf("http") === 0);
    let urlParts = !sameOrigin && uri.match(/([^:]*:)\/\/([^:]*:?[^@]*@)?([^:\/\?]*):?([^\/\?]*)/);
    if (urlParts) {
        let location = window.location;
        sameOrigin =
            urlParts[1] === location.protocol &&
            urlParts[3] === location.hostname;
        let uPort = urlParts[4];
        let lPort = location.port;
        if (uPort !== 80 && uPort !== "" || lPort !== "80" && lPort !== "") {
            sameOrigin = sameOrigin && uPort === lPort;
        }
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
                needed = true;
            }
        }
    }
    return needed;
};

export const getProxyUrl = function(config = {}) {
    let proxyUrl = ConfigUtils.getProxyUrl(config);
    if (proxyUrl && isObject(proxyUrl)) {
        proxyUrl = proxyUrl.url;
    }
    return proxyUrl;
};
