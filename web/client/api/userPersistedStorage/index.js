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
    api: localStorage
};
let MemoryStorage = {};
const ApiProviders = {
    localStorage: window.localStorage,
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
export const api = "localStorage";
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
export const setApi = (name = "localStorage") => {
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
