/**
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/*
    projections state:
    {
        staticDefs: [],          ← from localConfig.json, set once at startup
        dynamicDefs: [],         ← added from endpoint during session or restored from map config
        search: {
            loading: false,
            results: [],           ← [{ id, href }] - accumulated across pages for infinite scroll
            total: 0,              ← total results count from the endpoint
            page: 1,               ← last loaded page (internal - not shown in UI)
            pageSize: 10,          ← page size sent to endpoint
            loadingDefs: [],       ← ids currently being fetched (WKT second request in flight)
            failedDefs: {},        ← { id: errorMessage } for ids whose fetch failed
            error: null
        }
    }
*/

import {
    REGISTER_STATIC_PROJECTION_DEFS,
    ADD_PROJECTION_DEF,
    REMOVE_PROJECTION_DEF,
    SEARCH_PROJECTIONS,
    SEARCH_PROJECTIONS_SUCCESS,
    SEARCH_PROJECTIONS_ERROR,
    CLEAR_PROJECTION_SEARCH,
    LOAD_PROJECTION_DEF,
    LOAD_PROJECTION_DEF_ERROR } from '../actions/projections';

const PAGE_SIZE = 10;
const defaultSearch = { loading: false, results: [], total: 0, page: 1, pageSize: PAGE_SIZE, loadingDefs: [], failedDefs: {}, error: null };
const defaultState = { staticDefs: [], dynamicDefs: [], search: defaultSearch };

export default function projections(state = defaultState, action) {
    switch (action.type) {
    case REGISTER_STATIC_PROJECTION_DEFS:
        return { ...state, staticDefs: action.defs || [] };
    case ADD_PROJECTION_DEF: {
        // Guard against duplicates
        const exists = state.dynamicDefs.some(d => d.code === action.def.code);
        if (exists) {
            return state;
        }
        // Also remove from loadingDefs - the WKT fetch for this id has completed
        const newLoadingDefs = state.search.loadingDefs.filter(id => id !== action.def.code);
        return {
            ...state,
            dynamicDefs: [...state.dynamicDefs, action.def],
            search: { ...state.search, loadingDefs: newLoadingDefs }
        };
    }
    case REMOVE_PROJECTION_DEF:
        return {
            ...state,
            dynamicDefs: state.dynamicDefs.filter(d => d.code !== action.code)
        };
    case SEARCH_PROJECTIONS:
        // Page 1 = new query: clear existing results. Page > 1 = load more: keep them.
        if (action.page === 1) {
            return { ...state, search: { ...state.search, loading: true, error: null, results: [], page: 1 } };
        }
        return { ...state, search: { ...state.search, loading: true, error: null } };
    case SEARCH_PROJECTIONS_SUCCESS: {
        // Page 1 replaces results; subsequent pages append (infinite scroll)
        const merged = action.page === 1
            ? action.results
            : [...state.search.results, ...action.results];
        return { ...state, search: { ...state.search, loading: false, results: merged, total: action.total, page: action.page, error: null } };
    }
    case SEARCH_PROJECTIONS_ERROR: {
        // On page-1 errors clear the list (the user is starting a new query
        // and the previous results are no longer relevant). On page>1 errors
        // (load-more failed) keep what we already have so the user does not
        // lose results that loaded successfully on earlier pages.
        const isFirstPage = state.search.page <= 1;
        return {
            ...state,
            search: {
                ...state.search,
                loading: false,
                results: isFirstPage ? [] : state.search.results,
                total: isFirstPage ? 0 : state.search.total,
                error: action.error
            }
        };
    }
    case CLEAR_PROJECTION_SEARCH:
        return { ...state, search: defaultSearch };
    case LOAD_PROJECTION_DEF: {
        // Clear any prior failure marker on retry.
        const { [action.id]: _ignored, ...remainingFailed } = state.search.failedDefs || {};
        return {
            ...state,
            search: {
                ...state.search,
                loadingDefs: [...state.search.loadingDefs, action.id],
                failedDefs: remainingFailed
            }
        };
    }
    case LOAD_PROJECTION_DEF_ERROR:
        return {
            ...state,
            search: {
                ...state.search,
                loadingDefs: state.search.loadingDefs.filter(id => id !== action.id),
                failedDefs: { ...(state.search.failedDefs || {}), [action.id]: action.error }
            }
        };
    default:
        return state;
    }
}
