import url from "url";
import {get} from "lodash";

/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const getRequestLoadValue = (name, state) => {
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

const postRequestLoadValue = (name, storage = sessionStorage) => {
    const item = storage.getItem(name);
    storage.removeItem(name);
    try {
        return JSON.parse(decodeURIComponent(item));
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`Unable to parse query parameter from sessionStorage: ${name}`);
        return null;
    }
};

export const getRequestParameterValue = (name, state) => {
    return getRequestLoadValue(name, state) ?? postRequestLoadValue(name);
};
