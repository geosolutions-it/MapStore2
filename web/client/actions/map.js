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

function changeMapView(center, zoom, bbox, size) {
    return {
        type: CHANGE_MAP_VIEW,
        center: center,
        zoom: zoom,
        bbox: bbox,
        size: size
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

module.exports = {
    CHANGE_MAP_VIEW,
    CLICK_ON_MAP,
    CHANGE_MOUSE_POINTER,
    changeMapView,
    clickOnMap,
    changeMousePointer
};
