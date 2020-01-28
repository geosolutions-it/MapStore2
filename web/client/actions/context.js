/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


export const LOAD_CONTEXT = "CONTEXT:LOAD";
/**
 * Triggers context loading flow
 * @param {object} params params of the context page
 * @param {string|number} contextId id of the context to load
 * @param {string|number} mapId id of the map to load in the context
 */
export const loadContext = ({ mapId, contextName }) => ({ type: LOAD_CONTEXT, mapId, contextName });


export const SET_CURRENT_CONTEXT = "CONTEXT:SET_CURRENT_CONTEXT";
/**
 * Sets the context passed in the state
 * @param {object} context the context
 */
export const setContext = (context) => ({ type: SET_CURRENT_CONTEXT, context });

export const LOADING = "CONTEXT:LOADING";
/**
 * Set loading flag
 * @param {boolean} value the value of the flag
 * @param {string} [name] the name of the flag to set. loading is anyway always triggered
 */
export const loading = (value, name = "loading") => ({
    type: LOADING,
    name,
    value
});

export const SET_RESOURCE = "CONTEXT:SET_RESOURCE";
/**
 * Sets the original resource in the context state
 * @param {object} resource the resource
 */
export const setResource = resource => ({ type: SET_RESOURCE, resource });

export const CONTEXT_LOAD_ERROR = "CONTEXT:CONTEXT_LOAD_ERROR";

/**
 * Notifies an error occurred during context loading
 * @param {error} error the error triggered
 */
export const contextLoadError = ({ error }) => ({ type: CONTEXT_LOAD_ERROR, error });

export const LOAD_FINISHED = "CONTEXT:CONTEXT_LOAD_FINISHED";
/**
 * Notifies the context load has been finished.
 */
export const loadFinished = () => ({ type: LOAD_FINISHED });

export const CLEAR_CONTEXT = 'CONTEXT:CLEAR_CONTEXT';
/**
 * Clears current context state
 */
export const clearContext = () => ({ type: CLEAR_CONTEXT });

export const UPDATE_USER_PLUGIN = "CONTEXT:UPDATE_USER_PLUGIN";
/**
 * Updates a value for a user plugin. It can be used to activate/deactivate user plugins, or to set specific
 * properties.
 * @param {string} name the name of the plugin
 * @param {object} values key-values map to update.
 * @example
 * updateUserPlugin("Annotations", {active: true})
 */
export const updateUserPlugin = (name, values) => ({ type: UPDATE_USER_PLUGIN, name, values});

export const OPEN_MAP_TEMPLATES_PANEL = 'CONTEXT:OPEN_MAP_TEMPLATES_PANEL';
export const openMapTemplatesPanel = () => ({ type: OPEN_MAP_TEMPLATES_PANEL });

export const SET_MAP_TEMPLATES_LOADED = 'CONTEXT:SET_MAP_TEMPLATES_LOADED';
export const setMapTemplatesLoaded = (loaded, error) => ({ type: SET_MAP_TEMPLATES_LOADED, loaded, error });

export const SET_TEMPLATE_DATA = 'CONTEXT:SET_TEMPLATE_DATA';
export const setTemplateData = (id, data) => ({ type: SET_TEMPLATE_DATA, id, data });

export const SET_TEMPLATE_LOADING = 'CONTEXT_SET_TEMPLATE_LOADING';
export const setTemplateLoading = (id, loadingValue) => ({ type: SET_TEMPLATE_LOADING, id, loadingValue });

export const MERGE_TEMPLATE = 'CONTEXT:MERGE_TEMPLATE';
export const mergeTemplate = (id) => ({ type: MERGE_TEMPLATE, id });

export const REPLACE_TEMPLATE = 'CONTEXT:REPLACE_TEMPLATE';
export const replaceTemplate = (id) => ({ type: REPLACE_TEMPLATE, id });

export const TOGGLE_FAVOURITE_TEMPLATE = 'CONTEXT:TOGGLE_FAVOURITE_TEMPLATE';
export const toggleFavouriteTemplate  = (id) => ({ type: TOGGLE_FAVOURITE_TEMPLATE, id });
