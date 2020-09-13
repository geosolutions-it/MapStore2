/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const {error} = require('./notifications');
const CHANGE_MAP_VIEW = 'CHANGE_MAP_VIEW';
const CLICK_ON_MAP = 'CLICK_ON_MAP';
const CHANGE_MOUSE_POINTER = 'CHANGE_MOUSE_POINTER';
const CHANGE_ZOOM_LVL = 'CHANGE_ZOOM_LVL';
const PAN_TO = 'PAN_TO';
const ZOOM_TO_EXTENT = 'ZOOM_TO_EXTENT';
const ZOOM_TO_POINT = 'ZOOM_TO_POINT';
const CHANGE_MAP_CRS = 'CHANGE_MAP_CRS';
const CHANGE_MAP_SCALES = 'CHANGE_MAP_SCALES';
const CHANGE_MAP_STYLE = 'CHANGE_MAP_STYLE';
const CHANGE_ROTATION = 'CHANGE_ROTATION';
const CREATION_ERROR_LAYER = 'CREATION_ERROR_LAYER';
const UPDATE_VERSION = 'UPDATE_VERSION';
const INIT_MAP = 'INIT_MAP';
const RESIZE_MAP = 'RESIZE_MAP';
const CHANGE_MAP_LIMITS = 'CHANGE_MAP_LIMITS';
const SET_MAP_RESOLUTIONS = 'SET_MAP_RESOLUTIONS';
const REGISTER_EVENT_LISTENER = 'REGISTER_EVENT_LISTENER';
const UNREGISTER_EVENT_LISTENER = 'UNREGISTER_EVENT_LISTENER';
const MOUSE_MOVE = 'MOUSE_MOVE';
const MOUSE_OUT = 'MOUSE_OUT';

function errorLoadingFont(err = {family: ""}) {
    return error({
        title: "warning",
        message: "map.errorLoadingFont",
        values: err,
        position: "tc",
        autoDismiss: 10
    });
}

/**
 * zoom to a specific point
 * @memberof actions.map
 * @param {object} pos as array [x, y] or object {x: ..., y:...}
 * @param {number} zoom level to zoom to
 * @param {string} crs of the point
*/
function zoomToPoint(pos, zoom, crs) {
    return {
        type: ZOOM_TO_POINT,
        pos,
        zoom,
        crs
    };
}

function changeMapView(center, zoom, bbox, size, mapStateSource, projection, viewerOptions) {
    return {
        type: CHANGE_MAP_VIEW,
        center,
        zoom,
        bbox,
        size,
        mapStateSource,
        projection,
        viewerOptions
    };
}

function changeMapCrs(crs) {
    return {
        type: CHANGE_MAP_CRS,
        crs: crs
    };
}

function changeMapScales(scales) {
    return {
        type: CHANGE_MAP_SCALES,
        scales: scales
    };
}

function clickOnMap(point, layer) {
    return {
        type: CLICK_ON_MAP,
        point: point,
        layer
    };
}

function changeMousePointer(pointerType) {
    return {
        type: CHANGE_MOUSE_POINTER,
        pointer: pointerType
    };
}

function changeZoomLevel(zoomLvl, mapStateSource) {
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
function panTo(center) {
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
*/
function zoomToExtent(extent, crs, maxZoom) {
    return {
        type: ZOOM_TO_EXTENT,
        extent,
        crs,
        maxZoom
    };
}

function changeRotation(rotation, mapStateSource) {
    return {
        type: CHANGE_ROTATION,
        rotation,
        mapStateSource
    };
}

function changeMapStyle(style, mapStateSource) {
    return {
        type: CHANGE_MAP_STYLE,
        style,
        mapStateSource
    };
}
function updateVersion(version) {
    return {
        type: UPDATE_VERSION,
        version
    };
}

function initMap(disableFeedbackMask) {
    return {
        type: INIT_MAP,
        disableFeedbackMask
    };
}

function resizeMap() {
    return {
        type: RESIZE_MAP
    };
}
function changeMapLimits({restrictedExtent, crs, minZoom}) {
    return {
        type: CHANGE_MAP_LIMITS,
        restrictedExtent,
        crs,
        minZoom
    };
}

function setMapResolutions(resolutions) {
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
const registerEventListener = (eventName, toolName) => ({
    type: REGISTER_EVENT_LISTENER,
    eventName,
    toolName
});

/**
 * Remove the listeners added using `registerEventListener` .
 * @param {string} eventName the event name. One of ``pointermove`,
 * @param {string} toolName an identifier for the tool
 */
const unRegisterEventListener = (eventName, toolName) => ({
    type: UNREGISTER_EVENT_LISTENER,
    eventName,
    toolName
});

/**
 * Triggered on mouse move. (only if some tool is registered on this event. See `registerEventListener`).
 * @param {object} position the position of the mouse on the map.
 */
const mouseMove = (position) => ({
    type: MOUSE_MOVE,
    position
});

/**
 * Triggered when the mouse goes out from the map
 */
const mouseOut = () => ({
    type: MOUSE_OUT
});

/**
 * Actions for map
 * @name actions.map
 */
module.exports = {
    CHANGE_MAP_VIEW,
    CLICK_ON_MAP,
    CHANGE_MOUSE_POINTER,
    CHANGE_ZOOM_LVL,
    PAN_TO,
    ZOOM_TO_EXTENT,
    CHANGE_MAP_CRS,
    CHANGE_MAP_SCALES,
    CHANGE_MAP_STYLE,
    CHANGE_ROTATION,
    ZOOM_TO_POINT,
    CREATION_ERROR_LAYER,
    UPDATE_VERSION,
    INIT_MAP,
    RESIZE_MAP,
    CHANGE_MAP_LIMITS,
    SET_MAP_RESOLUTIONS,
    REGISTER_EVENT_LISTENER,
    UNREGISTER_EVENT_LISTENER,
    MOUSE_MOVE,
    MOUSE_OUT,
    changeMapView,
    clickOnMap,
    changeMousePointer,
    changeZoomLevel,
    changeMapCrs,
    changeMapScales,
    zoomToExtent,
    panTo,
    changeMapStyle,
    changeRotation,
    zoomToPoint,
    errorLoadingFont,
    updateVersion,
    initMap,
    resizeMap,
    changeMapLimits,
    setMapResolutions,
    registerEventListener,
    unRegisterEventListener,
    mouseMove,
    mouseOut
};
