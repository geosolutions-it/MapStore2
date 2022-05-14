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
