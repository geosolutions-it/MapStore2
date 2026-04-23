/**
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const REGISTER_STATIC_PROJECTION_DEFS = 'PROJECTIONS:REGISTER_STATIC';
export const ADD_PROJECTION_DEF = 'PROJECTIONS:ADD_DEF';
export const SEARCH_PROJECTIONS = 'PROJECTIONS:SEARCH';
export const SEARCH_PROJECTIONS_SUCCESS = 'PROJECTIONS:SEARCH_SUCCESS';
export const SEARCH_PROJECTIONS_ERROR = 'PROJECTIONS:SEARCH_ERROR';
export const CLEAR_PROJECTION_SEARCH = 'PROJECTIONS:CLEAR_SEARCH';
export const LOAD_PROJECTION_DEF = 'PROJECTIONS:LOAD_DEF';        // fetch WKT from href
export const LOAD_PROJECTION_DEF_ERROR = 'PROJECTIONS:LOAD_DEF_ERROR';

export const registerStaticProjectionDefs = (defs) => ({ type: REGISTER_STATIC_PROJECTION_DEFS, defs });
export const addProjectionDef = (def) => ({ type: ADD_PROJECTION_DEF, def });
export const searchProjections = (endpointUrl, query, page = 1) => ({ type: SEARCH_PROJECTIONS, endpointUrl, query, page });
export const searchProjectionsSuccess = (results, total, page) => ({ type: SEARCH_PROJECTIONS_SUCCESS, results, total, page });
export const searchProjectionsError = (error) => ({ type: SEARCH_PROJECTIONS_ERROR, error });
export const clearProjectionSearch = () => ({ type: CLEAR_PROJECTION_SEARCH });
// Triggered when the user checks a result item - fetches WKT using endpointUrl + id
export const loadProjectionDef = (endpointUrl, id) => ({ type: LOAD_PROJECTION_DEF, endpointUrl, id });
export const loadProjectionDefError = (id, error) => ({ type: LOAD_PROJECTION_DEF_ERROR, id, error });
