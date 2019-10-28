/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var axios = require('../libs/ajax');

const LOAD_MAP_CONFIG = "MAP_LOAD_MAP_CONFIG";
const MAP_CONFIG_LOADED = 'MAP_CONFIG_LOADED';
const MAP_CONFIG_LOAD_ERROR = 'MAP_CONFIG_LOAD_ERROR';
const MAP_INFO_LOAD_START = 'MAP_INFO_LOAD_START';
const MAP_INFO_LOADED = 'MAP_INFO_LOADED';
const MAP_INFO_LOAD_ERROR = 'MAP_INFO_LOAD_ERROR';

function configureMap(conf, mapId) {
    return {
        type: MAP_CONFIG_LOADED,
        config: conf,
        legacy: !!mapId,
        mapId: mapId
    };
}

function configureError(e, mapId) {
    return {
        type: MAP_CONFIG_LOAD_ERROR,
        error: e,
        mapId
    };
}

function loadMapConfig(configName, mapId) {
    return {
        type: LOAD_MAP_CONFIG,
        configName,
        mapId
    };
}
function mapInfoLoaded(info, mapId) {
    return {
        type: MAP_INFO_LOADED,
        mapId,
        info
    };
}
function mapInfoLoadError(mapId, error) {
    return {
        type: MAP_INFO_LOAD_ERROR,
        mapId,
        error
    };
}
function mapInfoLoadStart(mapId) {
    return {
        type: MAP_INFO_LOAD_START,
        mapId
    };
}
function loadMapInfo(url, mapId) {
    return (dispatch) => {
        dispatch(mapInfoLoadStart(mapId));
        return axios.get(url).then((response) => {
            if (typeof response.data === 'object') {
                if (response.data.ShortResource) {
                    dispatch(mapInfoLoaded(response.data.ShortResource, mapId));
                } else {
                    dispatch(mapInfoLoaded(response.data, mapId));
                }

            } else {
                try {
                    JSON.parse(response.data);
                } catch (e) {
                    dispatch(mapInfoLoadError( mapId, e));
                }
            }
        }).catch((e) => {
            dispatch(mapInfoLoadError(mapId, e));
        });
    };

}
module.exports = {
    LOAD_MAP_CONFIG,
    MAP_CONFIG_LOADED,
    MAP_CONFIG_LOAD_ERROR,
    MAP_INFO_LOAD_START,
    MAP_INFO_LOADED,
    MAP_INFO_LOAD_ERROR,
    loadMapConfig,
    loadMapInfo,
    configureMap,
    configureError,
    mapInfoLoaded
};
