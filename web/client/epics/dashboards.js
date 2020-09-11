/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Rx = require('rxjs');
const { MAPS_LIST_LOADING, ATTRIBUTE_UPDATED} = require('../actions/maps');
const { MAP_DELETED } = require('../actions/maps');
const { DASHBOARD_SAVED } = require('../actions/dashboard');

const { SEARCH_DASHBOARDS, DELETE_DASHBOARD, DASHBOARD_DELETED, RELOAD, searchDashboards, dashboardListLoaded, dashboardDeleted, dashboardsLoading } = require('../actions/dashboards');
const { searchParamsSelector, searchTextSelector, totalCountSelector} = require('../selectors/dashboards');
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
    searchDashboardsOnMapSearch: action$ =>
        action$.ofType(MAPS_LIST_LOADING)
            .switchMap(({ searchText }) => Rx.Observable.of(searchDashboards(searchText))),
    searchDashboards: (action$, { getState = () => { } }) =>
        action$.ofType(SEARCH_DASHBOARDS)
            .map( ({params, searchText, geoStoreUrl}) => ({
                searchText,
                options: {
                    params: params || searchParamsSelector(getState()) || {start: 0, limit: 12},
                    ...(geoStoreUrl ? { baseURL: geoStoreUrl } : {})
                }
            }))
            .switchMap(
                ({ searchText, options }) =>
                    Rx.Observable.defer(() => GeoStoreApi.getResourcesByCategory("DASHBOARD", searchText, options))
                        .map(results => dashboardListLoaded(results, {searchText, options}))
                        .let(wrapStartStop(
                            dashboardsLoading(true, "loading"),
                            dashboardsLoading(false, "loading"),
                            () => Rx.Observable.of(error({
                                title: "notification.error",
                                message: "resources.dashboards.errorLoadingDashboards",
                                autoDismiss: 6,
                                position: "tc"
                            }))
                        ))
            ),
    deleteDashboard: action$ => action$
        .ofType(DELETE_DASHBOARD)
        .switchMap(id => deleteResource(id).map(() => dashboardDeleted(id)))
        .let(wrapStartStop(
            dashboardsLoading(true, "loading"),
            dashboardsLoading(false, "loading"),
            () => Rx.Observable.of(error({
                title: "notification.error",
                message: "resources.dashboards.deleteError",
                autoDismiss: 6,
                position: "tc"
            }))
        )),
    reloadOnDashboards: (action$, { getState = () => { } }) =>
        action$.ofType(DASHBOARD_DELETED, MAP_DELETED, RELOAD, ATTRIBUTE_UPDATED, DASHBOARD_SAVED)
            .delay(1000) // delay as a workaround for geostore issue #178
            .switchMap( () => Rx.Observable.of(searchDashboards(
                searchTextSelector(getState()),
                calculateNewParams(getState())
            )))
};
