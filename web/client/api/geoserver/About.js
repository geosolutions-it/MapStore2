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

const toCamelCase = obj => obj.map(item => mapKeys(item, (value, key) => camelCase(key)));

export const getVersion = function({ baseUrl }) {
    if (cache[baseUrl]) return new Promise((resolve) => resolve(cache[baseUrl]));
    return axios.all([
        axios.get(`${baseUrl}rest/about/version`, {'Content-Type': 'application/json' })
            .then(({ data }) => get(data, 'about.resource'))
            .catch(() => null),
        axios.get(`${baseUrl}rest/about/manifest`, {'Content-Type': 'application/json' })
            .then(({ data }) => get(data, 'about.resource'))
            .catch(() => null)
    ])
    .then(([version, manifest]) => {
        cache[baseUrl] = {
            version: version && toCamelCase(version),
            manifest: manifest && toCamelCase(manifest)
        };
        return cache[baseUrl];
    });
};

