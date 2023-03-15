/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Rx from 'rxjs';
import { replace, LOCATION_CHANGE } from 'connected-react-router';

import { MAP_CONFIG_LOADED } from '../actions/config';
import { changeVisualizationMode, VISUALIZATION_MODE_CHANGED } from '../actions/maptype';
import { visualizationModeSelector } from '../selectors/maptype';
import {
    findMapType,
    removeMapType,
    getVisualizationModeFromMapLibrary,
    getDefaultVisualizationMode
} from '../utils/MapTypeUtils';

import { DASHBOARD_RESET } from '../actions/dashboard';
import { LOAD_GEOSTORY } from '../actions/geostory';

/**
 * Keep in sync mapType in state with mapType in URL.
 * @memberof epics.maptype
 * @param  {external:Observable} action$ the stream of actions, acts on `LOCATION_CHANGE`
 * @param  {object} store   the store middleware API from redux `createMiddleware`
 * @return {external:Observable}  the stream of the actions to emit. (`changeVisualizationMode`)
 */
export const syncMapType = (action$, store) =>
    Rx.Observable.merge(
        // when location change and the mapType intercepted in the hash is different, update the map type.
        // It means that the URL has been used from external link
        action$.ofType(LOCATION_CHANGE, MAP_CONFIG_LOADED)
            .filter((action) => {
                const isFirstRendering = action?.payload?.isFirstRendering === true;
                if (isFirstRendering) {
                    return false;
                }
                const state = store.getState();
                const pathname = action?.payload?.location?.pathname || state?.router?.location?.pathname;
                const hashMapType = findMapType(pathname);
                return !!hashMapType;
            })
            .switchMap((action) => {
                const state = store.getState();
                const pathname = action?.payload?.location?.pathname || state?.router?.location?.pathname;
                return Rx.Observable.of(
                    changeVisualizationMode(
                        getVisualizationModeFromMapLibrary(
                            findMapType(pathname)
                        )
                    )
                );
            }),
        // when map type change, if the URL hash matches with one of the URLs that includes the maptype, update it
        // this when map type is changed using the action or not the URL
        // NOTE: the action can be used anywhere, even if the URL do not include the mapType.
        action$.ofType(VISUALIZATION_MODE_CHANGED)
            .switchMap(() => {
                const state = store.getState();
                const pathname = state?.router?.location?.pathname;
                const hashMapType = findMapType(pathname);
                // if the URL hash contains the mapType and it is not in sync with the new path, syncronize
                if (hashMapType) {
                    const newPath = removeMapType(pathname);
                    // in this case the URL change
                    if (newPath !== pathname) {
                        return Rx.Observable.of(replace(newPath));
                    }
                }
                return Rx.Observable.empty();
            })
    );

/**
 * Restores default visualization mode for dashboard and geostories
 */
export const restoreDefaultVisualizationMode = (action$, store) => {
    return action$.ofType(DASHBOARD_RESET, LOAD_GEOSTORY)
        .filter(() => visualizationModeSelector(store.getState()) !== getDefaultVisualizationMode())
        .switchMap(() => {
            return Rx.Observable.of(changeVisualizationMode(getDefaultVisualizationMode()));
        });
};
/**
 * Epics for maptype switch functionalities
 * @name epics.maptype
 * @type {Object}
 */
export default {
    syncMapType,
    restoreDefaultVisualizationMode
};
