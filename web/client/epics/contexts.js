/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Rx from 'rxjs';
import {MAPS_LIST_LOADING, ATTRIBUTE_UPDATED} from '../actions/maps';

import {CONTEXT_SAVED} from '../actions/contextcreator';

import {SEARCH_CONTEXTS, DELETE_CONTEXT, CONTEXT_DELETED, RELOAD_CONTEXTS,
    searchContexts, contextsListLoaded, contextDeleted, contextsLoading} from '../actions/contexts';
import {searchParamsSelector, searchTextSelector, totalCountSelector} from '../selectors/contexts';
import GeoStoreApi from '../api/GeoStoreDAO';
import {wrapStartStop} from '../observables/epics';
import {error} from '../actions/notifications';

import {deleteResource} from '../api/persistence';

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


export const searchContextsOnMapSearch = action$ =>
    action$.ofType(MAPS_LIST_LOADING)
        .switchMap(({ searchText }) => Rx.Observable.of(searchContexts(searchText)));

export const searchContextsEpic = (action$, { getState = () => { } }) =>
    action$.ofType(SEARCH_CONTEXTS)
        .map(({params, searchText, geoStoreUrl}) => ({
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

export const deleteContext = action$ => action$
    .ofType(DELETE_CONTEXT)
    .switchMap(id => deleteResource(id).map(() => contextDeleted(id)))
    .let(wrapStartStop(
        contextsLoading(true, "loading"),
        contextsLoading(false, "loading"),
        () => Rx.Observable.of(error({
            title: "notification.error",
            message: "resources.contexts.deleteError",
            autoDismiss: 6,
            position: "tc"
        }))
    ));

export const reloadOnContexts = (action$, { getState = () => {} }) =>
    action$.ofType(CONTEXT_DELETED, RELOAD_CONTEXTS, ATTRIBUTE_UPDATED, CONTEXT_SAVED)
        .delay(1000) // delay as a workaround for geostore issue #178
        .switchMap( () => Rx.Observable.of(searchContexts(
            searchTextSelector(getState()),
            calculateNewParams(getState())
        )));
