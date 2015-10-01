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
const LAYER_LOADING = 'LAYER_LOADING';
const LAYER_LOAD = 'LAYER_LOAD';
const SHOW_SPINNER = 'SHOW_SPINNER';
const HIDE_SPINNER = 'HIDE_SPINNER';

function changeMapView(center, zoom, bbox, size, mapStateSource) {
    return {
        type: CHANGE_MAP_VIEW,
        center: center,
        zoom: zoom,
        bbox: bbox,
        size: size,
        mapStateSource: mapStateSource
    };
}

function clickOnMap(point) {
    return {
        type: CLICK_ON_MAP,
        point: point
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

function layerLoading(layerId) {
    return {
        type: LAYER_LOADING,
        layerId: layerId
    };
}

function layerLoad(layerId) {
    return {
        type: LAYER_LOAD,
        layerId: layerId
    };
}

function showSpinner(spinnerId) {
    return {
        type: SHOW_SPINNER,
        spinnerId: spinnerId
    };
}

function hideSpinner(spinnerId) {
    return {
        type: HIDE_SPINNER,
        spinnerId: spinnerId
    };
}

module.exports = {
    CHANGE_MAP_VIEW,
    CLICK_ON_MAP,
    CHANGE_MOUSE_POINTER,
    CHANGE_ZOOM_LVL,
    LAYER_LOADING,
    LAYER_LOAD,
    SHOW_SPINNER,
    HIDE_SPINNER,
    changeMapView,
    clickOnMap,
    changeMousePointer,
    changeZoomLevel,
    layerLoading,
    layerLoad,
    showSpinner,
    hideSpinner
};
