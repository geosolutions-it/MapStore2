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
export const CONFIGURE_PRINT_MAP = 'CONFIGURE_PRINT_MAP';
export const CHANGE_PRINT_ZOOM_LEVEL = 'CHANGE_PRINT_ZOOM_LEVEL';
export const CHANGE_MAP_PRINT_PREVIEW = 'CHANGE_MAP_PRINT_PREVIEW';
export const PRINT_SUBMITTING = 'PRINT_SUBMITTING';
export const PRINT_ERROR = 'PRINT_ERROR';
export const PRINT_CREATED = 'PRINT_CREATED';
export const PRINT_CANCEL = 'PRINT_CANCEL';

import axios from '../libs/ajax';

import mapfish2 from "../utils/print/mapfish2";
import mapfish3 from "../utils/print/mapfish3";

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

export function printSubmit(url, spec, type) {
    return (dispatch) => {
        return axios.post(url, spec).then((response) => {
            if (typeof response.data === 'object') {
                const printUrl = type === "mapfish2" ? mapfish2.getPrintUrl(response.data) : mapfish3.getPrintUrl(response.data);
                if (type === "mapfish2") {
                    dispatch(printCreated(printUrl));
                } else {
                    mapfish3.waitForDone(mapfish3.getStatusUrl(response.data)).then(() => {
                        dispatch(printCreated(printUrl));
                    }).catch((e) => {
                        dispatch(printError('Error on reading print result: ' + e.message));
                    });

                }
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

export function configurePrintMap(center, zoom, scaleZoom, scale, layers, projection, currentLocale) {
    return {
        type: CONFIGURE_PRINT_MAP,
        center,
        zoom,
        scaleZoom,
        scale,
        layers,
        projection,
        currentLocale
    };
}

export function changePrintZoomLevel(zoom, scale) {
    return {
        type: CHANGE_PRINT_ZOOM_LEVEL,
        zoom,
        scale
    };
}

export function changeMapPrintPreview(center, zoom, bbox, size, mapStateSource, projection) {
    return {
        type: CHANGE_MAP_PRINT_PREVIEW,
        center,
        zoom,
        bbox,
        size,
        mapStateSource,
        projection
    };
}
