/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Rx = require('rxjs');
const { MAPS_LIST_LOADING } = require('../actions/maps');
const { SEARCH_DASHBOARDS, searchDashboards, dashboardListLoaded } = require('../actions/dashboards');
const GeoStoreApi = require('../api/GeoStoreDAO');
module.exports = {
   searchDashboardsOnMapSearch:
       (action$) => action$.ofType(MAPS_LIST_LOADING).switchMap(({ searchText }) => Rx.Observable.of(searchDashboards(searchText))), // TODO: maybe get default pagination
    searchDashboards: action$ => action$.ofType(SEARCH_DASHBOARDS)
            .map( ({params, searchText, geoStoreUrl}) => ({
                searchText,
                opts: {
                    params, // TODO: use default pagination
                    ...(geoStoreUrl ? { baseURL: geoStoreUrl } : {})
                }
            }))
            .switchMap(
                ({ searchText, opts }) =>
                    Rx.Observable.defer(() => GeoStoreApi.getResourcesByCategory("DASHBOARD", searchText, opts))
                        .map(results => dashboardListLoaded(results))
    )
};
