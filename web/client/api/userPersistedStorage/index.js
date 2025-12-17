/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


import get from 'lodash/get';
import set from 'lodash/set';
import unset from 'lodash/unset';

/**
 * This utility function extract a namespace from the application to
 * make a local persistence space for each application.
 * @param {string} url URL provider
 * @returns
 */
export const getNameSpace = (urlInput) => {
    try {
    // handle also relative URL
        const firstSegment = new URL(urlInput, "https://sample.com")?.pathname?.split('/')?.[1];

        // clean path
        if (!firstSegment || firstSegment.toLowerCase() === 'mapstore' || firstSegment.endsWith('.html')) {
            return "";
        }
        return firstSegment;
    } catch (e) {
        console.error("Invalid URL", e);
        return null;
    }
};
/**
 * Creates a standardized key for the items to store in the storage API.
 * Usually the key is made this way `ns:base.section.fragment`.
 * When `config` 3rd parameter is not passed, the string will be typically `mapstore.section.fragment`.
 * Typical usage is `getApi().getItem(getItemKey('plugins.myPlugin', 'myOption'))`.
 * This will produce a key that is typically `mapstore.plugins.myPlugin.myOption`.
 * Depending on execution context `ns` can be different.
 * @param {string} section the first part of the string where store the data.
 * @param {string} fragment the last part of the key where to store the effective data.
 * @param {object} config an object with the parameters for the itemkey generation
 * @param {string} config.ns when defined is the namespace. When not passed as parameter, it is derived from the local environment base path, to provide different namespaces for different applications.
 *     - If the application is deployed on `/` or `/mapstore/` the namespace is empty (so the `:` separator will not be included).
 *     - if the application is deployed on `/app1` or `/app2` (different from mapstore), the namespace will become respectively `/app1` and `/app2`.
 *     - if `window.MAPSTORE_STORAGE_NAMESPACE` is defined, the value of this variable will be used as namespace.
 *   This is implemented this way to allow 2 different instances of mapstore deployed on the same domain to continue using separate namespaces.
 * @param {string} [config.base='mapstore'] the base of the key to generate
 * @returns {string}
 */
export const getItemKey = ( section, fragment, {ns, base = "mapstore"} = {}) => {
    // parse path to see if
    const NS = ns ?? window?.MAPSTORE_STORAGE_NAMESPACE ?? getNameSpace(window?.location?.href);
    return `${ NS ? NS + ":" : ""}${base}.${section}.${fragment}`;
};

let UserPersistedSession = {
};
let ls;
/*
 * This API provides a wrapper for local persistance. By default uses localStorage and implements the same API.
 * Anyway, when localStorage is not accessible for security settings, it falls back to a dummy local memory.
 * One example of 'localStorage not available' is when 3rd party cookies are disabled, the JS code is running in an iframe and you are in incognito mode.
 */
try {
    // test localStorage access
    ls = window.localStorage;
    UserPersistedSession.api = "localStorage";
} catch (e) {
    // eslint-disable-next-line no-console
    console.warn("localStorage is not accessible, using local memory storage instead", e);
    UserPersistedSession.api = "memoryStorage";
}
let MemoryStorage = {};
const ApiProviders = {
    localStorage: ls,
    memoryStorage: {
        accessDenied: false,
        getItem: (path) => {
            if (ApiProviders.memoryStorage.accessDenied) {
                throw Error("Cannot Access memoryStorage");
            }
            return get(MemoryStorage, path);
        },
        setItem: (path, value) => {
            if (ApiProviders.memoryStorage.accessDenied) {
                throw Error("Cannot Access memoryStorage");
            }
            set(MemoryStorage, path, value);
        },
        removeItem: (path) => {
            if (ApiProviders.memoryStorage.accessDenied) {
                throw Error("Cannot Access memoryStorage");
            }
            return unset(MemoryStorage, path);
        },
        setAccessDenied: (status = false) => {
            ApiProviders.memoryStorage.accessDenied = status;
        }
    }
};
export const api = UserPersistedSession.api;
/**
* Add a new API implementation
* @param {string} name the key of the added api implementation
* @param {object} api the api implementation
*/
export const addApi = (name, apiName) => {
    ApiProviders[name] = apiName;
};
/**
* Set the current API
* @param {string} name the key of the api implementation to be used
*/
export const setApi = (name = api) => {
    UserPersistedSession.api = name;
};
/**
* Add a new api implementation
* @return {object} Current api
*/
export const getApi = () => {
    return ApiProviders[UserPersistedSession.api];
};
UserPersistedSession = {
    api,
    addApi,
    setApi,
    getApi
};

export default UserPersistedSession;
