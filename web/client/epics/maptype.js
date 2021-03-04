/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Rx from 'rxjs';
import { push, LOCATION_CHANGE } from 'connected-react-router';

import { changeMapType, updateLast2dMapType, MAP_TYPE_CHANGED } from '../actions/maptype';
import { mapTypeSelector, isCesium, last2dMapTypeSelector } from '../selectors/maptype';
import { findMapType, replaceMapType } from '../utils/MapTypeUtils';

import { LOCAL_CONFIG_LOADED } from '../actions/localConfig';


/**
 * Keep in sync mapType in state with mapType in URL.
 * @memberof epics.maptype
 * @param  {external:Observable} action$ the stream of actions, acts on `LOCATION_CHANGE`
 * @param  {object} store   the store middleware API from redux `createMiddleware`
 * @return {external:Observable}  the stream of the actions to emit. (`changeMapType`)
 */
export const syncMapType = (action$, store) =>
    Rx.Observable.merge(
        // when location change and the mapType intercepted in the hash is different, update the map type.
        // It means that the URL has been used from external link
        action$.ofType(LOCATION_CHANGE)
            .filter(action => {
                const hashMapType = findMapType(action?.payload?.location?.pathname);
                return hashMapType && hashMapType !== mapTypeSelector(store.getState());
            })
            .switchMap((action) =>
                Rx.Observable.of(changeMapType(findMapType(action.payload.location.pathname)))
            ),
        // when map type change, if the URL hash matches with one of the URLs that includes the maptype, update it
        // this when map type is changed using the action or not the URL
        // NOTE: the action can be used anywhere, even if the URL do not include the mapType.
        action$.ofType(MAP_TYPE_CHANGED)
            .switchMap((action) => {
                const hash = action.hash || location.hash;
                const hashMapType = findMapType(hash);
                const currentMapType = mapTypeSelector(store.getState());
                // if the URL hash contains the mapType and it is not in sync with the new path, syncronize
                if (hashMapType && hashMapType !== currentMapType) {
                    const newPath = replaceMapType(hash, currentMapType);
                    // in this case the URL change
                    if (newPath !== hash) {
                        return Rx.Observable.from([push(newPath)]);
                    }
                }
                return Rx.Observable.empty();
            })
    );
/**
 * Keep track of mapType changes and stores the last mapType used, in order to
 */
export const updateLast2dMapTypeOnChangeEvents = (action$, store) => action$
    .ofType(LOCAL_CONFIG_LOADED)
    .map(() => mapTypeSelector(store.getState()))
    .merge(action$.ofType(MAP_TYPE_CHANGED).pluck('mapType'))
    .filter((mapType) => mapType && mapType !== "cesium")
    .switchMap(type => Rx.Observable.of(updateLast2dMapType(type)));

/**
 * Restores last 2D map type when switch to a context where maptype is not
 * in the URL.
 */
export const restore2DMapTypeOnLocationChange = (action$, store) => {
    return action$.ofType(LOCATION_CHANGE)
        // NOTE: this do not conflict with syncMapType LOCATION_CHANGE intercept, they are mutually esclusive
        // because of the `findMapType` check
        .filter(action =>!findMapType(action?.payload?.location?.pathname) && isCesium(store.getState()))
        .switchMap(() => {
            return Rx.Observable.of(changeMapType(last2dMapTypeSelector(store.getState())));
        });
};
/**
 * Epics for maptype switch functionalities
 * @name epics.maptype
 * @type {Object}
 */
export default {
    syncMapType,
    updateLast2dMapTypeOnChangeEvents,
    restore2DMapTypeOnLocationChange
};
