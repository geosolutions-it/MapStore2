/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var axios = require('../libs/ajax');

const MAP_CONFIG_LOADED = 'MAP_CONFIG_LOADED';
const MAP_CONFIG_LOAD_ERROR = 'MAP_CONFIG_LOAD_ERROR';
const {getAuthOptionsFromState} = require('../api/GeoStoreDAO');

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
    return (dispatch, getState = () => {}) => {
        let options = getAuthOptionsFromState(getState());
        return axios.get(configName, legacy ? options : null).then((response) => {
            if (typeof response.data === 'object') {
                dispatch(configureMap(response.data, legacy));
            } else {
                try {
                    JSON.parse(response.data);
                } catch(e) {
                    dispatch(configureError('Configuration file broken (' + configName + '): ' + e.message));
                }

            }

        }).catch((e) => {
            dispatch(configureError(e));
        });
    };
}

module.exports = {MAP_CONFIG_LOADED, MAP_CONFIG_LOAD_ERROR, loadMapConfig, configureMap};
