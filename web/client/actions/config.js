/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const LOAD_NEW_MAP = 'MAP:LOAD_NEW_MAP';
const LOAD_MAP_CONFIG = "MAP_LOAD_MAP_CONFIG";
const MAP_CONFIG_LOADED = 'MAP_CONFIG_LOADED';
const MAP_CONFIG_LOAD_ERROR = 'MAP_CONFIG_LOAD_ERROR';
const LOAD_MAP_INFO = 'MAP_LOAD_INFO';
const MAP_INFO_LOAD_START = 'MAP_INFO_LOAD_START';
const MAP_INFO_LOADED = 'MAP_INFO_LOADED';
const MAP_INFO_LOAD_ERROR = 'MAP_INFO_LOAD_ERROR';
const MAP_SAVE_ERROR = 'MAP:MAP_SAVE_ERROR';
const MAP_SAVED = 'MAP:MAP_SAVED';
const RESET_MAP_SAVE_ERROR = 'MAP:RESET_MAP_SAVE_ERROR';

/**
 * Configure the viewer to display the map
 * @param {object} conf map config
 * @param {number} mapId map resource id
 * @param {boolean} zoomToExtent if provided, zooms to this extent after the map is configured
 */
function configureMap(conf, mapId, zoomToExtent) {
    return {
        type: MAP_CONFIG_LOADED,
        config: conf,
        legacy: !!mapId,
        mapId: mapId,
        zoomToExtent
    };
}

function configureError(e, mapId) {
    return {
        type: MAP_CONFIG_LOAD_ERROR,
        error: e,
        mapId
    };
}

function loadNewMap(configName, contextId) {
    return {
        type: LOAD_NEW_MAP,
        configName,
        contextId
    };
}

/**
 * Loads map configuration
 * @param {string} configName map config url
 * @param {number} mapId resource id of the map on a server
 * @param {object} config full config, overrides configName if not null or undefined
 * @param {object} mapInfo map info override
 * @param {object} overrideConfig config override
 */
function loadMapConfig(configName, mapId, config, mapInfo, overrideConfig) {
    return {
        type: LOAD_MAP_CONFIG,
        configName,
        mapId,
        config,
        mapInfo,
        overrideConfig
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

const mapSaved = (resourceId) => ({type: MAP_SAVED, resourceId});

const resetMapSaveError = () => ({type: RESET_MAP_SAVE_ERROR});

module.exports = {
    LOAD_NEW_MAP,
    LOAD_MAP_CONFIG,
    MAP_CONFIG_LOADED,
    MAP_CONFIG_LOAD_ERROR,
    LOAD_MAP_INFO,
    MAP_INFO_LOAD_START,
    MAP_INFO_LOADED,
    MAP_INFO_LOAD_ERROR,
    MAP_SAVE_ERROR,
    MAP_SAVED,
    RESET_MAP_SAVE_ERROR,
    loadNewMap,
    loadMapConfig,
    loadMapInfo,
    configureMap,
    configureError,
    mapInfoLoaded,
    mapInfoLoadError,
    mapInfoLoadStart,
    mapSaveError,
    mapSaved,
    resetMapSaveError
};
