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
/**
 * Set the proxy value for cached uri
 * @param {string} uri - uri string to test
 * @param {boolean} value - value to cache
 * @returns the passed value
 */
export const setProxyCacheByUrl = (uri, value)=>{
    const baseUrl = getBaseUrl(uri);
    proxyCache[baseUrl] = value;
    return value;
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

let testCorsFetch = fetch;

/**
 * utils to intercept the fetch request, mainly needed for testing
 * @ignore
 * @param {function} callback intercept the fetch request and allow to override to default fetch function
 * @example
 * it('my test', (done) => {
 *  getTestCorsFetchInterceptor((url) => {
 *      expect(url).toBe('my url');
 *      return () => Promise.reject(); // simulate failing of the test cors fetch request
 *  });
 *  // ...
 * });
 */
export const getTestCorsFetchInterceptor = (callback) => {
    testCorsFetch = (...args) => {
        const interceptedFetch = callback(...args);
        return interceptedFetch ? interceptedFetch(...args) : fetch(...args);
    };
    return testCorsFetch;
};
/**
 * restore the default fetch function after using the `getTestCorsFetchInterceptor` function
 * @ignore
 * @example
 * afterEach((done) => {
 *  restoreTestCorsFetch();
 *  // ...
 *  setTimeout(done);
 * });
 */
export const restoreTestCorsFetch = () => { testCorsFetch = fetch; };

/**
 * Perform a fetch request to test if a service support CORS
 * @param {string} uri - uri string to test
 * @returns true if the proxy is required
 */
export const testCors = (uri) => {
    const proxy = getProxyCacheByUrl(uri);
    if (needProxy(uri) === false) {
        setProxyCacheByUrl(uri, false);
        return Promise.resolve(false);
    }
    if (proxy !== undefined) {
        return Promise.resolve(proxy);
    }
    return testCorsFetch(uri, {
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
