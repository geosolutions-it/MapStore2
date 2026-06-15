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
    REMOVE_PROJECTION_DEF,
    searchProjectionsSuccess,
    searchProjectionsError,
    loadProjectionDefError,
    addProjectionDef,
    removeProjectionDef
} from '../actions/projections';
import { MAP_CONFIG_LOADED } from '../actions/config';

import ProjectionRegistry from '../utils/ProjectionRegistry';
import { dynamicProjectionDefsSelector } from '../selectors/projections';

// libs/ajax wraps HTTP errors as { ...response, originalError } without a
// top-level .message - probe the common fields so the failure reason ends up
// in Redux instead of an undefined.
const extractErrorMessage = (error) =>
    error?.message
    || error?.statusText
    || error?.originalError?.message
    || (error ? String(error) : 'Unknown error');


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
                    return Rx.Observable.of(searchProjectionsError(extractErrorMessage(error)));
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
                    return Rx.Observable.of(loadProjectionDefError(id, extractErrorMessage(error)));
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

/**
 * Unregister a dynamic projection from ProjectionRegistry when REMOVE_PROJECTION_DEF
 * is dispatched. Mirrors registerDynamicProjectionDefEpic for the inverse action.
 */
export const unregisterDynamicProjectionDefEpic = (action$) =>
    action$.ofType(REMOVE_PROJECTION_DEF)
        .mergeMap(({ code }) => {
            if (ProjectionRegistry.isRegistered(code)) {
                ProjectionRegistry.unRegister(code);
            }
            return Rx.Observable.empty();
        });

/**
 * On MAP_CONFIG_LOADED, swap the dynamic projection defs to whatever the new
 * map carries: every def from the previous map is removed first (so it does
 * not leak across maps), then the new map's persisted defs are added. The
 * existing register/unregister epics handle the ProjectionRegistry side effect
 * for each emitted action.
 */
export const restoreDynamicProjectionDefsEpic = (action$, store) =>
    action$.ofType(MAP_CONFIG_LOADED)
        .mergeMap(({ config }) => {
            // store.getState() reads the current state - safe because the
            // reducer for MAP_CONFIG_LOADED does not touch dynamicDefs.
            const previous = dynamicProjectionDefsSelector(store.getState());
            const next = config?.map?.projections?.defs || [];
            if (!previous.length && !next.length) {
                return Rx.Observable.empty();
            }
            return Rx.Observable.from([
                ...previous.map(d => removeProjectionDef(d.code)),
                ...next.map(d => addProjectionDef(d))
            ]);
        });


export default {
    searchProjectionsEpic,
    loadProjectionDefEpic,
    registerDynamicProjectionDefEpic,
    unregisterDynamicProjectionDefEpic,
    restoreDynamicProjectionDefsEpic
};
