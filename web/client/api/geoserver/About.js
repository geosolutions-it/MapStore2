/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from '../../libs/ajax';
import { get, mapKeys, camelCase } from 'lodash';

let cache = {};

// transform keys of an array of items to camelCase
const toCamelCase = items => items.map(item => mapKeys(item, (value, key) => camelCase(key)));

/**
* Api for GeoServer about via rest
* @name api.geoserver
*/

/**
* Get version, manifest and fonts
* @memberof api.geoserver
* @param {object} params {baseUrl}
* @param {string} params.baseUrl base url of GeoServer eg: http://localhost:8080/geoserver/
* @return {promise} it returns an object with manifest and version
*/
export const getVersion = function({ baseUrl }) {
    if (cache[baseUrl]) return new Promise((resolve) => resolve(cache[baseUrl]));
    return axios.all([
        axios.get(`${baseUrl}rest/about/version`, {'Content-Type': 'application/json' })
            .then(({ data }) => get(data, 'about.resource'))
            .catch(() => null),
        axios.get(`${baseUrl}rest/about/manifest`, {'Content-Type': 'application/json' })
            .then(({ data }) => get(data, 'about.resource'))
            .catch(() => null),
        axios.get(`${baseUrl}rest/fonts`, {'Content-Type': 'application/json' })
            .then(({ data }) => get(data, 'fonts'))
            .catch(() => null)
    ])
        .then(([version, manifest, fonts]) => {
            const response = {
                version: version && toCamelCase(version),
                manifest: manifest && toCamelCase(manifest),
                fonts
            };
            // if one of version or manifest fails we should not cache the response
            if (!version || !manifest) return response;
            cache[baseUrl] = response;
            return cache[baseUrl];
        });
};

// clear local cache
export const clearCache = () => { cache = {}; };
