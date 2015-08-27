/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var axios = require('axios');

const MAP_CONFIG_LOADED = 'MAP_CONFIG_LOADED';
const MAP_CONFIG_LOAD_ERROR = 'MAP_CONFIG_LOAD_ERROR';

function configureMap(conf, legacy) {
    return {
        type: MAP_CONFIG_LOADED,
        config: conf,
        legacy: legacy || false
    };
}

function configureError(e) {
    return {
        type: MAP_CONFIG_LOAD_ERROR,
        error: e
    };
}

function loadMapConfig(configName, legacy) {
    return (dispatch) => {
        return axios.get(configName).then((response) => {
            dispatch(configureMap(response.data, legacy));
        }).catch((e) => {
            dispatch(configureError(e));
        });
    };
}

module.exports = {MAP_CONFIG_LOADED, MAP_CONFIG_LOAD_ERROR, loadMapConfig};
