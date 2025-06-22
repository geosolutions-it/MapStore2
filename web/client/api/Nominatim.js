/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import axios from '../libs/ajax';

import urlUtil from 'url';
const DEFAULT_URL = 'nominatim.openstreetmap.org';
const DEFAULT_REVERSE_URL = 'nominatim.openstreetmap.org/reverse';
const defaultOptions = {
    format: 'json',
    bounded: 0,
    polygon_geojson: 1,
    priority: 5
};
/**
 * API for local config
 */
const Api = {
    geocode: function(text, options) {
        var params = Object.assign({q: text}, defaultOptions, options || {});
        var url = urlUtil.format({
            protocol: "https",
            host: DEFAULT_URL,
            query: params
        });
        return axios.get(url); // TODO the jsonp method returns .promise and .cancel method,the last can be called when user cancel the query
    },
    reverseGeocode: function(coords, options) {
        const params = Object.assign({lat: coords.lat, lon: coords.lng}, options || {}, defaultOptions);
        const url = urlUtil.format({
            protocol: "https",
            host: DEFAULT_REVERSE_URL,
            query: params
        });
        return axios.get(url);
    }
};

export default Api;
