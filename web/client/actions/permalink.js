/**
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const LOAD_PERMALINK = "PERMALINK:LOAD";
export const PERMALINK_LOADED = "PERMALINK:LOADED";
export const LOAD_PERMALINK_ERROR = "PERMALINK:LOAD_ERROR";
export const SAVE_PERMALINK = "PERMALINK:SAVE";
export const UPDATE_SETTINGS = "PERMALINK:UPDATE_SETTINGS";
export const LOADING = "PERMALINK:LOADING";
export const RESET = "PERMALINK:RESET";

/**
 * Load permalink
 * @param {string} id
 * @memberof actions.permalink
*/
export const loadPermalink = (id) => ({
    type: LOAD_PERMALINK,
    id
});

/**
 * Trigger on permalink loaded
 * @memberof actions.permalink
*/
export const permalinkLoaded = () => ({
    type: PERMALINK_LOADED
});

/**
 * Trigger on permalink load error
 * @param {Object} error
 * @memberof actions.permalink
*/
export const loadPermalinkError = (error) => ({
    type: LOAD_PERMALINK_ERROR,
    error
});

/**
 * Trigger on save permalink
 * @param {Object} value
 * @memberof actions.permalink
*/
export const savePermalink = (value) => ({
    type: SAVE_PERMALINK,
    value
});

/**
 * Trigger on update permalink settings
 * @param {Object} settings
 * @memberof actions.permalink
*/
export const updatePermalinkSettings = (settings) => ({
    type: UPDATE_SETTINGS,
    settings
});

/**
 * Trigger on loading a permalink
 * @param {boolean} loading
 * @memberof actions.permalink
*/
export const permalinkLoading = (loading) => ({
    type: LOADING,
    loading
});

/**
 * Trigger on permalink reset
 * @memberof actions.permalink
*/
export const resetPermalink = () => ({
    type: RESET
});
