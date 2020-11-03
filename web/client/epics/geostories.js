/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Rx from 'rxjs';

import { MAPS_LIST_LOADING, ATTRIBUTE_UPDATED } from '../actions/maps';
import { SAVED as GEOSTORY_SAVED } from '../actions/geostory';

import {
    SEARCH_GEOSTORIES,
    DELETE_GEOSTORY,
    GEOSTORY_DELETED,
    RELOAD,
    searchGeostories as searchGeostoriesAction,
    geostoriesListLoaded,
    geostoryDeleted,
    geostoriesLoading
} from '../actions/geostories';

import { searchParamsSelector, searchTextSelector, totalCountSelector } from '../selectors/geostories';
import GeoStoreApi from '../api/GeoStoreDAO';
import { wrapStartStop } from '../observables/epics';
import { error } from '../actions/notifications';
import { deleteResource } from '../api/persistence';

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

export const searchGeostoriesOnMapSearch = action$ =>
    action$.ofType(MAPS_LIST_LOADING)
        .switchMap(({ searchText }) => Rx.Observable.of(searchGeostoriesAction(searchText)));

export const searchGeostories = (action$, { getState = () => { } }) =>
    action$.ofType(SEARCH_GEOSTORIES)
        .map( ({params, searchText, geoStoreUrl}) => ({
            searchText,
            options: {
                params: params || searchParamsSelector(getState()) || {start: 0, limit: 12},
                ...(geoStoreUrl ? { baseURL: geoStoreUrl } : {})
            }
        }))
        .switchMap(
            ({ searchText, options }) =>
                Rx.Observable.defer(() => GeoStoreApi.getResourcesByCategory("GEOSTORY", searchText, options))
                    .map(results => geostoriesListLoaded(results, {searchText, options}))
                    .let(wrapStartStop(
                        geostoriesLoading(true, "loading"),
                        geostoriesLoading(false, "loading"),
                        () => Rx.Observable.of(error({
                            title: "notification.error",
                            message: "resources.geostories.errorLoadingGeostories",
                            autoDismiss: 6,
                            position: "tc"
                        }))
                    ))
        );
export const deleteGeostory = action$ => action$
    .ofType(DELETE_GEOSTORY)
    .switchMap(id => deleteResource(id).map(() => geostoryDeleted(id)))
    .let(wrapStartStop(
        geostoriesLoading(true, "loading"),
        geostoriesLoading(false, "loading"),
        () => Rx.Observable.of(error({
            title: "notification.error",
            message: "resources.geostories.deleteError",
            autoDismiss: 6,
            position: "tc"
        }))
    ));
export const reloadOnGeostories = (action$, { getState = () => { } }) =>
    action$.ofType(GEOSTORY_DELETED, RELOAD, ATTRIBUTE_UPDATED, GEOSTORY_SAVED)
        .delay(1000) // delay as a workaround for geostore issue #178
        .switchMap( () => Rx.Observable.of(searchGeostoriesAction(
            searchTextSelector(getState()),
            calculateNewParams(getState())
        )));


export default {
    searchGeostoriesOnMapSearch,
    searchGeostories,
    deleteGeostory,
    reloadOnGeostories
};
