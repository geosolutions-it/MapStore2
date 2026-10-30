/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const SUPPORTED_LAYER_TYPES = ['wms', 'wfs'];

export const isPausedSelector = state => state?.autorefresh?.paused;
export const isActiveRefreshSelector = state => state?.autorefresh?.enabled;
export const refreshableLayersSelector = state => state.layers.flat.filter(l => l.group !== 'background' && l.autoRefreshInterval > -1);

// Do not consider background layers, since they are not expected to be updated frequently
// and they are not visible in the layer switcher,
// so they cannot be selected by the user in the settings
export const availableLayersSelector = state => state.layers.flat.filter(l => {
    const isBasemap = l.group === 'background';
    const hasAutoRefreshInterval = l.autoRefreshInterval && l.autoRefreshInterval > -1;
    const isSupportedLayerType = SUPPORTED_LAYER_TYPES.includes(l.type);

    return isSupportedLayerType && !isBasemap && !hasAutoRefreshInterval;
});

