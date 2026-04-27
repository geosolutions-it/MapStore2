/**
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import axios from '../libs/ajax';
import urlUtil from 'url';
const DEFAULT_URL = 'nominatim.openstreetmap.org';
const DEFAULT_REVERSE_URL = 'nominatim.openstreetmap.org/reverse';
const DEFAULT_PROTOCOL = 'https';
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
        const {host, protocol, ...queryOptions} = options || {};
        var params = Object.assign({q: text}, defaultOptions, queryOptions);
        var url = urlUtil.format({
            protocol: protocol || DEFAULT_PROTOCOL,
            host: host || DEFAULT_URL,
            query: params
        });
        return axios.get(url);
    },
    reverseGeocode: function(coords, options) {
        const {host, protocol, ...queryOptions} = options || {};
        const params = Object.assign({lat: coords.lat, lon: coords.lng}, queryOptions, defaultOptions);
        const url = urlUtil.format({
            protocol: protocol || DEFAULT_PROTOCOL,
            host: host ? host + '/reverse' : DEFAULT_REVERSE_URL,
            query: params
        });
        return axios.get(url);
    }
};
export default Api;
