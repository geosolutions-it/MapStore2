/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var axios = require('../libs/ajax');
const urlUtil = require('url');
const assign = require('object-assign');
const DEFAULT_URL = '//nominatim.openstreetmap.org';
const defaultOptions = {
    format: 'json',
    bounded: 0,
    addressdetails: 1
};
/**
 * API for local config
 */
const Api = {
    geocode: function(text, options) {
        var params = assign({q: text}, options || {}, defaultOptions);
        var url = urlUtil.format({
            host: DEFAULT_URL,
            query: params
        });
        return axios.get(url); // TODO the jsonp method returns .promise and .cancel method,the last can be called when user cancel the query
    }
};

module.exports = Api;
