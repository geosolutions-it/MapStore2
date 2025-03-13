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
    LOAD_FEATURE_INFO, ERROR_FEATURE_INFO,
    FEATURE_INFO_CLICK, CLOSE_IDENTIFY, TOGGLE_HIGHLIGHT_FEATURE,
    PURGE_MAPINFO_RESULTS, EDIT_LAYER_FEATURES,
    UPDATE_FEATURE_INFO_CLICK_POINT,
    featureInfoClick, updateCenterToMarker, purgeMapInfoResults,
    loadFeatureInfo, errorFeatureInfo,
    noQueryableLayers, newMapInfoRequest,
    showMapinfoMarker, hideMapinfoMarker, setCurrentEditFeatureQuery,
    SET_MAP_TRIGGER, CLEAR_WARNING
} from '../actions/mapInfo';

import { SET_CONTROL_PROPERTIES, SET_CONTROL_PROPERTY, TOGGLE_CONTROL } from '../actions/controls';

import { closeFeatureGrid, updateFilter, toggleEditMode, CLOSE_FEATURE_GRID } from '../actions/featuregrid';
import { QUERY_CREATE } from '../actions/wfsquery';
import { CHANGE_MOUSE_POINTER, CLICK_ON_MAP, UNREGISTER_EVENT_LISTENER, CHANGE_MAP_VIEW, MOUSE_MOVE, zoomToPoint, changeMapView,
    registerEventListener, unRegisterEventListener } from '../actions/map';
import { browseData } from '../actions/layers';
import { closeAnnotations } from '../plugins/Annotations/actions/annotations';
import { MAP_CONFIG_LOADED } from '../actions/config';
import {addPopup, cleanPopups, removePopup, REMOVE_MAP_POPUP} from '../actions/mapPopups';
import { cancelSelectedItem } from '../actions/search';
import { forceUpdateMapLayout } from '../actions/maplayout';
import {
    stopGetFeatureInfoSelector, identifyOptionsSelector,
    clickPointSelector, clickLayerSelector,
    isMapPopup, isHighlightEnabledSelector,
    itemIdSelector, overrideParamsSelector, filterNameListSelector,
    currentEditFeatureQuerySelector, mapTriggerSelector, enableInfoForSelectedLayersSelector
} from '../selectors/mapInfo';
import { centerToMarkerSelector, getSelectedLayers, layersSelector, queryableLayersSelector, queryableSelectedLayersSelector, rawGroupsSelector, selectedNodesSelector } from '../selectors/layers';
import { modeSelector, getAttributeFilters, isFeatureGridOpen } from '../selectors/featuregrid';
import { spatialFieldSelector } from '../selectors/queryform';
import { mapSelector, projectionDefsSelector, projectionSelector, isMouseMoveIdentifyActiveSelector } from '../selectors/map';
import { boundingMapRectSelector } from '../selectors/maplayout';
import { centerToVisibleArea, isInsideVisibleArea, isPointInsideExtent, reprojectBbox} from '../utils/CoordinatesUtils';
import { floatingIdentifyDelaySelector } from '../selectors/localConfig';
import { createControlEnabledSelector, measureSelector } from '../selectors/controls';
import { localizedLayerStylesEnvSelector } from '../selectors/localizedLayerStyles';
import { mouseOutSelector } from '../selectors/mousePosition';
import { hideEmptyPopupSelector } from '../selectors/mapPopups';
import {getBbox, getCurrentResolution, parseLayoutValue} from '../utils/MapUtils';
import {buildIdentifyRequest, defaultQueryableFilter, filterRequestParams} from '../utils/MapInfoUtils';
import { IDENTIFY_POPUP } from '../components/map/popups';

const gridEditingSelector = state => modeSelector(state) === 'EDIT';
const gridGeometryQuickFilter = state => get(find(getAttributeFilters(state), f => f.type === 'geometry'), 'enabled');

const stopFeatureInfo = state => stopGetFeatureInfoSelector(state) || isFeatureGridOpen(state) && (gridEditingSelector(state) || gridGeometryQuickFilter(state));

import {getFeatureInfo} from '../api/identify';
import { VISUALIZATION_MODE_CHANGED } from '../actions/maptype';
import {updatePointWithGeometricFilter} from "../utils/IdentifyUtils";
import { getDerivedLayersVisibility } from '../utils/LayersUtils';

/**
 * Epics for Identify and map info
 * @name epics.identify
 * @type {Object}
 */
/**
 * Triggers data load on FEATURE_INFO_CLICK events
 */
export const getFeatureInfoOnFeatureInfoClick = (action$, { getState = () => { } }) =>
    action$.ofType(FEATURE_INFO_CLICK)
        .switchMap(({ point, filterNameList = [], overrideParams = {}, ignoreVisibilityLimits }) => {
            const groups = rawGroupsSelector(getState());

            // ignoreVisibilityLimits is for ignore limits of layers visibility
            // Reverse - To query layer in same order as in TOC
            let queryableLayers = ignoreVisibilityLimits ? reverse(getDerivedLayersVisibility([...layersSelector(getState())], groups).filter(l=>defaultQueryableFilter(l))) :  reverse(getDerivedLayersVisibility(queryableLayersSelector(getState()), groups));
            const queryableSelectedLayers = ignoreVisibilityLimits ? getDerivedLayersVisibility([...getSelectedLayers(getState())].filter(l => defaultQueryableFilter(l)), groups) : getDerivedLayersVisibility(queryableSelectedLayersSelector(getState()), groups);
            const enableInfoForSelectedLayers = enableInfoForSelectedLayersSelector(getState());
            if (enableInfoForSelectedLayers && queryableSelectedLayers.length) {
                queryableLayers = queryableSelectedLayers;
            }
            // remove invisible layers, visible layer with invisible group already converted to invisible layer using getDerivedLayersVisibility
            queryableLayers = queryableLayers.filter(l=>l.visibility);


            const selectedLayers = selectedNodesSelector(getState());

            if (queryableLayers.length === 0 || enableInfoForSelectedLayers && queryableSelectedLayers.length === 0 && selectedLayers.length !== 0) {
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

            let firstResponseReturned = false;

            const out$ = Rx.Observable.from((queryableLayers.filter(l => {
            // filtering a subset of layers
                return filterNameList.length ? (filterNameList.filter(name => name.indexOf(l.name) !== -1).length > 0) : true;
            })))
                .mergeMap(layer => {
                    let env = localizedLayerStylesEnvSelector(getState());
                    let { url, request, metadata } = buildIdentifyRequest(layer, {...identifyOptionsSelector(getState()), env});
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
                        const appParams = filterRequestParams(layer, includeOptions, excludeParams);
                        const attachJSON = isHighlightEnabledSelector(getState());
                        const itemId = itemIdSelector(getState());
                        const reqId = uuid.v1();
                        const param = { ...appParams, ...requestParams };
                        return getFeatureInfo(basePath, param, layer, {attachJSON, itemId})
                            // this 0 delay is needed for vector/3dtiles layer because makes the response async and give time to the GUI to render
                            // these type of layers don't perform requests to the server because the values are taken from the client map so the response were applied synchronously
                            // this delay allows the panel to open and show the spinner for the first one
                            // this delay mitigates the freezing of the app when there are a great amount of queried layers at the same time
                            .delay(0)
                            .map((response) =>loadFeatureInfo(reqId, response.data, requestParams, { ...lMetaData, features: response.features, featuresCrs: response.featuresCrs }, layer))
                            .catch((e) => Rx.Observable.of(errorFeatureInfo(reqId, e, requestParams, lMetaData)))
                            .concat(Rx.Observable.defer(() => {
                                // update the layout only after the initial response
                                // we don't need to trigger this for each query layer
                                if (!firstResponseReturned) {
                                    firstResponseReturned = true;
                                    return Rx.Observable.of(forceUpdateMapLayout());
                                }
                                return Rx.Observable.empty();
                            }))
                            .startWith(newMapInfoRequest(reqId, param));
                    }
                    return Rx.Observable.of(forceUpdateMapLayout());
                });
            // NOTE: multiSelection is inside the event
            // TODO: move this flag in the application state
            if (point && point.modifiers && point.modifiers.ctrl === true && point.multiSelection) {
                return out$;
            }
            return out$.startWith(purgeMapInfoResults());
        });
/**
 * if `clickLayer` is present, this means that `handleClickOnLayer` is true for the clicked layer, so the marker have to be hidden, because
 * it's managed by the layer itself (e.g. annotations). So the marker have to be hidden.
 */
export const handleMapInfoMarker = (action$, {getState}) =>
    action$.ofType(FEATURE_INFO_CLICK).filter(() => !isMapPopup(getState()))
        // we should not hide the marker anymore
        // the visibility of the marker should manage by the identify tool
        .map(() => showMapinfoMarker()
        );
export const closeFeatureGridFromIdentifyEpic = (action$, store) =>
    action$.ofType(LOAD_FEATURE_INFO)
        .switchMap(() => {
            if (isFeatureGridOpen(store.getState())) {
                return Rx.Observable.of(closeFeatureGrid());
            }
            return Rx.Observable.empty();
        });
/**
 * Check if something is editing in feature info.
 * If so, as to the proper tool to close (annotations)
 * Otherwise it closes by itself.
 */
export const closeFeatureAndAnnotationEditing = (action$, {getState = () => {}} = {}) =>
    action$.ofType(CLOSE_IDENTIFY).switchMap( () =>
        get(getState(), "annotations.editing")
            ? Rx.Observable.of(closeAnnotations())
            : Rx.Observable.of(purgeMapInfoResults())
    );
export const hideMarkerOnIdentifyCloseOrClearWarning = (action$) =>
    action$.ofType(CLOSE_IDENTIFY, CLEAR_WARNING)
        .flatMap(() => Rx.Observable.of(hideMapinfoMarker()));
export const changeMapPointer = (action$, store) =>
    action$.ofType(CHANGE_MOUSE_POINTER)
        .filter(() => !(store.getState()).map)
        .switchMap((a) => action$.ofType(MAP_CONFIG_LOADED).mapTo(a));
export const onMapClick = (action$, store) =>
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
                    {component: IDENTIFY_POPUP, maxWidth: 600, position: {coordinates: point ? point.rawPos : []}}))
                    .filter(() => isMapPopup(store.getState()))
                );
        });
/**
 * Reacts to an update of FeatureInfo coordinates recalculating geometry filter from the map and re-trigger the feature info.
 */
export const onUpdateFeatureInfoClickPoint = (action$, {getState = () => {}} = {}) =>
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
        }));
/**
 * triggers click again when highlight feature is enabled, to download the feature.
 */
export const featureInfoClickOnHighligh = (action$, {getState = () => {}} = {}) =>
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
        );
/**
 * Centers marker on visible map if it's hidden by layout
 * @param {external:Observable} action$ manages `FEATURE_INFO_CLICK` and `LOAD_FEATURE_INFO`.
 * @memberof epics.identify
 * @return {external:Observable}
 */
export const zoomToVisibleAreaEpic = (action$, store) =>
    action$.ofType(FEATURE_INFO_CLICK)
        .filter(() => centerToMarkerSelector(store.getState()))
        .switchMap((action) =>
            action$.ofType(LOAD_FEATURE_INFO, ERROR_FEATURE_INFO)
                .mergeMap((loadFeatInfoAction) => {
                    const state = store.getState();
                    const hideIdentifyPopupIfNoResults = hideEmptyPopupSelector(state);
                    const hoverIdentifyActive = isMouseMoveIdentifyActiveSelector(state);
                    const noResultFeatures = loadFeatInfoAction.type === LOAD_FEATURE_INFO && typeof loadFeatInfoAction?.data === "string" && loadFeatInfoAction?.data?.includes("no features were found");
                    // remove marker in case activated identify hover mode and no fetched results plus existing hideIdentifyPopupIfNoResults = true
                    if (noResultFeatures && hideIdentifyPopupIfNoResults && hoverIdentifyActive) {
                        return Rx.Observable.from([updateCenterToMarker('disabled'), hideMapinfoMarker()]);
                    }
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
        );
/**
 * Close Feature Info when catalog is enabled
 */
export const closeFeatureInfoOnCatalogOpenEpic = (action$, store) =>
    action$
        .ofType(SET_CONTROL_PROPERTIES)
        .filter((action) => action.control === "metadataexplorer" && action.properties && action.properties.enabled)
        .switchMap(() => {
            return Rx.Observable.of(purgeMapInfoResults(), hideMapinfoMarker() ).merge(
                Rx.Observable.of(cleanPopups())
                    .filter(() => isMapPopup(store.getState()))
            );
        });
/**
 * Clean state on annotation open
 */
export const closeFeatureInfoOnAnnotationOpenEpic = (action$, {getState}) =>
    action$.ofType(TOGGLE_CONTROL, SET_CONTROL_PROPERTY)
        .filter(({control} = {}) => control === 'annotations' && get(getState(), "controls.annotations.enabled", false))
        .mapTo(purgeMapInfoResults());
/**
 * Clean state on measure open
 */
export const closeFeatureInfoOnMeasureOpenEpic = (action$) =>
    action$.ofType(SET_CONTROL_PROPERTY)
        .filter(({control, value} = {}) => control === 'measure' && value)
        .mapTo(purgeMapInfoResults());
/**
 * Clean popup on PURGE_MAPINFO_RESULTS
 * */
export const cleanPopupsEpicOnPurge = (action$, {getState}) =>
    action$.ofType(PURGE_MAPINFO_RESULTS)
        .filter(() => isMapPopup(getState()))
        .mapTo(cleanPopups());
export const identifyEditLayerFeaturesEpic = (action$, store) =>
    action$.ofType(EDIT_LAYER_FEATURES)
        .exhaustMap(({layer}) => Rx.Observable.of(
            setCurrentEditFeatureQuery(clickPointSelector(store.getState())?.geometricFilter), browseData(layer)));
export const switchFeatureGridToEdit = (action$, store) =>
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
        });
export const resetCurrentEditFeatureQuery = (action$) =>
    action$.ofType(CLOSE_FEATURE_GRID, LOCATION_CHANGE)
        .mapTo(setCurrentEditFeatureQuery());
/**
 * Triggers data load on MOUSE_MOVE events
 */
export const mouseMoveMapEventEpic = (action$, {getState}) =>
    action$.ofType(MOUSE_MOVE)
        .debounceTime(floatingIdentifyDelaySelector(getState()))
        .switchMap(({position, layer}) => {
            const isAnnotationsEnabled = createControlEnabledSelector('annotations')(getState());
            const isMeasureEnabled = measureSelector(getState());
            const isMouseOut = mouseOutSelector(getState());
            const isMouseMoveIdentifyDisabled = !isMouseMoveIdentifyActiveSelector(getState());
            if (isMouseMoveIdentifyDisabled || isAnnotationsEnabled || isMeasureEnabled || isMouseOut) {
                return Rx.Observable.empty();
            }
            return Rx.Observable.of(featureInfoClick(position, layer))
                .merge(Rx.Observable.of(addPopup(uuid(), { component: IDENTIFY_POPUP, maxWidth: 600, position: {  coordinates: position ? position.rawPos : []}, autoPanMargin: 70, autoPan: true})));
        });
/**
 * Triggers remove popup on UNREGISTER_EVENT_LISTENER
 */
export const removePopupOnUnregister = (action$, {getState}) =>
    action$.ofType(UNREGISTER_EVENT_LISTENER)
        .switchMap(() => {
            let observable = Rx.Observable.empty();
            const popups = getState()?.mapPopups?.popups || [];
            if (popups.length && !isMouseMoveIdentifyActiveSelector(getState())) {
                const activePopupId = popups[0].id;
                observable = Rx.Observable.of(removePopup(activePopupId));
            }
            return observable;
        });
/**
 * Triggers remove popup on LOCATION_CHANGE, PURGE_MAPINFO_RESULTS or CLEAR_WARNING
 */
export const removePopupOnLocationChangeEpic = (action$, {getState}) =>
    action$.ofType(LOCATION_CHANGE, PURGE_MAPINFO_RESULTS, CLEAR_WARNING)
        .switchMap(() => {
            let observable = Rx.Observable.empty();
            const popups = getState()?.mapPopups?.popups || [];
            if (popups.length) {
                const activePopupId = popups[0].id;
                observable = Rx.Observable.of(removePopup(activePopupId));
            }
            return observable;
        });
/**
 * Triggers remove map info marker on REMOVE_MAP_POPUP
 */
export const removeMapInfoMarkerOnRemoveMapPopupEpic = (action$, {getState}) =>
    action$.ofType(REMOVE_MAP_POPUP)
        .switchMap(() => isMouseMoveIdentifyActiveSelector(getState()) ? Rx.Observable.of(hideMapinfoMarker()) : Rx.Observable.empty());
/**
* Sets which trigger to use on the map
*/
export const setMapTriggerEpic = (action$, store) =>
    action$.ofType(SET_MAP_TRIGGER, MAP_CONFIG_LOADED, VISUALIZATION_MODE_CHANGED)
        .switchMap(() => {
            return Rx.Observable.of(
                mapTriggerSelector(store.getState()) === 'hover' ? registerEventListener('mousemove', 'identifyFloatingTool') : unRegisterEventListener('mousemove', 'identifyFloatingTool')
            );
        });


export default {
    getFeatureInfoOnFeatureInfoClick,
    handleMapInfoMarker,
    closeFeatureGridFromIdentifyEpic,
    closeFeatureAndAnnotationEditing,
    hideMarkerOnIdentifyCloseOrClearWarning,
    changeMapPointer,
    onMapClick,
    onUpdateFeatureInfoClickPoint,
    featureInfoClickOnHighligh,
    zoomToVisibleAreaEpic,
    closeFeatureInfoOnCatalogOpenEpic,
    closeFeatureInfoOnAnnotationOpenEpic,
    closeFeatureInfoOnMeasureOpenEpic,
    cleanPopupsEpicOnPurge,
    identifyEditLayerFeaturesEpic,
    switchFeatureGridToEdit,
    resetCurrentEditFeatureQuery,
    mouseMoveMapEventEpic,
    removePopupOnUnregister,
    removePopupOnLocationChangeEpic,
    removeMapInfoMarkerOnRemoveMapPopupEpic,
    setMapTriggerEpic
};
