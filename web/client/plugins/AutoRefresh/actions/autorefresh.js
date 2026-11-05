/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const AUTOREFRESH_START = 'AUTOREFRESH:START';
export const AUTOREFRESH_STOP = 'AUTOREFRESH:STOP';
export const AUTOREFRESH_PAUSE = 'AUTOREFRESH:PAUSE';
export const AUTOREFRESH_INIT = 'AUTOREFRESH:INIT';
export const AUTOREFRESH_SET_INTERVAL = 'AUTOREFRESH:SET_INTERVAL';
export const AUTOREFRESH_NOW = 'AUTOREFRESH:NOW';
export const AUTOREFRESH_UPDATED = 'AUTOREFRESH:UPDATED';

export const autoRefreshInit = (minimumRefreshInterval) => ({ type: AUTOREFRESH_INIT, minimumRefreshInterval });
export const setAutoRefreshInterval = (key, interval) => ({ type: AUTOREFRESH_SET_INTERVAL, key, interval });
export const autoRefreshNow = key => ({ type: AUTOREFRESH_NOW, key });
export const autoRefreshUpdated = time => ({ type: AUTOREFRESH_UPDATED, time });

export const autoRefreshStart = () => {
    return {
        type: AUTOREFRESH_START,
        enabled: true
    };
};
export const autoRefreshStop = () => {
    return {
        type: AUTOREFRESH_STOP,
        enabled: false
    };
};
export const autoRefreshPause = (paused) => {
    return {
        type: AUTOREFRESH_PAUSE,
        paused
    };
};
