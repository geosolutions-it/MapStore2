import url from "url";
import {get} from "lodash";

/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const getRequestLoadValue = (name, state) => {
    const search = get(state, 'router.location.search') || '';
    const { query = {} } = url.parse(search, true) || {};
    if (query[name]) {
        try {
            return JSON.parse(query[name]);
        } catch (e) {
            if (query[name].length) {
                return query[name];
            }
            return null;
        }
    }
    return null;
};

export const postRequestLoadValue = (name, storage = sessionStorage) => {
    const queryParams = storage.getItem('queryParams') ?? null;
    if (queryParams) {
        try {
            const params = JSON.parse(queryParams);
            const { [name]: item, ...rest } = params;
            if (item && typeof params === 'object') {
                const { length } = Object.keys(params);
                length > 1 && storage.setItem('queryParams', JSON.stringify(rest));
                length === 1 && storage.removeItem('queryParams');
            }
            return item;
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(`Unable to parse query parameters from sessionStorage`);
            storage.removeItem('queryParams');
            return null;
        }
    }
    return null;
};

export const getRequestParameterValue = (name, state, storage = sessionStorage) => {
    return getRequestLoadValue(name, state) ?? postRequestLoadValue(name, storage);
};
