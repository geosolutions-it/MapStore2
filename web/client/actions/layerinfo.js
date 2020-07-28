/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SYNC_LAYERS = 'LAYERINFO:SYNC_LAYERS';
export const SELECT_LAYERS = 'LAYERINFO:SELECT_LAYERS';
export const SET_LAYERS = 'LAYERINFO:SET_LAYERS';
export const UPDATE_LAYER = 'LAYERINFO:UPDATE_LAYER';
export const RESET_SYNC_STATUS = 'LAYERINFO:RESET_SYNC_STATUS';
export const UPDATE_SYNC_STATUS = 'LAYERINFO:UPDATE_SYNC_STATUS';
export const SET_ERROR = 'LAYERINFO:SET_ERROR';
export const LOADING = 'LAYERINFO:LOADING';

export const syncLayers = (layers) => ({
    type: SYNC_LAYERS,
    layers
});

export const selectLayers = (layers) => ({
    type: SELECT_LAYERS,
    layers
});

export const setLayers = (layers) => ({
    type: SET_LAYERS,
    layers
});

export const updateLayer = (layer) => ({
    type: UPDATE_LAYER,
    layer
});

export const resetSyncStatus = (totalCount) => ({
    type: RESET_SYNC_STATUS,
    totalCount
});

export const updateSyncStatus = () => ({
    type: UPDATE_SYNC_STATUS
});

export const setError = (error) => ({
    type: SET_ERROR,
    error
});

export const loading = (value, name = "loading") => ({
    type: LOADING,
    name,
    value
});
