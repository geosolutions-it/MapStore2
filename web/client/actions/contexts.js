/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const DELETE_CONTEXT = "CONTEXTS:DELETE_CONTEXT";
export const RELOAD_CONTEXTS = "CONTEXTS:RELOAD_CONTEXTS";
export const CONTEXT_DELETED = "CONTEXTS:CONTEXT_DELETED";
export const LOADING = "CONTEXTS:LOADING";
export const CONTEXTS_LIST_LOADED = "CONTEXTS:CONTEXTS_LIST_LOADED";
export const SEARCH_CONTEXTS = "CONTEXTS:SEARCH_CONTEXTS";
export const SET_CONTEXTS_AVAILABLE = "CONTEXTS:SET_CONTEXTS_AVAILABLE";

export const setContextsAvailable = (available) => ({
    type: SET_CONTEXTS_AVAILABLE,
    available
});

export const deleteContext = (id) => ({
    type: DELETE_CONTEXT,
    id
});

export const reloadContexts = () => ({
    type: RELOAD_CONTEXTS
});

export const contextDeleted = (id) => ({
    type: CONTEXT_DELETED,
    id
});

export const contextsLoading = (value, name = "loading") => ({
    type: LOADING,
    name,
    value
});

export const contextsListLoaded = ({results, success, totalCount}, {searchText, options} = {}) => ({
    type: CONTEXTS_LIST_LOADED,
    results,
    success,
    totalCount,
    searchText,
    options
});

export const searchContexts = (searchText, params) => ({
    type: SEARCH_CONTEXTS,
    searchText,
    params
});
