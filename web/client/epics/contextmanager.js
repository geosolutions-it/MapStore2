/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Rx from 'rxjs';
import {push} from 'connected-react-router';
import GeoStoreApi from '../api/GeoStoreDAO';
import {wrapStartStop} from '../observables/epics';
import {error} from '../actions/notifications';
import {deleteResource} from '../api/persistence';

import {searchTextSelector, searchOptionsSelector, totalCountSelector} from '../selectors/contextmanager';
import {ATTRIBUTE_UPDATED} from '../actions/maps';
import {CONTEXT_SAVED, clearContextCreator} from '../actions/contextcreator';
import {SEARCH_CONTEXTS, DELETE_CONTEXT, EDIT_CONTEXT, SEARCH_RESET, CONTEXT_DELETED, RELOAD_CONTEXTS,
    contextDeleted, contextsListLoaded, contextsLoading, searchContexts} from '../actions/contextmanager';

const calculateNewParams = state => {
    const totalCount = totalCountSelector(state);
    const searchOptions = searchOptionsSelector(state) || {};
    const {start, limit, ...otherParams} = searchOptions.params;
    if (start === totalCount - 1) {
        return {
            start: Math.max(0, start - limit),
            limit
        };
    }
    return {
        ...searchOptions,
        params: {
            ...otherParams,
            start,
            limit
        }
    };
};

export const searchContextsEpic = action$ => action$
    .ofType(SEARCH_CONTEXTS)
    .map(({text, options}) => ({
        text,
        options: options || {params: {start: 0, limit: 12}}
    }))
    .switchMap(({text, options}) =>
        Rx.Observable.defer(() => GeoStoreApi.getResourcesByCategory("CONTEXT", text, options))
            .map(results => contextsListLoaded(results, text, options))
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

export const editContext = action$ => action$
    .ofType(EDIT_CONTEXT)
    .switchMap(({resource}) => resource ?
        Rx.Observable.of(
            clearContextCreator(),
            push(`/context-creator/${resource.id}`)
        ) :
        Rx.Observable.empty()
    );

export const deleteContextEpic = action$ => action$
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

export const resetContextSearch = action$ => action$
    .ofType(SEARCH_RESET)
    .switchMap(() => Rx.Observable.of(searchContexts('', {params: {start: 0, limit: 12}})));

export const reloadOnContexts = (action$, store) => action$
    .ofType(CONTEXT_DELETED, RELOAD_CONTEXTS, ATTRIBUTE_UPDATED, CONTEXT_SAVED)
    .delay(1000)
    .switchMap(() => Rx.Observable.of(searchContexts(
        searchTextSelector(store.getState()),
        calculateNewParams(store.getState())
    )));
