/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var axios = require('axios');
var ConfigUtils = require('../utils/ConfigUtils');
/**
 * API for local config
 */
var Api = {
    get: function(url) {
        return axios.get(url).then(function(response) {
            // render map
            return response.data;
        });
    },

    /**
     * Returns Merged configurations from base url and GeoStore
     */
    getMergedConfig: function(baseConfigURL, mapId, geoStoreBase) {
        var url = ( geoStoreBase || "/rest/geostore/" ) + "data/" + mapId;
        var me = this;
        if (!mapId) {
            return this.get(baseConfigURL);
        }

        return axios.all([axios.get(baseConfigURL), axios.get(url)])
            .then( function(args) {
                var baseConfig = args[0].data;
                var mapConfig = args[1].data;
                return ConfigUtils.mergeConfigs(baseConfig, mapConfig);
            }).catch(function() {
                // TODO manage the error
                return me.get(baseConfigURL);
            });
    }
};

module.exports = Api;
