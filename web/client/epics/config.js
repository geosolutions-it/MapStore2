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
    LOAD_MAP_INFO,
    configureMap,
    configureError,
    mapInfoLoadStart,
    mapInfoLoaded,
    mapInfoLoadError,
    loadMapInfo
} from '../actions/config';
import Persistence from '../api/persistence';
import {projectionDefsSelector} from '../selectors/map';

export const loadMapConfigAndConfigureMap = (action$, {getState = () => {}} = {}) =>
    action$.ofType(LOAD_MAP_CONFIG)
        .switchMap( ({configName, mapId}) =>
            Observable.defer(() => axios.get(configName))
                .switchMap(response => {
                    if (typeof response.data === 'object') {
                        const projectionDefs = projectionDefsSelector(getState());
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

export const loadMapInfoEpic = action$ =>
    action$.ofType(LOAD_MAP_INFO)
        .switchMap(({mapId}) =>
            Observable
                .defer(() => Persistence.getResource(mapId))
                .map(resource => mapInfoLoaded(resource, mapId))
                .catch((e) => Observable.of(mapInfoLoadError(mapId, e)))
                .startWith(mapInfoLoadStart(mapId))
        );
