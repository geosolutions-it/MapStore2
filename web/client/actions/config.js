/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


export const LOAD_NEW_MAP = 'MAP:LOAD_NEW_MAP';
export const LOAD_MAP_CONFIG = "MAP_LOAD_MAP_CONFIG";
export const MAP_CONFIG_LOADED = 'MAP_CONFIG_LOADED';
export const MAP_CONFIG_LOAD_ERROR = 'MAP_CONFIG_LOAD_ERROR';
export const LOAD_MAP_INFO = 'MAP_LOAD_INFO';
export const MAP_INFO_LOAD_START = 'MAP_INFO_LOAD_START';
export const MAP_INFO_LOADED = 'MAP_INFO_LOADED';
export const MAP_INFO_LOAD_ERROR = 'MAP_INFO_LOAD_ERROR';
export const MAP_SAVE_ERROR = 'MAP:MAP_SAVE_ERROR';
export const MAP_SAVED = 'MAP:MAP_SAVED';
export const RESET_MAP_SAVE_ERROR = 'MAP:RESET_MAP_SAVE_ERROR';

/**
 * Configure the viewer to display the map
 * @param {object} conf map config
 * @param {number} mapId map resource id
 * @param {boolean} zoomToExtent if provided, zooms to this extent after the map is configured
 */
export function configureMap(conf, mapId, zoomToExtent) {
    return {
        type: MAP_CONFIG_LOADED,
        config: conf,
        legacy: !!mapId,
        mapId: mapId,
        zoomToExtent
    };
}

export function configureError(e, mapId) {
    return {
        type: MAP_CONFIG_LOAD_ERROR,
        error: e,
        mapId
    };
}

export function loadNewMap(configName, contextId) {
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
export function loadMapConfig(configName, mapId, config, mapInfo, overrideConfig) {
    return {
        type: LOAD_MAP_CONFIG,
        configName,
        mapId,
        config,
        mapInfo,
        overrideConfig
    };
}
export function mapInfoLoaded(info, mapId) {
    return {
        type: MAP_INFO_LOADED,
        mapId,
        info
    };
}
export function mapInfoLoadError(mapId, error) {
    return {
        type: MAP_INFO_LOAD_ERROR,
        mapId,
        error
    };
}
export function mapInfoLoadStart(mapId) {
    return {
        type: MAP_INFO_LOAD_START,
        mapId
    };
}
export function loadMapInfo(mapId) {
    return {
        type: LOAD_MAP_INFO,
        mapId
    };
}

export const mapSaveError = error => ({type: MAP_SAVE_ERROR, error});

export const mapSaved = (resourceId) => ({type: MAP_SAVED, resourceId});

export const resetMapSaveError = () => ({type: RESET_MAP_SAVE_ERROR});
