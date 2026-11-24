/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Refresh interval defaults, layer patches and date formatting helpers.
 * @memberof utils
 * @static
 * @name AutoRefreshConstants
 */

export const CONTROL_NAME = "autorefresh";
export const AUTOREFRESH_STEP_INTERVAL_IN_SECONDS = 5;
export const AUTOREFRESH_MINIMUM_REFRESH_INTERVAL = 30000;
export const AUTOREFRESH_DEFAULT_REFRESH_INTERVAL = 60000;
export const AUTOREFRESH_MAXIMUM_REFRESH_INTERVAL = 2147483647;

/**
 * Build a layer property patch for the refresh settings callbacks.
 * @function generateAutoRefreshLayerOptions
 * @param {number} [interval] Interval in milliseconds; undefined removes the saved setting.
 * @returns {object} Layer patch containing autoRefreshInterval.
 * @memberof utils.AutoRefreshConstants
 */
export const generateAutoRefreshLayerOptions = (interval) => ({
    autoRefreshInterval: interval
});

/**
 * Formats a timestamp into a human-readable date string.
 * @function formatDate
 * @param {number} timestamp Unix timestamp in milliseconds.
 * @returns {string} Date and time in the browser's locale and timezone, or an empty string for a falsy timestamp.
 * @memberof utils.AutoRefreshConstants
 */
export const formatDate = (timestamp) => {
    if (!timestamp) {
        return '';
    }

    const date = new Date(timestamp);

    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: new Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    return `${date.toLocaleString(navigator.language, options)}`;
};
