/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const PRINT_CAPABILITIES_LOADED = 'PRINT_CAPABILITIES_LOADED';
export const PRINT_CAPABILITIES_ERROR = 'PRINT_CAPABILITIES_ERROR';

export const SET_PRINT_PARAMETER = 'SET_PRINT_PARAMETER';
export const ADD_PRINT_PARAMETER = 'ADD_PRINT_PARAMETER';
export const ADD_PRINT_TRANSFORMER = 'ADD_PRINT_TRANSFORMER';
export const PRINT_TRANSFORMER_ADDED = 'PRINT_TRANSFORMER_ADDED';
export const CONFIGURE_PRINT_MAP = 'CONFIGURE_PRINT_MAP';
export const CHANGE_PRINT_ZOOM_LEVEL = 'CHANGE_PRINT_ZOOM_LEVEL';
export const CHANGE_MAP_PRINT_PREVIEW = 'CHANGE_MAP_PRINT_PREVIEW';
export const PRINT_SUBMITTING = 'PRINT_SUBMITTING';
export const PRINT_ERROR = 'PRINT_ERROR';
export const PRINT_CREATED = 'PRINT_CREATED';
export const PRINT_CANCEL = 'PRINT_CANCEL';

import axios from '../libs/ajax';

export function printCapabilitiesLoaded(capabilities) {
    return {
        type: PRINT_CAPABILITIES_LOADED,
        capabilities
    };
}

export function printSubmitting() {
    return {
        type: PRINT_SUBMITTING
    };
}

export function printCancel() {
    return {
        type: PRINT_CANCEL
    };
}

export function printCreated(url) {
    return {
        type: PRINT_CREATED,
        url
    };
}

export function printCapabilitiesError(error) {
    return {
        type: PRINT_CAPABILITIES_ERROR,
        error
    };
}

export function printError(error) {
    return {
        type: PRINT_ERROR,
        error
    };
}

export function printSubmit(url, spec) {
    return (dispatch) => {
        return axios.post(url, spec).then((response) => {
            if (typeof response.data === 'object') {
                dispatch(printCreated(response.data && response.data.getURL));
            } else {
                try {
                    JSON.parse(response.data);
                } catch (e) {
                    dispatch(printError('Error on reading print result: ' + e.data));
                }
            }
        }).catch((e) => {
            dispatch(printError('Error on printing: ' + e.data));
        });
    };
}

export function loadPrintCapabilities(url) {
    return (dispatch) => {
        return axios.get(url).then((response) => {
            if (typeof response.data === 'object') {
                dispatch(printCapabilitiesLoaded(response.data));
            } else {
                try {
                    JSON.parse(response.data);
                } catch (e) {
                    dispatch(printCapabilitiesError('Print configuration broken (' + url + '): ' + e.data));
                }

            }

        }).catch((e) => {
            dispatch(printCapabilitiesError('Print configuration not available (' + url + '): ' + e.data));
        });
    };
}

export function setPrintParameter(name, value) {
    return {
        type: SET_PRINT_PARAMETER,
        name,
        value
    };
}

export function addPrintParameter(name, value) {
    return {
        type: ADD_PRINT_PARAMETER,
        name,
        value
    };
}

export function addPrintTransformer(name, transformer, position) {
    return {
        type: ADD_PRINT_TRANSFORMER,
        name,
        transformer,
        position
    };
}

export function printTransformerAdded(name) {
    return {
        type: PRINT_TRANSFORMER_ADDED,
        name
    };
}

export function configurePrintMap(center, zoom, scaleZoom, scale, layers, projection, currentLocale, useFixedScales = false, disableScaleLockingParams = {}) {
    return {
        type: CONFIGURE_PRINT_MAP,
        center,
        zoom,
        scaleZoom,
        scale,
        layers,
        projection,
        currentLocale,
        useFixedScales,
        editScale: disableScaleLockingParams?.editScale || false,
        mapResolution: disableScaleLockingParams?.mapResolution
    };
}

export function changePrintZoomLevel(zoom, scale, resolution, resolutions) {
    return {
        type: CHANGE_PRINT_ZOOM_LEVEL,
        zoom,
        scale,
        resolution,
        resolutions
    };
}

export function changeMapPrintPreview(center, zoom, bbox, size, mapStateSource, projection, _, resolution) {
    return {
        type: CHANGE_MAP_PRINT_PREVIEW,
        center,
        zoom,
        bbox,
        size,
        mapStateSource,
        projection,
        resolution
    };
}
