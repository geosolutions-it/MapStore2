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
export const loadContext = ({mapId, contextId}) => ({type: LOAD_CONTEXT, mapId, contextId});


export const SET_CURRENT_CONTEXT = "CONTEXT:SET_CURRENT_CONTEXT";
/**
 *
 * @param {object} context
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
export const setResource = resource => ({type: SET_RESOURCE, resource});
