/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import Rx from 'rxjs';

import {get, find, isString, isNil} from 'lodash';
import axios from '../libs/ajax';

import uuid from 'uuid';

import {
    LOAD_FEATURE_INFO, ERROR_FEATURE_INFO, GET_VECTOR_INFO,
    FEATURE_INFO_CLICK, CLOSE_IDENTIFY, TOGGLE_HIGHLIGHT_FEATURE,
    PURGE_MAPINFO_RESULTS,
    featureInfoClick, updateCenterToMarker, purgeMapInfoResults,
    exceptionsFeatureInfo, loadFeatureInfo, errorFeatureInfo,
    noQueryableLayers, newMapInfoRequest, getVectorInfo,
    showMapinfoMarker, hideMapinfoMarker
} from '../actions/mapInfo';

import { SET_CONTROL_PROPERTIES, SET_CONTROL_PROPERTY, TOGGLE_CONTROL } from '../actions/controls';

import { closeFeatureGrid } from '../actions/featuregrid';
import { CHANGE_MOUSE_POINTER, CLICK_ON_MAP, zoomToPoint } from '../actions/map';
import { closeAnnotations } from '../actions/annotations';
import { MAP_CONFIG_LOADED } from '../actions/config';
import {addPopup, cleanPopups} from '../actions/mapPopups';
import { stopGetFeatureInfoSelector, identifyOptionsSelector,
    clickPointSelector, clickLayerSelector,
    isMapPopup, isHighlightEnabledSelector,
    itemIdSelector, overrideParamsSelector, filterNameListSelector } from '../selectors/mapInfo';
import { centerToMarkerSelector, queryableLayersSelector, queryableSelectedLayersSelector } from '../selectors/layers';
import { modeSelector } from '../selectors/featuregrid';
import { mapSelector, projectionDefsSelector, projectionSelector } from '../selectors/map';
import { boundingMapRectSelector } from '../selectors/maplayout';
import { centerToVisibleArea, isInsideVisibleArea, isPointInsideExtent, reprojectBbox, parseURN} from '../utils/CoordinatesUtils';


import { getCurrentResolution, parseLayoutValue } from '../utils/MapUtils';
import MapInfoUtils from '../utils/MapInfoUtils';
import { IDENTIFY_POPUP } from '../components/map/popups';

const gridEditingSelector = state => modeSelector(state) === 'EDIT';

const stopFeatureInfo = state => stopGetFeatureInfoSelector(state) || gridEditingSelector(state);

/**
 * Sends a GetFeatureInfo request and dispatches the right action
 * in case of success, error or exceptions.
 *
 * @param basePath {string} base path to the service
 * @param requestParams {object} map of params for a getfeatureinfo request.
 */
export const getFeatureInfo = (basePath, param, attachJSON, itemId = null) => {
    const retrieveFlow = (params) => Rx.Observable.defer(() => axios.get(basePath, { params }));
    return ((
        attachJSON && param.info_format !== "application/json" )
    // add the flow to get the for highlight/zoom
        ? Rx.Observable.forkJoin(
            retrieveFlow(param),
            retrieveFlow({ ...param, info_format: "application/json"})
                .map(res => res.data)
                .catch(() => Rx.Observable.of({})) // errors on geometry retrieval are ignored
        ).map(([response, data ]) => ({
            ...response,
            features: data && data.features && data.features.filter(f => !isNil(itemId) ? f.id === itemId : true),
            featuresCrs: data && data.crs && parseURN(data.crs)
        }))
    // simply get the feature info, geometry is already there
        : retrieveFlow(param)
            .map(res => res.data)
            .map( ( data = {} ) => ({
                data: isString(data) ? data : {
                    ...data,
                    features: data.features && data.features.filter(f => itemId ? f.id === itemId : true)
                },
                features: data.features && data.features.filter(f => itemId ? f.id === itemId : true),
                featuresCrs: data && data.crs && parseURN(data.crs)
            }))
    );
};

/**
 * Epics for Identify and map info
 * @name epics.identify
 * @type {Object}
 */
export default {
    /**
     * Triggers data load on FEATURE_INFO_CLICK events
     */
    getFeatureInfoOnFeatureInfoClick: (action$, { getState = () => { } }) =>
        action$.ofType(FEATURE_INFO_CLICK)
            .switchMap(({ point, filterNameList = [], overrideParams = {} }) => {
                let queryableLayers = queryableLayersSelector(getState());
                const queryableSelectedLayers = queryableSelectedLayersSelector(getState());
                if (queryableSelectedLayers.length) {
                    queryableLayers = queryableSelectedLayers;
                }
                if (queryableLayers.length === 0) {
                    return Rx.Observable.of(purgeMapInfoResults(), noQueryableLayers());
                }
                // TODO: make it in the application getState()
                const excludeParams = ["SLD_BODY"];
                const includeOptions = [
                    "buffer",
                    "cql_filter",
                    "filter",
                    "propertyName"
                ];
                const out$ = Rx.Observable.from((queryableLayers.filter(l => {
                // filtering a subset of layers
                    return filterNameList.length ? (filterNameList.filter(name => name.indexOf(l.name) !== -1).length > 0) : true;
                })))
                    .mergeMap(layer => {
                        let { url, request, metadata } = MapInfoUtils.buildIdentifyRequest(layer, identifyOptionsSelector(getState()));
                        // request override
                        if (itemIdSelector(getState()) && overrideParamsSelector(getState())) {
                            request = {...request, ...overrideParamsSelector(getState())[layer.name]};
                        }
                        if (overrideParams[layer.name]) {
                            request = {...request, ...overrideParams[layer.name]};
                        }
                        if (url) {
                            const basePath = url;
                            const requestParams = request;
                            const lMetaData = metadata;
                            const appParams = MapInfoUtils.filterRequestParams(layer, includeOptions, excludeParams);
                            const attachJSON = isHighlightEnabledSelector(getState());
                            const itemId = itemIdSelector(getState());
                            const reqId = uuid.v1();
                            const param = { ...appParams, ...requestParams };
                            return getFeatureInfo(basePath, param, attachJSON, itemId)
                                .map((response) =>
                                    response.data.exceptions
                                        ? exceptionsFeatureInfo(reqId, response.data.exceptions, requestParams, lMetaData)
                                        : loadFeatureInfo(reqId, response.data, requestParams, { ...lMetaData, features: response.features, featuresCrs: response.featuresCrs })
                                )
                                .catch((e) => Rx.Observable.of(errorFeatureInfo(reqId, e.data || e.statusText || e.status, requestParams, lMetaData)))
                                .startWith(newMapInfoRequest(reqId, param));
                        }
                        return Rx.Observable.of(getVectorInfo(layer, request, metadata));
                    });
                // NOTE: multiSelection is inside the event
                // TODO: move this flag in the application state
                if (point && point.modifiers && point.modifiers.ctrl === true && point.multiSelection) {
                    return out$;
                }
                return out$.startWith(purgeMapInfoResults());

            }),
    /**
     * if `clickLayer` is present, this means that `handleClickOnLayer` is true for the clicked layer, so the marker have to be hidden, because
     * it's managed by the layer itself (e.g. annotations). So the marker have to be hidden.
     */
    handleMapInfoMarker: (action$, {getState}) =>
        action$.ofType(FEATURE_INFO_CLICK).filter(() => !isMapPopup(getState()))
            .map(({ layer }) => layer
                ? hideMapinfoMarker()
                : showMapinfoMarker()
            ),
    closeFeatureGridFromIdentifyEpic: (action$) =>
        action$.ofType(LOAD_FEATURE_INFO, GET_VECTOR_INFO)
            .switchMap(() => {
                return Rx.Observable.of(closeFeatureGrid());
            }),
    /**
     * Check if something is editing in feature info.
     * If so, as to the proper tool to close (annotations)
     * Otherwise it closes by itself.
     */
    closeFeatureAndAnnotationEditing: (action$, {getState = () => {}} = {}) =>
        action$.ofType(CLOSE_IDENTIFY).switchMap( () =>
            get(getState(), "annotations.editing")
                ? Rx.Observable.of(closeAnnotations())
                : Rx.Observable.of(purgeMapInfoResults())
        ),
    changeMapPointer: (action$, store) =>
        action$.ofType(CHANGE_MOUSE_POINTER)
            .filter(() => !(store.getState()).map)
            .switchMap((a) => action$.ofType(MAP_CONFIG_LOADED).mapTo(a)),
    onMapClick: (action$, store) =>
        action$.ofType(CLICK_ON_MAP).filter(() => {
            const {disableAlwaysOn = false} = (store.getState()).mapInfo;
            return disableAlwaysOn || !stopFeatureInfo(store.getState() || {});
        })
            .switchMap(({point, layer}) => Rx.Observable.of(featureInfoClick(point, layer))
                .merge(Rx.Observable.of(addPopup(uuid(), { component: IDENTIFY_POPUP, maxWidth: 600, position: {  coordinates: point ? point.rawPos : []}}))
                    .filter(() => isMapPopup(store.getState()))
                )),
    /**
     * triggers click again when highlight feature is enabled, to download the feature.
     */
    featureInfoClickOnHighligh: (action$, {getState = () => {}} = {}) =>
        action$.ofType(TOGGLE_HIGHLIGHT_FEATURE)
            .filter(({enabled}) =>
                enabled
                && clickPointSelector(getState())
            )
            .switchMap( () => Rx.Observable.from([featureInfoClick(clickPointSelector(getState()), clickLayerSelector(getState()), filterNameListSelector(getState()), overrideParamsSelector(getState()), itemIdSelector(getState())), showMapinfoMarker()])),
    /**
     * Centers marker on visible map if it's hidden by layout
     * @param {external:Observable} action$ manages `FEATURE_INFO_CLICK` and `LOAD_FEATURE_INFO`.
     * @memberof epics.identify
     * @return {external:Observable}
     */
    zoomToVisibleAreaEpic: (action$, store) =>
        action$.ofType(FEATURE_INFO_CLICK)
            .filter(() => centerToMarkerSelector(store.getState()))
            .switchMap((action) =>
                action$.ofType(LOAD_FEATURE_INFO, ERROR_FEATURE_INFO)
                    .switchMap(() => {
                        const state = store.getState();
                        const map = mapSelector(state);
                        const mapProjection = projectionSelector(state);
                        const projectionDefs = projectionDefsSelector(state);
                        const currentprojectionDefs = find(projectionDefs, {'code': mapProjection});
                        const projectionExtent = currentprojectionDefs && currentprojectionDefs.extent;
                        const reprojectExtent = projectionExtent && reprojectBbox(projectionExtent, mapProjection, "EPSG:4326");
                        const boundingMapRect = boundingMapRectSelector(state);
                        const coords = action.point && action.point && action.point.latlng;
                        const resolution = getCurrentResolution(Math.round(map.zoom), 0, 21, 96);
                        const layoutBounds = boundingMapRect && map && map.size && {
                            left: parseLayoutValue(boundingMapRect.left, map.size.width),
                            bottom: parseLayoutValue(boundingMapRect.bottom, map.size.height),
                            right: parseLayoutValue(boundingMapRect.right, map.size.width),
                            top: parseLayoutValue(boundingMapRect.top, map.size.height)
                        };
                        // exclude cesium with cartographic options
                        if (!map || !layoutBounds || !coords || action.point.cartographic || isInsideVisibleArea(coords, map, layoutBounds, resolution)) {
                            return Rx.Observable.of(updateCenterToMarker('disabled'));
                        }
                        if (reprojectExtent && !isPointInsideExtent(coords, reprojectExtent)) {
                            return Rx.Observable.empty();
                        }
                        const center = centerToVisibleArea(coords, map, layoutBounds, resolution);
                        return Rx.Observable.of(updateCenterToMarker('enabled'), zoomToPoint(center.pos, center.zoom, center.crs));
                    })
            ),
    /**
     * Close Feature Info when catalog is enabled
     */
    closeFeatureInfoOnCatalogOpenEpic: (action$, store) =>
        action$
            .ofType(SET_CONTROL_PROPERTIES)
            .filter((action) => action.control === "metadataexplorer" && action.properties && action.properties.enabled)
            .switchMap(() => {
                return Rx.Observable.of(purgeMapInfoResults(), hideMapinfoMarker() ).merge(
                    Rx.Observable.of(cleanPopups())
                        .filter(() => isMapPopup(store.getState()))
                );
            }),
    /**
     * Clean state on annotation open
     */
    closeFeatureInfoOnAnnotationOpenEpic: (action$, {getState}) =>
        action$.ofType(TOGGLE_CONTROL)
            .filter(({control} = {}) => control === 'annotations' && get(getState(), "controls.annotations.enabled", false))
            .mapTo(purgeMapInfoResults()),
    /**
     * Clean state on measure open
     */
    closeFeatureInfoOnMeasureOpenEpic: (action$) =>
        action$.ofType(SET_CONTROL_PROPERTY)
            .filter(({control, value} = {}) => control === 'measure' && value)
            .mapTo(purgeMapInfoResults()),
    /**
     * Clean popup on PURGE_MAPINFO_RESULTS
     * */
    cleanPopupsEpicOnPurge: (action$, {getState}) =>
        action$.ofType(PURGE_MAPINFO_RESULTS)
            .filter(() => isMapPopup(getState()))
            .mapTo(cleanPopups())
};
