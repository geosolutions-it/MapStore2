/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const LOAD_CONTEXT = "CONTEXT:LOAD";
export const CONTEXT_LOADED  = "CONTEXT:LOADED";
export const SET_RESOURCE = "CONTEXT:SET_RESOURCE";

/**
 *
 * @param {ojbect} params params of the context page
 * @param {string|number} contextId id of the context to load
 * @param {string|number} mapId id of the map to load in the context
 */
export const loadContext = ({mapId, contextId}) => ({type: LOAD_CONTEXT, mapId, contextId});

export const contextLoaded = ({context}) =>
