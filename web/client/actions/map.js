/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


export const CHANGE_MAP_VIEW = 'CHANGE_MAP_VIEW';
export const CLICK_ON_MAP = 'CLICK_ON_MAP';
export const CHANGE_MOUSE_POINTER = 'CHANGE_MOUSE_POINTER';
export const CHANGE_ZOOM_LVL = 'CHANGE_ZOOM_LVL';
export const PAN_TO = 'PAN_TO';
export const ZOOM_TO_EXTENT = 'ZOOM_TO_EXTENT';
export const ZOOM_TO_POINT = 'ZOOM_TO_POINT';
export const CHANGE_MAP_CRS = 'CHANGE_MAP_CRS';
export const CHANGE_MAP_SCALES = 'CHANGE_MAP_SCALES';
export const CHANGE_MAP_STYLE = 'CHANGE_MAP_STYLE';
export const CHANGE_ROTATION = 'CHANGE_ROTATION';
export const CREATION_ERROR_LAYER = 'CREATION_ERROR_LAYER';
export const UPDATE_VERSION = 'UPDATE_VERSION';
export const INIT_MAP = 'INIT_MAP';
export const RESIZE_MAP = 'RESIZE_MAP';
export const CHANGE_MAP_LIMITS = 'CHANGE_MAP_LIMITS';
export const SET_MAP_RESOLUTIONS = 'SET_MAP_RESOLUTIONS';
export const REGISTER_EVENT_LISTENER = 'REGISTER_EVENT_LISTENER';
export const UNREGISTER_EVENT_LISTENER = 'UNREGISTER_EVENT_LISTENER';
export const MOUSE_MOVE = 'MOUSE_MOVE';
export const MOUSE_OUT = 'MOUSE_OUT';
export const MAP_PLUGIN_LOAD = 'MAP:MAP_PLUGIN_LOAD';


/**
 * Event triggered when loading a different map type plugins (code for the specific implementation)
 * @prop {boolean} loading true when the loading is active. False when the loading is finished.
 * @prop {string} maptype
 * @prop {boolean} loaded true if the plugin for the map type is effectively loaded. false or undefined if it is not loaded or there was some error loading
 * @prop {Error} errorMap if valorized, contains the error occurred during the map plugin loading.
 */
export function mapPluginLoad(loading, mapType, loaded, errorMap) {
    return {
        type: MAP_PLUGIN_LOAD,
        mapType,
        loading,
        loaded,
        error: errorMap
    };
}

/**
 * zoom to a specific point
 * @memberof actions.map
 * @param {object} pos as array [x, y] or object {x: ..., y:...}
 * @param {number} zoom level to zoom to
 * @param {string} crs of the point
*/
export function zoomToPoint(pos, zoom, crs) {
    return {
        type: ZOOM_TO_POINT,
        pos,
        zoom,
        crs
    };
}

export function changeMapView(center, zoom, bbox, size, mapStateSource, projection, viewerOptions, resolution) {
    return {
        type: CHANGE_MAP_VIEW,
        center,
        zoom,
        bbox,
        size,
        mapStateSource,
        projection,
        viewerOptions,
        resolution
    };
}

export function changeMapCrs(crs) {
    return {
        type: CHANGE_MAP_CRS,
        crs: crs
    };
}

export function changeMapScales(scales) {
    return {
        type: CHANGE_MAP_SCALES,
        scales: scales
    };
}

export function clickOnMap(point, layer) {
    return {
        type: CLICK_ON_MAP,
        point: point,
        layer
    };
}

export function changeMousePointer(pointerType) {
    return {
        type: CHANGE_MOUSE_POINTER,
        pointer: pointerType
    };
}

export function changeZoomLevel(zoomLvl, mapStateSource) {
    return {
        type: CHANGE_ZOOM_LVL,
        zoom: zoomLvl,
        mapStateSource: mapStateSource
    };
}


/**
 * pan to a specific point
 * @memberof actions.map
 * @param {object} center as {x, y, crs}
*/
export function panTo(center) {
    return {
        type: PAN_TO,
        center
    };
}

/**
 * zoom to the specified extent
 * @memberof actions.map
 * @param {number[]} extent in the form of [minx, miny, maxx, maxy]
 * @param {string} crs related the extent
 * @param {number} maxZoom the max zoom limit
 * @param {object} options additional options `{nearest: true}`is the only supported
 * (See {@link https://openlayers.org/en/latest/apidoc/module-ol_View-View.html#fit| Openlayers View, fit method} )
 */
export function zoomToExtent(extent, crs, maxZoom, options) {
    return {
        type: ZOOM_TO_EXTENT,
        extent,
        crs,
        maxZoom,
        options
    };
}

export function changeRotation(rotation, mapStateSource) {
    return {
        type: CHANGE_ROTATION,
        rotation,
        mapStateSource
    };
}

export function changeMapStyle(style, mapStateSource) {
    return {
        type: CHANGE_MAP_STYLE,
        style,
        mapStateSource
    };
}
export function updateVersion(version) {
    return {
        type: UPDATE_VERSION,
        version
    };
}

export function initMap(disableFeedbackMask) {
    return {
        type: INIT_MAP,
        disableFeedbackMask
    };
}

export function resizeMap() {
    return {
        type: RESIZE_MAP
    };
}
export function changeMapLimits({restrictedExtent, crs, minZoom}) {
    return {
        type: CHANGE_MAP_LIMITS,
        restrictedExtent,
        crs,
        minZoom
    };
}

export function setMapResolutions(resolutions) {
    return {
        type: SET_MAP_RESOLUTIONS,
        resolutions
    };
}

/**
 * Add a tool to the list of event listeners for the map plugin.
 * This can help to trigger actions only if some tool is effectively listen. Useful for
 * events that are triggered frequently and so can slow down the application.
 * @param {string} eventName the event name. One of ``pointermove`,
 * @param {string} toolName an identifier for the tool
 */
export const registerEventListener = (eventName, toolName) => ({
    type: REGISTER_EVENT_LISTENER,
    eventName,
    toolName
});

/**
 * Remove the listeners added using `registerEventListener` .
 * @param {string} eventName the event name. One of ``pointermove`,
 * @param {string} toolName an identifier for the tool
 */
export const unRegisterEventListener = (eventName, toolName) => ({
    type: UNREGISTER_EVENT_LISTENER,
    eventName,
    toolName
});

/**
 * Triggered on mouse move. (only if some tool is registered on this event. See `registerEventListener`).
 * @param {object} position the position of the mouse on the map.
 */
export const mouseMove = (position) => ({
    type: MOUSE_MOVE,
    position
});

/**
 * Triggered when the mouse goes out from the map
 */
export const mouseOut = () => ({
    type: MOUSE_OUT
});

/**
 * Actions for map
 * @name actions.map
 */
