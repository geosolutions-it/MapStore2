/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

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

function creationError(options) {
    return {
        type: CREATION_ERROR_LAYER,
        options
    };
}
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

function panTo(center) {
    return {
        type: PAN_TO,
        center
    };
}

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

function initMap() {
    return {
        type: INIT_MAP
    };
}

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
    creationError,
    updateVersion,
    initMap
};
