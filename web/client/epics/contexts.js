/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Rx from 'rxjs';
import GeoStoreApi from '../api/GeoStoreDAO';
import {wrapStartStop} from '../observables/epics';
import {error} from '../actions/notifications';

import {ATTRIBUTE_UPDATED, MAPS_LIST_LOADING} from '../actions/maps';

import {
    SEARCH_CONTEXTS,
    CONTEXT_DELETED,
    RELOAD_CONTEXTS,
    SET_CONTEXTS_AVAILABLE,
    searchContexts, contextsListLoaded, contextsLoading } from "../actions/contexts";
import {searchParamsSelector, searchTextSelector, totalCountSelector} from "../selectors/contexts";

import {CONTEXT_SAVED} from "../actions/contextcreator";

const calculateNewParams = state => {
    const totalCount = totalCountSelector(state);
    const {start, limit, ...params} = searchParamsSelector(state) || {};
    if (start === totalCount - 1) {
        return {
            start: Math.max(0, start - limit),
            limit
        };
    }
    return {
        start, limit, ...params
    };
};

export const searchContextsOnMapSearch = (action$, store) =>
    action$.ofType(MAPS_LIST_LOADING, SET_CONTEXTS_AVAILABLE)
        .switchMap(({ searchText }) => {
            const state = store.getState();
            if (state.contexts?.available) {
                return Rx.Observable.of(searchContexts(searchText));
            }
            return Rx.Observable.empty();
        });

export const searchContextsEpic = (action$, { getState = () => { } }) => action$
    .ofType(SEARCH_CONTEXTS)
    .map( ({params, searchText, geoStoreUrl}) => ({
        searchText,
        options: {
            params: params || searchParamsSelector(getState()) || {start: 0, limit: 12},
            ...(geoStoreUrl ? { baseURL: geoStoreUrl } : {})
        }
    }))
    .switchMap(
        ({ searchText, options }) =>
            Rx.Observable.defer(() => GeoStoreApi.getResourcesByCategory("CONTEXT", searchText, options))
                .map(results => contextsListLoaded(results, {searchText, options}))
                .let(wrapStartStop(
                    contextsLoading(true, "loading"),
                    contextsLoading(false, "loading"),
                    () => Rx.Observable.of(error({
                        title: "notification.error",
                        message: "resources.contexts.errorLoadingContexts",
                        autoDismiss: 6,
                        position: "tc"
                    }))
                ))
    );

export const reloadOnContexts = (action$, store) => action$
    .ofType(CONTEXT_DELETED, RELOAD_CONTEXTS, ATTRIBUTE_UPDATED, CONTEXT_SAVED)
    .delay(1000)
    .switchMap(() => {
        const state = store.getState();
        if (state.contexts.available) {
            return Rx.Observable.of(searchContexts(
                searchTextSelector(store.getState()),
                calculateNewParams(store.getState())
            ));
        }
        return Rx.Observable.empty();
    });
