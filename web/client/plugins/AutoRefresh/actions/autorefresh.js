/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Actions for configuring and controlling automatic dataset refreshes.
 * @name actions.autorefresh
 */

export const AUTOREFRESH_START = 'AUTOREFRESH:START';
export const AUTOREFRESH_STOP = 'AUTOREFRESH:STOP';
export const AUTOREFRESH_PAUSE = 'AUTOREFRESH:PAUSE';
export const AUTOREFRESH_INIT = 'AUTOREFRESH:INIT';
export const AUTOREFRESH_SET_INTERVAL = 'AUTOREFRESH:SET_INTERVAL';
export const AUTOREFRESH_NOW = 'AUTOREFRESH:NOW';
export const AUTOREFRESH_UPDATED = 'AUTOREFRESH:UPDATED';

/**
 * Initialize the minimum interval enforced by the refresh scheduler.
 * @function autoRefreshInit
 * @param {number} minimumRefreshInterval Minimum refresh interval in milliseconds.
 * @returns {object} AUTOREFRESH_INIT action.
 * @memberof actions.autorefresh
 */
export const autoRefreshInit = (minimumRefreshInterval) => ({ type: AUTOREFRESH_INIT, minimumRefreshInterval });

/**
 * Request an interval change for every map/widget instance of a dataset.
 * @function setAutoRefreshInterval
 * @param {string} key Dataset identity returned by getLayerRefreshKey.
 * @param {number} [interval] Interval in milliseconds; undefined removes the configuration.
 * @returns {object} AUTOREFRESH_SET_INTERVAL action.
 * @memberof actions.autorefresh
 */
export const setAutoRefreshInterval = (key, interval) => ({ type: AUTOREFRESH_SET_INTERVAL, key, interval });

/**
 * Request an immediate refresh of eligible datasets, even when automatic refresh is stopped.
 * @function autoRefreshNow
 * @param {string} [key] Dataset identity; omit to refresh all eligible datasets.
 * @returns {object} AUTOREFRESH_NOW action.
 * @memberof actions.autorefresh
 */
export const autoRefreshNow = key => ({ type: AUTOREFRESH_NOW, key });

/**
 * Record when a refresh was dispatched.
 * @function autoRefreshUpdated
 * @param {number} time Unix timestamp in milliseconds.
 * @returns {object} AUTOREFRESH_UPDATED action.
 * @memberof actions.autorefresh
 */
export const autoRefreshUpdated = time => ({ type: AUTOREFRESH_UPDATED, time });

/**
 * Attach widget layer patches to a layer action so both reducers update in one dispatch.
 * @function withWidgetLayerUpdates
 * @param {object} action The layer action to decorate without mutation.
 * @param {object[]} [widgetUpdates=[]] Widget layer patches to apply with the layer action.
 * @returns {object} The decorated action, or the original action when there are no widget updates.
 * @memberof actions.autorefresh
 */
export const withWidgetLayerUpdates = (action, widgetUpdates = []) =>
    widgetUpdates.length ? { ...action, widgetUpdates } : action;

/**
 * Enable automatic refresh timers for eligible datasets.
 * @function autoRefreshStart
 * @returns {object} AUTOREFRESH_START action with enabled set to true.
 * @memberof actions.autorefresh
 */
export const autoRefreshStart = () => {
    return {
        type: AUTOREFRESH_START,
        enabled: true
    };
};
/**
 * Stop automatic refresh timers and clear the paused state.
 * @function autoRefreshStop
 * @returns {object} AUTOREFRESH_STOP action with enabled set to false.
 * @memberof actions.autorefresh
 */
export const autoRefreshStop = () => {
    return {
        type: AUTOREFRESH_STOP,
        enabled: false
    };
};
/**
 * Suspend or resume automatic and immediate refreshes without changing activation.
 * @function autoRefreshPause
 * @param {boolean} paused Whether refreshes should be suspended.
 * @returns {object} AUTOREFRESH_PAUSE action.
 * @memberof actions.autorefresh
 */
export const autoRefreshPause = (paused) => {
    return {
        type: AUTOREFRESH_PAUSE,
        paused
    };
};
