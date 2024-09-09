/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import url from 'url';
import { needProxy } from '../utils/ProxyUtils';

let proxyCache = {};


const getBaseUrl = (uri) => {
    const urlParts = url.parse(uri);
    return urlParts.protocol + "//" + urlParts.host + urlParts.pathname;
};

export const setProxyCacheByUrl = (uri, value)=>{
    const baseUrl = getBaseUrl(uri);
    // const urlParts = url.parse(uri); // func make
    // const baseUrl = urlParts.protocol + "//" + urlParts.host + urlParts.pathname;
    proxyCache[baseUrl] = value;
    return value;
};

export const getProxyCacheByUrl = (uri)=>{
    const baseUrl = getBaseUrl(uri);
    return proxyCache[baseUrl];
};

export const testCors = (uri) => {
    const proxy = getProxyCacheByUrl(uri);
    if (needProxy(uri) === false) {
        setProxyCacheByUrl(uri, false);
        return Promise.resolve(false);
    }
    if (proxy !== undefined) {
        return Promise.resolve(proxy);
    }
    return fetch(uri, {
        method: 'GET',
        mode: 'cors'
    })
        .then((response) => {
            if (!response.ok) {
                return false;
            }
            return setProxyCacheByUrl(uri, false);
        })
        .catch(() => {
            // in server side error it goes to response(then) anyway, so we can assume that if we get here we have a cors error with no previewable response
            return setProxyCacheByUrl(uri, true);
        });
};
