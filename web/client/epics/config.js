/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {Observable} from 'rxjs';
import axios from '../libs/ajax';
import {
    LOAD_MAP_CONFIG,
    LOAD_MAP_INFO,
    configureMap,
    configureError,
    mapInfoLoadStart,
    mapInfoLoaded,
    mapInfoLoadError,
    loadMapInfo
} from '../actions/config';
import Persistence from '../api/persistence';
import { isLoggedIn } from '../selectors/security';

export const loadMapConfigAndConfigureMap = (action$, store) =>
    action$.ofType(LOAD_MAP_CONFIG)
        .switchMap( ({configName, mapId}) =>
            Observable.defer(() => axios.get(configName))
                .switchMap(response => {
                    if (configName === "new.json" && !isLoggedIn(store.getState())) {
                        return Observable.of(configureError({status: 403}));
                    }
                    if (typeof response.data === 'object') {
                        return mapId ? Observable.of(configureMap(response.data, mapId), loadMapInfo(mapId)) :
                            Observable.of(configureMap(response.data, mapId));
                    }
                    try {
                        const data = JSON.parse(response.data);
                        return mapId ? Observable.of(configureMap(data, mapId), loadMapInfo(mapId)) :
                            Observable.of(configureMap(data, mapId));
                    } catch (e) {
                        return Observable.of(configureError('Configuration file broken (' + configName + '): ' + e.message, mapId));
                    }
                })
                .catch((e) => Observable.of(configureError(e, mapId)))
        );

export const loadMapInfoEpic = action$ =>
    action$.ofType(LOAD_MAP_INFO)
        .switchMap(({mapId}) =>
            Observable
                .defer(() => Persistence.getResource(mapId))
                .map(resource => mapInfoLoaded(resource, mapId))
                .catch((e) => Observable.of(mapInfoLoadError(mapId, e)))
                .startWith(mapInfoLoadStart(mapId))
        );
