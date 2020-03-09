/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const LOAD_MAP_CONFIG = "MAP_LOAD_MAP_CONFIG";
const MAP_CONFIG_LOADED = 'MAP_CONFIG_LOADED';
const MAP_CONFIG_LOAD_ERROR = 'MAP_CONFIG_LOAD_ERROR';
const LOAD_MAP_INFO = 'MAP_LOAD_INFO';
const MAP_INFO_LOAD_START = 'MAP_INFO_LOAD_START';
const MAP_INFO_LOADED = 'MAP_INFO_LOADED';
const MAP_INFO_LOAD_ERROR = 'MAP_INFO_LOAD_ERROR';
const MAP_SAVE_ERROR = 'MAP:MAP_SAVE_ERROR';
const MAP_SAVED = 'MAP:MAP_SAVED';

/**
 * Configure the viewer to display the map
 * @param {object} conf map config
 * @param {number} mapId map resource id
 * @param {boolean} zoomToMaxExtent if true, trigger zooming to map's max extent instead of the zoom value specified in the config
 */
function configureMap(conf, mapId, zoomToMaxExtent) {
    return {
        type: MAP_CONFIG_LOADED,
        config: conf,
        legacy: !!mapId,
        mapId: mapId,
        zoomToMaxExtent
    };
}

function configureError(e, mapId) {
    return {
        type: MAP_CONFIG_LOAD_ERROR,
        error: e,
        mapId
    };
}

/**
 * Loads map configuration
 * @param {string} configName map config url
 * @param {*} mapId resource id of the map on a server
 * @param {*} config full config, overrides configName if not null or undefined
 */
function loadMapConfig(configName, mapId, config) {
    return {
        type: LOAD_MAP_CONFIG,
        configName,
        mapId,
        config
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
function loadMapInfo(mapId) {
    return {
        type: LOAD_MAP_INFO,
        mapId
    };
}

const mapSaveError = error => ({type: MAP_SAVE_ERROR, error});

const mapSaved = () => ({type: MAP_SAVED});

module.exports = {
    LOAD_MAP_CONFIG,
    MAP_CONFIG_LOADED,
    MAP_CONFIG_LOAD_ERROR,
    LOAD_MAP_INFO,
    MAP_INFO_LOAD_START,
    MAP_INFO_LOADED,
    MAP_INFO_LOAD_ERROR,
    MAP_SAVE_ERROR,
    MAP_SAVED,
    loadMapConfig,
    loadMapInfo,
    configureMap,
    configureError,
    mapInfoLoaded,
    mapInfoLoadError,
    mapInfoLoadStart,
    mapSaveError,
    mapSaved
};
