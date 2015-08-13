/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var axios = require('axios');

/**
 * API for local config
 */
var Api = {
    getData: function(id, geoStoreBase) {
        var url = geoStoreBase || "/rest/geostore/";
        url += "data/" + id;
        return axios.get(url).then(function(response) {
            // render map
            return response.data;
        });
    },
    getResourcesByCategory: function(category, query, params, geoStoreBase) {
        var url = geoStoreBase || "/rest/geostore/";
        var q = query || "*";
        url += "extjs/search/category/" + category + "/*" + q + "*/";
        return axios.get(url, params).then(function(response) {return response.data; });
    }
};

module.exports = Api;
