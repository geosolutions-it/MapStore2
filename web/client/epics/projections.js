/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Rx from 'rxjs';

import {
    searchProjections,
    getProjectionDef
} from '../api/GeoServerProjections';

import {
    SEARCH_PROJECTIONS,
    LOAD_PROJECTION_DEF,
    ADD_PROJECTION_DEF,
    searchProjectionsSuccess,
    searchProjectionsError,
    loadProjectionDefError,
    addProjectionDef
} from '../actions/projections';

import ProjectionRegistry from '../utils/ProjectionRegistry';


/**
 * Search the GeoServer endpoint, the endpoint URL is part of the action payload (comes from plugin cfg prop),
 * so the epic needs no selector and no store reference.
 * Rx.Observable.defer(() => fn()) is used instead of Rx.Observable.from(fn())
 * so the Promise is created lazily at subscription time - this ensures switchMap
 * cancellation works correctly and no network request is made for superseded actions.
 * @param {Observable} action$
 * @returns {Observable}
 */
export const searchProjectionsEpic = (action$) =>
    action$.ofType(SEARCH_PROJECTIONS)

        .debounce(({ page }) => {
            if (page === 1) {
                return Rx.Observable.timer(300);
            }
            return Rx.Observable.empty();
        })
        .switchMap(({ endpointUrl, query, page }) => {

            if (!endpointUrl) {
                return Rx.Observable.empty();
            }
            return Rx.Observable.defer(() => searchProjections(endpointUrl, query, page))
                .map(({ results, total }) => {
                    return searchProjectionsSuccess(results, total, page);
                })
                .catch((error) => {
                    return Rx.Observable.of(searchProjectionsError(error.message));
                });
        });

/**
 * Fetch WKT for a selected search result - uses endpointUrl + id, not href
 * @param {Observable} action$
 * @returns {Observable}
 */
export const loadProjectionDefEpic = (action$) =>
    action$.ofType(LOAD_PROJECTION_DEF)
        .mergeMap(({ endpointUrl, id }) => {
            return Rx.Observable.defer(() => getProjectionDef(endpointUrl, id))
                .map((result) => {
                    return addProjectionDef({
                        code: result.code,
                        def: result.def,
                        extent: result.extent,
                        worldExtent: result.worldExtent
                    });
                })
                .catch((error) => {
                    return Rx.Observable.of(loadProjectionDefError(id, error.message));
                });
        });

/** When a projection def is added to Redux, ensure it is registered
 * in ProjectionRegistry (handles the case where ADD_PROJECTION_DEF is dispatched
 * from map config restore - registration must happen before map renders)
 * @param {Observable} action$
 * @returns {Observable}
 */
export const registerDynamicProjectionDefEpic = (action$) =>
    action$.ofType(ADD_PROJECTION_DEF)
        .mergeMap(({ def }) => {
            if (!ProjectionRegistry.isRegistered(def.code)) {
                ProjectionRegistry.register(def); // synchronous for proj4 / WKT1
            }
            return Rx.Observable.empty();
        });


export default {
    searchProjectionsEpic,
    loadProjectionDefEpic,
    registerDynamicProjectionDefEpic
};
