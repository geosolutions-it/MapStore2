/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Rx = require('rxjs');
const { MAPS_LIST_LOADING, ATTRIBUTE_UPDATED} = require('../actions/maps');

const { SAVED: GEOSTORY_SAVED } = require('../actions/geostory');

const { SEARCH_GEOSTORIES, DELETE_GEOSTORY, GEOSTORY_DELETED, RELOAD, searchGeostories, geostoriesListLoaded, geostoryDeleted, geostoriesLoading } = require('../actions/geostories');
const { searchParamsSelector, searchTextSelector, totalCountSelector} = require('../selectors/geostories');
const GeoStoreApi = require('../api/GeoStoreDAO');
const { wrapStartStop } = require('../observables/epics');
const {error} = require('../actions/notifications');

const {deleteResource} = require('../api/persistence');

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

module.exports = {
    searchGeostoriesOnMapSearch: action$ =>
        action$.ofType(MAPS_LIST_LOADING)
            .switchMap(({ searchText }) => Rx.Observable.of(searchGeostories(searchText))),
    searchGeostories: (action$, { getState = () => { } }) =>
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
            ),
    deleteGeostory: action$ => action$
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
        )),
    reloadOnGeostories: (action$, { getState = () => { } }) =>
        action$.ofType(GEOSTORY_DELETED, RELOAD, ATTRIBUTE_UPDATED, GEOSTORY_SAVED)
            .delay(1000) // delay as a workaround for geostore issue #178
            .switchMap( () => Rx.Observable.of(searchGeostories(
                searchTextSelector(getState()),
                calculateNewParams(getState())
            )))
};
