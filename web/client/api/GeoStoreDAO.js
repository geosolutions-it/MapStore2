/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var axios = require('../libs/ajax');

/**
 * API for local config
 */
var Api = {
    getData: function(id, geoStoreBase) {
        var url = geoStoreBase || "/mapstore/rest/geostore/";
        url += "data/" + id;
        return axios.get(url).then(function(response) {
            return response.data;
        });
    },
    getResourcesByCategory: function(category, query, params, geoStoreBase) {
        var url = geoStoreBase || "/mapstore/rest/geostore/";
        var q = query || "*";
        url += "extjs/search/category/" + category + "/*" + q + "*/";
        return axios.get(url, params).then(function(response) {return response.data; });
    }
};

module.exports = Api;
