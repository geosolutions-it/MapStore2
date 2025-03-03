/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Observable } from 'rxjs';
import axios from '../libs/ajax';
import { get, isNaN, find, head } from 'lodash';
import {
    LOAD_NEW_MAP,
    LOAD_MAP_CONFIG,
    MAP_CONFIG_LOADED,
    LOAD_MAP_INFO,
    MAP_INFO_LOADED,
    configureMap,
    configureError,
    mapInfoLoadStart,
    mapInfoLoaded,
    mapInfoLoadError,
    loadMapConfig,
    loadMapInfo
} from '../actions/config';
import {zoomToExtent} from '../actions/map';
import Persistence from '../api/persistence';
import GeoStoreApi from '../api/GeoStoreDAO';
import { isLoggedIn, userSelector } from '../selectors/security';
import { mapIdSelector, projectionDefsSelector } from '../selectors/map';
import { getDashboardId } from '../selectors/dashboard';
import { DASHBOARD_LOADED } from '../actions/dashboard';
import {loadUserSession, USER_SESSION_LOADED, userSessionStartSaving, saveMapConfig} from '../actions/usersession';
import { detailsLoaded, openDetailsPanel } from '../actions/details';
import {userSessionEnabledSelector, buildSessionName} from "../selectors/usersession";
import {getRequestParameterValue} from "../utils/QueryParamsUtils";
import { EMPTY_RESOURCE_VALUE } from '../utils/MapInfoUtils';
import { changeLayerProperties } from '../actions/layers';
import { createBackgroundsList, setCurrentBackgroundLayer } from '../actions/backgroundselector';
import {
    FORMAT_OPTIONS_FETCH,
    formatsLoading,
    showFormatError,
    setSupportedFormats
} from '../actions/catalog';
import {
    getFormatUrlUsedSelector
} from '../selectors/catalog';
import { getSupportedFormat } from '../api/WMS';
import { wrapStartStop } from '../observables/epics';
import { error } from '../actions/notifications';
import { applyOverrides } from '../utils/ConfigUtils';


const prepareMapConfiguration = (data, override, state) => {
    const queryParamsMap = getRequestParameterValue('map', state);
    let mapConfig = applyOverrides(data, override);
    mapConfig = {
        ...mapConfig,
        ...(queryParamsMap ?? {}),
        map: {
            ...(mapConfig?.map ?? {}),
            ...(queryParamsMap?.map ?? {})

        }
    };
    return mapConfig;
};

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
 *
 * This is used by loadMapConfigAndConfigureMap to configure the current map, either loading
 * it from the given configName or using the config and overrideConfig objects.
 *
 * @param {String} configName name of the configuration file to load (used if config is not specified)
 * @param {String} mapId identifier of the current map, if specified allows loading the related mapInfo
 * @param {Object} config the actual map configuration, if specified it is used instead of loading an external
 * one.
 * @param {Object} mapInfo map detail info, if not specified and mapId is, this is lazily loaded
 * @param {Object} state current redux state
 * @param {Object} overrideConfig override object of the given or loaded config, allows to apply a
 * partial override of the main configuration (e.g. for sessions management)
 * @returns {Observable} map configuration flow
 * @ignore
 */
const mapFlowWithOverride = (configName, mapId, config, mapInfo, state, overrideConfig = {}) => {
    // delay here is to postpone map load to ensure that
    // certain epics always function correctly
    // i.e. FeedbackMask disables correctly after load
    // TODO: investigate the root causes of the problem and come up with a better solution, if possible

    // mapstore recognizes alphanumeric map id as static json
    // avoid map info requests if the configuration is static
    const isNumberId = !isNaN(parseFloat(mapId));
    return (
        config ?
            Observable.of({data: applyOverrides(config, overrideConfig ), staticConfig: true}).delay(100) :
            Observable.defer(() => axios.get(configName)))
        .switchMap(response => {
            // added !config in order to avoid showing login modal when a new.json mapConfig is used in a public context
            if (configName === "new.json" && !config && !isLoggedIn(state)) {
                return Observable.of(configureError({status: 403}));
            }
            if (typeof response.data === 'object') {
                const projectionDefs = projectionDefsSelector(state);
                const projection = get(response, "data.map.projection", "EPSG:3857");
                if (projectionDefs.concat([{code: "EPSG:4326"}, {code: "EPSG:3857"}, {code: "EPSG:900913"}]).filter(({code}) => code === projection).length === 0) {
                    return Observable.of(configureError({messageId: `map.errors.loading.projectionError`, errorMessageParams: {projection}}, mapId));
                }
                const mapConfig = prepareMapConfiguration(response.data, overrideConfig, state);
                return isNumberId ? Observable.of(
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
                const mapConfig = prepareMapConfiguration(data, overrideConfig, state);
                return isNumberId ? Observable.of(configureMap(mapConfig, mapId), mapInfo ? mapInfoLoaded(mapInfo) : loadMapInfo(mapId)) :
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

/**
 * Intercepts the LOAD_MAP_CONFIG action and loads the Map configuration for the given configName and mapId.
 * This epic loads also the user session, if enabled. The session load is skipped if `overrideConfig` is passed (e.g. for context loading it is delegated to it)
 * Hint: Use `overrideConfig={}` in the action to skip the session loading at all.
 * @memberof epics.config
 */
export const loadMapConfigAndConfigureMap = (action$, store) =>
    action$.ofType(LOAD_MAP_CONFIG)
        .switchMap(({configName, mapId, config, mapInfo, overrideConfig}) => {
            const sessionsEnabled = userSessionEnabledSelector(store.getState());
            if (overrideConfig || !sessionsEnabled) {
                return mapFlowWithOverride(configName, mapId, config, mapInfo, store.getState(), overrideConfig);
            }
            const userName = userSelector(store.getState())?.name;
            return Observable.of(loadUserSession(buildSessionName(null, mapId, userName))).merge(
                action$.ofType(USER_SESSION_LOADED).switchMap(({session}) => {
                    return Observable.merge(
                        mapFlowWithOverride(configName, mapId, config, mapInfo, store.getState(), session),
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

/**
 * Intercepts LOAD_MAP_INFO and loads map resources with all information about user's permission on that resource, excluding attributes and data.
 * @param {Observable} action$ stream of actions
 * @returns {external:Observable}
 */
export const loadMapInfoEpic = action$ =>
    action$.ofType(LOAD_MAP_INFO)
        .switchMap(({mapId}) =>
            Observable
                .defer(() => Persistence.getResource(mapId, { includeAttributes: true, withData: false }))
                .map(resource => mapInfoLoaded(resource, mapId))
                .catch((e) => Observable.of(mapInfoLoadError(mapId, e)))
                .startWith(mapInfoLoadStart(mapId))
        );

/**
 * Intercepts MAP_INFO_LOADED and load detail resource linked to the map
 * Epic is placed here to better intercept and load details info,
 * when loading context with map that has a linked resource
 * and to avoid race condition when loading plugins and map configuration
 * @memberof epics.config
 * @param {Observable} action$ stream of actions
 * @param {object} store redux store
 * @return {external:Observable}
 */
export const storeDetailsInfoEpic = (action$, store) =>
    action$.ofType(MAP_INFO_LOADED)
        .filter(() => {
            const mapId = mapIdSelector(store.getState());
            return !!mapId;
        })
        .switchMap(({mapId, info: {attributes}}) => {
            const isTutorialRunning = store.getState()?.tutorial?.run;
            let details = attributes?.details;
            let detailsSettings;
            try {
                detailsSettings = JSON.parse(attributes?.detailsSettings);
            } catch (e) {
                detailsSettings = {};
            }

            if (!details || details === EMPTY_RESOURCE_VALUE) {
                return Observable.empty();
            }
            return Observable.from([
                detailsLoaded(mapId, details, detailsSettings),
                ...(detailsSettings.showAtStartup && !isTutorialRunning ? [openDetailsPanel()] : [])]
            );
        });
export const storeDetailsInfoDashboardEpic = (action$, store) =>
    action$.ofType(DASHBOARD_LOADED)
        .switchMap(() => {
            const dashboardId = getDashboardId(store.getState());
            const isTutorialRunning = store.getState()?.tutorial?.run;
            return !dashboardId
                ? Observable.empty()
                : Observable.fromPromise(
                    GeoStoreApi.getResourceAttributes(dashboardId)
                ).switchMap((attributes) => {
                    let details = find(attributes, {name: 'details'});
                    const detailsSettingsAttribute = find(attributes, {name: 'detailsSettings'});
                    let detailsSettings = {};
                    if (!details || details.value === EMPTY_RESOURCE_VALUE) {
                        return Observable.empty();
                    }

                    try {
                        detailsSettings = JSON.parse(detailsSettingsAttribute.value);
                    } catch (e) {
                        detailsSettings = {};
                    }

                    return Observable.of(
                        detailsLoaded(dashboardId, details.value, detailsSettings),
                        ...(detailsSettings.showAtStartup && !isTutorialRunning ? [openDetailsPanel()] : [])
                    );
                });
        });

/**
 * Intercept MAP_CONFIG_LOADED and update background layers thumbnail
 * Epic is placed here to better intercept and update background layers thumbnail info,
 * when loading context with map and to avoid race condition
 * when loading plugins and map configuration
 * @memberof epics.config
 * @param {Observable} action$ stream of actions
 * @param {object} store redux store
 * @return {external:Observable}
 */
export const backgroundsListInitEpic = (action$) =>
    action$.ofType(MAP_CONFIG_LOADED)
        .switchMap(({config}) => {
            const backgrounds = config.map && config.map.backgrounds || [];
            const backgroundLayers = (config.map && config.map.layers || []).filter(layer => layer.group === 'background');
            const layerUpdateActions = backgrounds.filter(background => !!background.thumbnail).map(background => {
                const toBlob = (data) => {
                    const bytes = atob(data.split(',')[1]);
                    const mimeType = data.split(',')[0].split(':')[1].split(';')[0];
                    let buffer = new ArrayBuffer(bytes.length);
                    let byteArray = new Uint8Array(buffer);
                    for (let i = 0; i < bytes.length; ++i) {
                        byteArray[i] = bytes.charCodeAt(i);
                    }
                    return URL.createObjectURL(new Blob([buffer], {type: mimeType}));
                };
                return changeLayerProperties(background.id, {thumbURL: toBlob(background.thumbnail)});
            });
            const currentBackground = head(backgroundLayers.filter(layer => layer.visibility));
            return Observable.of(
                ...layerUpdateActions.concat(createBackgroundsList(backgrounds)),
                ...(currentBackground ? [setCurrentBackgroundLayer(currentBackground.id)] : [])
            );
        });


/**
     * this epic is moved here because it needs to work also in dashboards
     * Fetch all supported formats of a WMS service configured (infoFormats and imageFormats)
     * Dispatches an action that sets the supported formats of the service.
     * @param {Observable} action$ the actions triggered
     * @param {object} getState store object
     * @memberof epics.catalog
     * @return {external:Observable}
     */
export const getSupportedFormatsEpic = (action$, {getState = ()=> {}} = {}) =>
    action$.ofType(FORMAT_OPTIONS_FETCH)
        .filter((action)=> action.force || getFormatUrlUsedSelector(getState()) !== action?.url)
        .switchMap(({url = ''} = {})=> {
            return Observable.defer(() => getSupportedFormat(url, true))
                .switchMap((supportedFormats) => {
                    return Observable.of(
                        setSupportedFormats(supportedFormats, url),
                        showFormatError(supportedFormats.imageFormats.length === 0 && supportedFormats.infoFormats.length === 0)
                    );
                })
                .let(
                    wrapStartStop(
                        formatsLoading(true),
                        formatsLoading(false),
                        () => {
                            return Observable.of(
                                error({
                                    title: "layerProperties.format.error.title",
                                    message: 'layerProperties.format.error.message'
                                }),
                                formatsLoading(false)
                            );
                        }
                    )
                );
        });
