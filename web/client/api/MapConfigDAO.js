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
    get: function(url) {
        return axios.get(url).then(function(response) {
            // render map
            return response.data;
        });
    }
};

module.exports = Api;
