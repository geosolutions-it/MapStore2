import url from "url";
import {get} from "lodash";

/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Retrieves parameters from hash "query string" of react router
 * Example: `#/viewer/openlayers/0?center=0,0&zoom=5
 * @param {string|number} name - name of the parameter to get
 * @param state - state of the app
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

/**
 * Retrieves parameters from the `queryParams` entry (JSON) of the passed storage (by default `sessionStorage`).
 * Example:
 * <pre>
 * {
 *      "map": {"Contents of exported map"},
 *      "featureinfo": {"lat": 0, "lng": 0, "filterNameList": []},
 *      "bbox": "-177.84667968750014,-1.8234225930143395,-9.096679687500114,61.700290838326204",
 *      "center": "0,0",
 *      "zoom": 5,
 *      "actions": [],
 *      "page": "#/viewer/openlayers/config"
 * }
 * </pre>
 * @param {string} name - name of the parameter to get
 * @param {Storage} storage - sessionStorage or localStorage
 */
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


/**
 * Retrieves parameter from two available sources:
 * - from hash "query string" of react router
 * - from the `queryParams` entry (JSON) of the passed storage
 * Data from query string has higher priority if parameter is available in both sources.
 * @param {string} name - name of the parameter to get
 * @param {*} state - app state
 * @param {Storage} storage - sessionStorage or localStorage
 */
export const getRequestParameterValue = (name, state, storage = sessionStorage) => {
    return getRequestLoadValue(name, state) ?? postRequestLoadValue(name, storage);
};
