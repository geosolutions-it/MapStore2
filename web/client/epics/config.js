/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Observable } from 'rxjs';
import axios from '../libs/ajax';
import { get, merge } from 'lodash';
import {
    LOAD_NEW_MAP,
    LOAD_MAP_CONFIG,
    MAP_CONFIG_LOADED,
    LOAD_MAP_INFO,
    configureMap,
    configureError,
    mapInfoLoadStart,
    mapInfoLoaded,
    mapInfoLoadError,
    loadMapConfig,
    loadMapInfo
} from '../actions/config';
import { zoomToExtent } from '../actions/map';
import Persistence from '../api/persistence';
import { isLoggedIn, userSelector } from '../selectors/security';
import { projectionDefsSelector } from '../selectors/map';
import {loadUserSession, USER_SESSION_LOADED, userSessionStartSaving, saveMapConfig} from '../actions/usersession';
import {userSessionEnabledSelector, buildSessionName} from "../selectors/usersession";

export const loadNewMapEpic = (action$) =>
    action$.ofType(LOAD_NEW_MAP)
        .switchMap(({configName, contextId}) =>
            contextId ?
                Persistence.getResource(contextId)
                    .switchMap(resource => Observable.of(loadMapConfig('', null, get(resource, 'data.mapConfig', {}), {context: contextId})))
                    .catch(() => Observable.of(configureError({
                        messageId: `map.errors.loading.contextLoadFailed`
                    }))) :
                Observable.of(loadMapConfig(configName, null))
        );

/**
 * Standard map loading flow.
 */
const mapFlowWithOverride = (configName, mapId, config, mapInfo, store, overrideConfig = {}) => {
            // delay here is to postpone map load to ensure that
            // certain epics always function correctly
            // i.e. FeedbackMask disables correctly after load
            // TODO: investigate the root causes of the problem and come up with a better solution, if possible
    return (
        config ?
            Observable.of({data: merge({}, config, overrideConfig), staticConfig: true}).delay(100) :
            Observable.defer(() => axios.get(configName)))
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
                        const mapConfig = merge({}, response.data, overrideConfig);
                return mapId ? Observable.of(
                    configureMap(mapConfig, mapId),
                    mapInfo ? mapInfoLoaded(mapInfo) : loadMapInfo(mapId),
                    ...(response.staticConfig ? [] : [saveMapConfig(response.data)])
                ) :
                    Observable.of(
                        configureMap(mapConfig, mapId),
                        ...(mapInfo ? [mapInfoLoaded(mapInfo)] : []),
                        ...(response.staticConfig ? [] : [saveMapConfig(response.data)])
                    );
                    }
                    try {
                        const data = JSON.parse(response.data);
                        const mapConfig = merge({}, data, overrideConfig);
                        return mapId ? Observable.of(configureMap(mapConfig, mapId), mapInfo ? mapInfoLoaded(mapInfo) : loadMapInfo(mapId)) :
                            Observable.of(
                        configureMap(mapConfig, mapId),
                        ...(mapInfo ? [mapInfoLoaded(mapInfo)] : []),
                        ...(response.staticConfig ? [] : saveMapConfig(data))
                    );
                    } catch (e) {
                        return Observable.of(configureError('Configuration file broken (' + configName + '): ' + e.message, mapId));
                    }
                })
        .catch((e) => Observable.of(configureError(e, mapId)));
};

export const loadMapConfigAndConfigureMap = (action$, store) =>
    action$.ofType(LOAD_MAP_CONFIG)
        .switchMap(({configName, mapId, config, mapInfo, overrideConfig}) => {
            const sessionsEnabled = userSessionEnabledSelector(store.getState());
            if (overrideConfig || !sessionsEnabled) {
                return mapFlowWithOverride(configName, mapId, config, mapInfo, store, overrideConfig);
            }
            const userName = userSelector(store.getState())?.name;
            return Observable.of(loadUserSession(buildSessionName(null, mapId, userName))).merge(
                action$.ofType(USER_SESSION_LOADED).switchMap(({session}) => {
                    const mapSession = session?.map && {
                        map: session.map
                    };
                    return Observable.merge(
                        mapFlowWithOverride(configName, mapId, config, mapInfo, store, mapSession),
                        Observable.of(userSessionStartSaving())
                    );
                })
        );
        });

export const zoomToMaxExtentOnConfigureMap = action$ =>
    action$.ofType(MAP_CONFIG_LOADED)
        .filter(action => !!action.zoomToExtent)
        .delay(300) // without the delay the map zoom will not change
        .map(({config, zoomToExtent: extent}) => zoomToExtent(extent.bounds, extent.crs || get(config, 'map.projection')));

export const loadMapInfoEpic = action$ =>
    action$.ofType(LOAD_MAP_INFO)
        .switchMap(({mapId}) =>
            Observable
                .defer(() => Persistence.getResource(mapId))
                .map(resource => mapInfoLoaded(resource, mapId))
                .catch((e) => Observable.of(mapInfoLoadError(mapId, e)))
                .startWith(mapInfoLoadStart(mapId))
        );
