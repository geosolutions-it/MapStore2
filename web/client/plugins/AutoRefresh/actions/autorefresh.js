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
