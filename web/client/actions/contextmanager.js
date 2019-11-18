/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SEARCH_TEXT_CHANGED = 'CONTEXTMANAGER:SEARCH_TEXT_CHANGED';
export const SEARCH_RESET = 'CONTEXTMANAGER:SEARCH_RESET';
export const SEARCH_CONTEXTS = 'CONTEXTMANAGER:SEARCH_CONTEXTS';
export const CONTEXTS_LIST_LOADED = 'CONTEXTMANAGER:CONTEXTS_LIST_LOADED';
export const LOADING = 'CONTEXTMANAGER:LOADING';
export const EDIT_CONTEXT = 'CONTEXTMANAGER:EDIT_CONTEXT';
export const DELETE_CONTEXT = 'CONTEXTMANAGER:DELETE_CONTEXT';
export const RELOAD_CONTEXTS = "CONTEXTS:RELOAD_CONTEXTS";
export const CONTEXT_DELETED = "CONTEXTS:CONTEXT_DELETED";

export const searchTextChanged = searchText => ({
    type: SEARCH_TEXT_CHANGED,
    searchText
});

export const searchReset = () => ({
    type: SEARCH_RESET
});

export const searchContexts = (text, options) => ({
    type: SEARCH_CONTEXTS,
    text,
    options
});

export const contextsListLoaded = ({results, success, totalCount}, searchText, searchOptions) => ({
    type: CONTEXTS_LIST_LOADED,
    results,
    success,
    totalCount,
    searchText,
    searchOptions
});

export const contextsLoading = (value, name = "loading") => ({
    type: LOADING,
    name,
    value
});

export const editContext = (resource) => ({
    type: EDIT_CONTEXT,
    resource
});

export const deleteContext = id => ({
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
