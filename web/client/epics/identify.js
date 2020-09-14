/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Rx from 'rxjs';
import { get, find, reverse} from 'lodash';
import uuid from 'uuid';
import { LOCATION_CHANGE } from 'connected-react-router';
import {
    LOAD_FEATURE_INFO, ERROR_FEATURE_INFO, GET_VECTOR_INFO,
    FEATURE_INFO_CLICK, CLOSE_IDENTIFY, TOGGLE_HIGHLIGHT_FEATURE,
    PURGE_MAPINFO_RESULTS, EDIT_LAYER_FEATURES,
    UPDATE_FEATURE_INFO_CLICK_POINT,
    featureInfoClick, updateCenterToMarker, purgeMapInfoResults,
    exceptionsFeatureInfo, loadFeatureInfo, errorFeatureInfo,
    noQueryableLayers, newMapInfoRequest, getVectorInfo,
    showMapinfoMarker, hideMapinfoMarker, setCurrentEditFeatureQuery
} from '../actions/mapInfo';

import { SET_CONTROL_PROPERTIES, SET_CONTROL_PROPERTY, TOGGLE_CONTROL } from '../actions/controls';

import { closeFeatureGrid, updateFilter, toggleEditMode, CLOSE_FEATURE_GRID } from '../actions/featuregrid';
import { QUERY_CREATE } from '../actions/wfsquery';
import { CHANGE_MOUSE_POINTER, CLICK_ON_MAP, UNREGISTER_EVENT_LISTENER, CHANGE_MAP_VIEW, MOUSE_MOVE, zoomToPoint, changeMapView,
    registerEventListener, unRegisterEventListener } from '../actions/map';
import { browseData } from '../actions/layers';
import { closeAnnotations } from '../actions/annotations';
import { MAP_CONFIG_LOADED } from '../actions/config';
import {addPopup, cleanPopups, removePopup, REMOVE_MAP_POPUP} from '../actions/mapPopups';
import { cancelSelectedItem } from '../actions/search';
const { SET_MAP_TRIGGER } = require('../actions/mapInfo');
import { stopGetFeatureInfoSelector, identifyOptionsSelector,
    clickPointSelector, clickLayerSelector,
    isMapPopup, isHighlightEnabledSelector,
    itemIdSelector, overrideParamsSelector, filterNameListSelector,
    currentEditFeatureQuerySelector, mapTriggerSelector } from '../selectors/mapInfo';
import { centerToMarkerSelector, queryableLayersSelector, queryableSelectedLayersSelector } from '../selectors/layers';
import { modeSelector, getAttributeFilters, isFeatureGridOpen } from '../selectors/featuregrid';
import { spatialFieldSelector } from '../selectors/queryform';
import { mapSelector, projectionDefsSelector, projectionSelector, isMouseMoveIdentifyActiveSelector } from '../selectors/map';
import { boundingMapRectSelector } from '../selectors/maplayout';
import { centerToVisibleArea, isInsideVisibleArea, isPointInsideExtent, reproject, reprojectBbox, calculateCircleCoordinates,
    calculateCircleRadiusFromPixel } from '../utils/CoordinatesUtils';
import { floatingIdentifyDelaySelector } from '../selectors/localConfig';
import { createControlEnabledSelector, measureSelector } from '../selectors/controls';
import { localizedLayerStylesEnvSelector } from '../selectors/localizedLayerStyles';

import {getBbox, getCurrentResolution, parseLayoutValue, getHook, GET_COORDINATES_FROM_PIXEL_HOOK, GET_PIXEL_FROM_COORDINATES_HOOK} from '../utils/MapUtils';
import MapInfoUtils from '../utils/MapInfoUtils';
import { IDENTIFY_POPUP } from '../components/map/popups';

const gridEditingSelector = state => modeSelector(state) === 'EDIT';
const gridGeometryQuickFilter = state => get(find(getAttributeFilters(state), f => f.type === 'geometry'), 'enabled');

const stopFeatureInfo = state => stopGetFeatureInfoSelector(state) || isFeatureGridOpen(state) && (gridEditingSelector(state) || gridGeometryQuickFilter(state));

import {getFeatureInfo} from '../api/identify';

/**
 * Recalculates pixel and geometric filter to allow also GFI emulation for WFS.
 * This information is used also to switch to edit mode (feature grid) from GFI applying the same filter
 * @param {object} point the point clicked, emitted by featureInfoClick action
 * @param {string} projection map projection
 */
const updatePointWithGeometricFilter = (point, projection) => {
    // calculate a query for edit
    const lng = get(point, 'latlng.lng');
    const lat = get(point, 'latlng.lat');
    // update pixel if changed
    const pos = reproject([lng, lat], 'EPSG:4326', projection);
    const getPixel = getHook(GET_PIXEL_FROM_COORDINATES_HOOK);
    let pixel;
    if (getPixel) {
        const [x, y] = getPixel([pos.x, pos.y]);
        pixel = { x, y };
    } else {
        pixel = point.pixel;
    }
    const hook = getHook(GET_COORDINATES_FROM_PIXEL_HOOK);
    const radius = calculateCircleRadiusFromPixel(
        hook,
        pixel,
        pos,
        5
    );
    // emulation of feature info filter to query WFS services (edit and/or WFS layer)
    const geometricFilter = {
        type: 'geometry',
        enabled: true,
        value: {
            geometry: {
                center: [pos.x, pos.y],
                coordinates: calculateCircleCoordinates(pos, radius, 12),
                extent: [pos.x - radius, pos.y - radius, pos.x + radius, pos.y + radius],
                projection,
                radius,
                type: "Polygon"
            },
            method: "Circle",
            operation: "INTERSECTS"
        }
    };
    return {
        ...point,
        pixel,
        geometricFilter
    };
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
                // Reverse - To query layer in same order as in TOC
                let queryableLayers = reverse(queryableLayersSelector(getState()));
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
                        let env = localizedLayerStylesEnvSelector(getState());
                        let { url, request, metadata } = MapInfoUtils.buildIdentifyRequest(layer, {...identifyOptionsSelector(getState()), env});
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
                            return getFeatureInfo(basePath, param, layer, {attachJSON, itemId})
                                .map((response) =>
                                    response.data.exceptions
                                        ? exceptionsFeatureInfo(reqId, response.data.exceptions, requestParams, lMetaData)
                                        : loadFeatureInfo(reqId, response.data, requestParams, { ...lMetaData, features: response.features, featuresCrs: response.featuresCrs }, layer)
                                )
                                .catch((e) => Rx.Observable.of(errorFeatureInfo(reqId, e.data || e.statusText || e.status, requestParams, lMetaData)))
                                .startWith(newMapInfoRequest(reqId, param));
                        }
                        return Rx.Observable.of(getVectorInfo(layer, request, metadata, queryableLayers));
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
    hideMarkerOnIdentifyClose: (action$) =>
        action$.ofType(CLOSE_IDENTIFY)
            .flatMap(() => Rx.Observable.of(hideMapinfoMarker())),
    changeMapPointer: (action$, store) =>
        action$.ofType(CHANGE_MOUSE_POINTER)
            .filter(() => !(store.getState()).map)
            .switchMap((a) => action$.ofType(MAP_CONFIG_LOADED).mapTo(a)),
    onMapClick: (action$, store) =>
        action$.ofType(CLICK_ON_MAP).filter(() => {
            const {disableAlwaysOn = false} = (store.getState()).mapInfo;
            if (isMouseMoveIdentifyActiveSelector(store.getState())) {
                return false;
            }
            return disableAlwaysOn || !stopFeatureInfo(store.getState() || {});
        })
            .switchMap(({point, layer}) => {
                const projection = projectionSelector(store.getState());
                return Rx.Observable.of(featureInfoClick(updatePointWithGeometricFilter(point, projection), layer), cancelSelectedItem())
                    .merge(Rx.Observable.of(addPopup(uuid(),
                        { component: IDENTIFY_POPUP, maxWidth: 600, position: {  coordinates: point ? point.rawPos : []}}))
                        .filter(() => isMapPopup(store.getState()))
                    );
            }),
    /**
     * Reacts to an update of FeatureInfo coordinates recalculating geometry filter from the map and re-trigger the feature info.
     */
    onUpdateFeatureInfoClickPoint: (action$, {getState = () => {}} = {}) =>
        action$.ofType(UPDATE_FEATURE_INFO_CLICK_POINT)
            .map(({ point }) => {
                const projection = projectionSelector(getState());
                return {
                    point: updatePointWithGeometricFilter(point, projection)
                };
            })
            // recover old parameters of last featureInfoClick and re-trigger the action
            .withLatestFrom(action$.ofType(FEATURE_INFO_CLICK), ({point}, lastAction) => ({
                ...lastAction,
                point
            })),
    /**
     * triggers click again when highlight feature is enabled, to download the feature.
     */
    featureInfoClickOnHighligh: (action$, {getState = () => {}} = {}) =>
        action$.ofType(TOGGLE_HIGHLIGHT_FEATURE)
            .filter(({enabled}) =>
                enabled
                && clickPointSelector(getState())
            )
            .switchMap( () => Rx.Observable.from([
                featureInfoClick(
                    clickPointSelector(getState()),
                    clickLayerSelector(getState()),
                    filterNameListSelector(getState()),
                    overrideParamsSelector(getState()),
                    itemIdSelector(getState())
                ),
                showMapinfoMarker()])
            ),
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
                        if (!map || !layoutBounds || !coords || action.point.cartographic || isInsideVisibleArea(coords, map, layoutBounds, resolution) || isMouseMoveIdentifyActiveSelector(state)) {
                            return Rx.Observable.of(updateCenterToMarker('disabled'));
                        }
                        if (reprojectExtent && !isPointInsideExtent(coords, reprojectExtent)) {
                            return Rx.Observable.empty();
                        }
                        const center = centerToVisibleArea(coords, map, layoutBounds, resolution);
                        return Rx.Observable.of(updateCenterToMarker('enabled'), zoomToPoint(center.pos, center.zoom, center.crs))
                            // restore initial position
                            .concat(
                                action$.ofType(CLOSE_IDENTIFY).switchMap(()=>{
                                    const bbox = map && getBbox(map.center, map.zoom);
                                    return Rx.Observable.of(
                                        changeMapView(map.center, map.zoom, bbox, map.size, null, map.projection));
                                }).takeUntil(action$.ofType(CHANGE_MAP_VIEW).skip(1)) // do not restore if user changes position (skip first caused by the zoomToPoint)
                            );
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
            .mapTo(cleanPopups()),
    identifyEditLayerFeaturesEpic: (action$, store) =>
        action$.ofType(EDIT_LAYER_FEATURES)
            .exhaustMap(({layer}) => Rx.Observable.of(
                setCurrentEditFeatureQuery(clickPointSelector(store.getState())?.geometricFilter), browseData(layer))),
    switchFeatureGridToEdit: (action$, store) =>
        action$.ofType(QUERY_CREATE)
            .switchMap(() => {
                const queryObj = currentEditFeatureQuerySelector(store.getState());
                const currentFilter = find(getAttributeFilters(store.getState()), f => f.type === 'geometry') || {};
                const attribute = currentFilter.attribute || get(spatialFieldSelector(store.getState()), 'attribute');

                return queryObj ? Rx.Observable.of(
                    setCurrentEditFeatureQuery(),
                    toggleEditMode(),
                    updateFilter({
                        ...queryObj,
                        attribute,
                        value: {
                            ...queryObj.value,
                            attribute
                        }
                    })
                ) : Rx.Observable.empty();
            }),
    resetCurrentEditFeatureQuery: (action$) =>
        action$.ofType(CLOSE_FEATURE_GRID, LOCATION_CHANGE)
            .mapTo(setCurrentEditFeatureQuery()),
    /**
     * Triggers data load on MOUSE_MOVE events
     */
    mouseMoveMapEventEpic: (action$, {getState}) =>
        action$.ofType(MOUSE_MOVE)
            .debounceTime(floatingIdentifyDelaySelector(getState()))
            .switchMap(({position, layer}) => {
                const isAnnotationsEnabled = createControlEnabledSelector('annotations')(getState());
                const isMeasureEnabled = measureSelector(getState());
                const isMouseOut = getState().mousePosition.mouseOut;
                const isMouseMoveIdentifyDisabled = !isMouseMoveIdentifyActiveSelector(getState());
                if (isMouseMoveIdentifyDisabled || isAnnotationsEnabled || isMeasureEnabled || isMouseOut) {
                    return Rx.Observable.empty();
                }
                return Rx.Observable.of(featureInfoClick(position, layer))
                    .merge(Rx.Observable.of(addPopup(uuid(), { component: IDENTIFY_POPUP, maxWidth: 600, position: {  coordinates: position ? position.rawPos : []}, autoPanMargin: 70, autoPan: true})));
            }),
    /**
     * Triggers remove popup on UNREGISTER_EVENT_LISTENER
     */
    removePopupOnUnregister: (action$, {getState}) =>
        action$.ofType(UNREGISTER_EVENT_LISTENER)
            .switchMap(() => {
                let observable = Rx.Observable.empty();
                const popups = getState()?.mapPopups?.popups || [];
                if (popups.length && !isMouseMoveIdentifyActiveSelector(getState())) {
                    const activePopupId = popups[0].id;
                    observable = Rx.Observable.of(removePopup(activePopupId));
                }
                return observable;
            }),
    /**
     * Triggers remove popup on LOCATION_CHANGE or PURGE_MAPINFO_RESULTS
     */
    removePopupOnLocationChangeEpic: (action$, {getState}) =>
        action$.ofType(LOCATION_CHANGE, PURGE_MAPINFO_RESULTS)
            .switchMap(() => {
                let observable = Rx.Observable.empty();
                const popups = getState()?.mapPopups?.popups || [];
                if (popups.length) {
                    const activePopupId = popups[0].id;
                    observable = Rx.Observable.of(removePopup(activePopupId));
                }
                return observable;
            }),
    /**
     * Triggers remove map info marker on REMOVE_MAP_POPUP
     */
    removeMapInfoMarkerOnRemoveMapPopupEpic: (action$, {getState}) =>
        action$.ofType(REMOVE_MAP_POPUP)
            .switchMap(() => isMouseMoveIdentifyActiveSelector(getState()) ? Rx.Observable.of(hideMapinfoMarker()) : Rx.Observable.empty()),
    /**
    * Sets which trigger to use on the map
    */
    setMapTriggerEpic: (action$, store) =>
        action$.ofType(SET_MAP_TRIGGER, MAP_CONFIG_LOADED)
            .switchMap(() => {
                return Rx.Observable.of(
                    mapTriggerSelector(store.getState()) === 'hover' ? registerEventListener('mousemove', 'identifyFloatingTool') : unRegisterEventListener('mousemove', 'identifyFloatingTool')
                );
            })
};
