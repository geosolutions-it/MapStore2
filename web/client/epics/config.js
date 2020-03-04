/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {Observable} from 'rxjs';
import axios from '../libs/ajax';
import {get} from 'lodash';
import {
    LOAD_MAP_CONFIG,
    MAP_CONFIG_LOADED,
    LOAD_MAP_INFO,
    configureMap,
    configureError,
    mapInfoLoadStart,
    mapInfoLoaded,
    mapInfoLoadError,
    loadMapInfo
} from '../actions/config';
import { zoomToExtent } from '../actions/map';
import Persistence from '../api/persistence';
import { isLoggedIn } from '../selectors/security';
import {projectionDefsSelector} from '../selectors/map';

export const loadMapConfigAndConfigureMap = (action$, store) =>
    action$.ofType(LOAD_MAP_CONFIG)
        .switchMap(({configName, mapId, config}) =>
            // delay here is to postpone map load to ensure that
            // certain epics always function correctly
            // i.e. FeedbackMask disables correctly after load
            // TODO: investigate the root causes of the problem and come up with a better solution, if possible
            (config ? Observable.of({data: config}).delay(100) : Observable.defer(() => axios.get(configName)))
                .switchMap(response => {
                    // added !config in order to avoid showing login modal when a new.json mapConfig is used in a public context
                    if (configName === "new.json" && !config && !isLoggedIn(store.getState())) {
                        return Observable.of(configureError({status: 403}));
                    }
                    if (typeof response.data === 'object') {
                        const projectionDefs = projectionDefsSelector(store.getState());
                        const projection = get(response, "data.map.projection", "EPSG:3857");
                        if (projectionDefs.concat([{code: "EPSG:4326"}, {code: "EPSG:3857"}, {code: "EPSG:900913"}]).filter(({code}) => code === projection).length === 0) {
                            return Observable.of(configureError({messageId: `map.errors.loading.projectionError`, errorMessageParams: {projection}}, mapId));
                        }
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

export const zoomToMaxExtentOnConfigureMap = action$ =>
    action$.ofType(MAP_CONFIG_LOADED)
        .filter(({zoomToMaxExtent}) => zoomToMaxExtent)
        .delay(300) // without the delay the map zoom will not change
        .map(({config}) => zoomToExtent(get(config, 'map.maxExtent'), get(config, 'map.projection')));

export const loadMapInfoEpic = action$ =>
    action$.ofType(LOAD_MAP_INFO)
        .switchMap(({mapId}) =>
            Observable
                .defer(() => Persistence.getResource(mapId))
                .map(resource => mapInfoLoaded(resource, mapId))
                .catch((e) => Observable.of(mapInfoLoadError(mapId, e)))
                .startWith(mapInfoLoadStart(mapId))
        );
