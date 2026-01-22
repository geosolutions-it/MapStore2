/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SET_LAYERIDS = 'AUTOREFRESH:SET_LAYERIDS';
export const SET_ENABLED = 'AUTOREFRESH:SET_ENABLED';
export const SET_INTERVAL = 'AUTOREFRESH:SET_INTERVAL';

export const setLayerIds = (layerIds) => {
    return {
        type: SET_LAYERIDS,
        layerIds
    };
};

export const setEnabled = (enabled) => {
    return {
        type: SET_ENABLED,
        enabled
    };
};

export const setInterval = (interval) => {
    return {
        type: SET_INTERVAL,
        interval
    };
};
