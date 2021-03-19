/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


import get from 'lodash/get';
import { set, unset} from '../../utils/ImmutableUtils';

let UserPersistedSession = {
    api: localStorage
};
let MemoryStorage = {};
const ApiProviders = {
    localStorage: window.localStorage,
    memoryStorage: {
        throwable: false,
        getItem: (path) => {
            if (ApiProviders.memoryStorage.throwable) {
                throw Error("Cannot Access localStorage");
            }
            return get(MemoryStorage, path);
        },
        setItem: (path) => {
            if (ApiProviders.memoryStorage.throwable) {
                throw Error("Cannot Access localStorage");
            }
            return set(MemoryStorage, path);
        },
        removeItem: (path) => {
            if (ApiProviders.memoryStorage.throwable) {
                throw Error("Cannot Access localStorage");
            }
            return unset(MemoryStorage, path);
        },
        setThrowable: (status) => {
            ApiProviders.memoryStorage.throwable = status;
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
