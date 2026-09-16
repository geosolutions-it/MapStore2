/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const AUTOREFRESH_START = 'AUTOREFRESH:START';
export const AUTOREFRESH_STOP = 'AUTOREFRESH:STOP';
export const AUTOREFRESH_TICK = 'AUTOREFRESH:TICK';
export const AUTOREFRESH_UPDATE_ACTIVE_LAYER = 'AUTOREFRESH:UPDATE_ACTIVE_LAYER';
export const AUTOREFRESH_DELETE_ACTIVE_LAYER = 'AUTOREFRESH:DELETE_ACTIVE_LAYER';
export const AUTOREFRESH_UPDATE_AVAILABLE_LAYERS = 'AUTOREFRESH:UPDATE_AVAILABLE_LAYERS';
export const AUTOREFRESH_UPDATE_ACTIVE_LAYERS = 'AUTOREFRESH:UPDATE_ACTIVE_LAYERS';


export const autorefreshStart = () => {
    return {
        type: AUTOREFRESH_START,
        enabled: true
    };
};

export const autorefreshTick = (ticks) => {
    return {
        type: AUTOREFRESH_TICK,
        ticks
    };
};

export const autorefreshStop = () => {
    return {
        type: AUTOREFRESH_STOP,
        enabled: false
    };
};

export const autorefreshUpdateActiveLayer = (layer) => {
    return {
        type: AUTOREFRESH_UPDATE_ACTIVE_LAYER,
        layer
    };
};

export const autorefreshDeleteActiveLayer = (layerId) => {
    return {
        type: AUTOREFRESH_DELETE_ACTIVE_LAYER,
        layerId
    };
};

export const autorefreshUpdateAvailableLayers = (layers) => {
    return {
        type: AUTOREFRESH_UPDATE_AVAILABLE_LAYERS,
        availableLayers: layers
    };
};

export const autorefreshUpdateActiveLayers = (layers) => {
    return {
        type: AUTOREFRESH_UPDATE_ACTIVE_LAYERS,
        activeLayers: layers
    };
};
