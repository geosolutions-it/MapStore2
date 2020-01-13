/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const Rx = require('rxjs');

const {get, find, isString, isNil} = require('lodash');
const axios = require('../libs/ajax');

const uuid = require('uuid');

const {
    LOAD_FEATURE_INFO, ERROR_FEATURE_INFO, GET_VECTOR_INFO,
    FEATURE_INFO_CLICK, CLOSE_IDENTIFY, TOGGLE_HIGHLIGHT_FEATURE,
    featureInfoClick, updateCenterToMarker, purgeMapInfoResults,
    exceptionsFeatureInfo, loadFeatureInfo, errorFeatureInfo,
    noQueryableLayers, newMapInfoRequest, getVectorInfo,
    showMapinfoMarker, hideMapinfoMarker
} = require('../actions/mapInfo');

const { SET_CONTROL_PROPERTIES } = require('../actions/controls');

const { closeFeatureGrid } = require('../actions/featuregrid');
const { CHANGE_MOUSE_POINTER, CLICK_ON_MAP, zoomToPoint } = require('../actions/map');
const { closeAnnotations } = require('../actions/annotations');
const { MAP_CONFIG_LOADED, MAP_POPUP_REMOVE, mapPopupUpdate } = require('../actions/config');

const { stopGetFeatureInfoSelector, identifyOptionsSelector, clickPointSelector, clickLayerSelector } = require('../selectors/mapInfo');
const { centerToMarkerSelector, queryableLayersSelector } = require('../selectors/layers');
const { modeSelector } = require('../selectors/featuregrid');
const { mapSelector, projectionDefsSelector, projectionSelector } = require('../selectors/map');
const { boundingMapRectSelector } = require('../selectors/maplayout');
const { centerToVisibleArea, isInsideVisibleArea, isPointInsideExtent, reprojectBbox } = require('../utils/CoordinatesUtils');

const { isHighlightEnabledSelector, itemIdSelector, overrideParamsSelector, filterNameListSelector } = require('../selectors/mapInfo');

const { getCurrentResolution, parseLayoutValue } = require('../utils/MapUtils');
const MapInfoUtils = require('../utils/MapInfoUtils');
const { parseURN } = require('../utils/CoordinatesUtils');
const gridEditingSelector = state => modeSelector(state) === 'EDIT';

const stopFeatureInfo = state => stopGetFeatureInfoSelector(state) || gridEditingSelector(state);

/**
 * Sends a GetFeatureInfo request and dispatches the right action
 * in case of success, error or exceptions.
 *
 * @param basePath {string} base path to the service
 * @param requestParams {object} map of params for a getfeatureinfo request.
 */
const getFeatureInfo = (basePath, requestParams, lMetaData, appParams = {}, attachJSON, itemId = null) => {
    const param = { ...appParams, ...requestParams };
    const reqId = uuid.v1();
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
    )
        .map((response) =>
            response.data.exceptions
                ? exceptionsFeatureInfo(reqId, response.data.exceptions, requestParams, lMetaData)
                : loadFeatureInfo(reqId, response.data, requestParams, { ...lMetaData, features: response.features, featuresCrs: response.featuresCrs })
        )
        .catch((e) => Rx.Observable.of(errorFeatureInfo(reqId, e.data || e.statusText || e.status, requestParams, lMetaData)))
        .startWith(newMapInfoRequest(reqId, param));
};

/**
 * Epics for Identify and map info
 * @name epics.identify
 * @type {Object}
 */
module.exports = {
    /**
     * Triggers data load on FEATURE_INFO_CLICK events
     */
    getFeatureInfoOnFeatureInfoClick: (action$, { getState = () => { } }) =>
        action$.ofType(FEATURE_INFO_CLICK)
            .switchMap(({ point, filterNameList = [], overrideParams = {} }) => {
                const queryableLayers = queryableLayersSelector(getState());
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
                            return getFeatureInfo(url, request, metadata, MapInfoUtils.filterRequestParams(layer, includeOptions, excludeParams), isHighlightEnabledSelector(getState()), itemIdSelector(getState()));
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
    handleMapInfoMarker: (action$) =>
        action$.ofType(FEATURE_INFO_CLICK)
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
            .switchMap(({point, layer}) => Rx.Observable.of(featureInfoClick(point, layer), mapPopupUpdate('identify', { coordinates: point ? point.rawPos : [] }))),
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
    closeFeatureInfoOnCatalogOpenEpic: (action$) =>
        action$
            .ofType(SET_CONTROL_PROPERTIES)
            .filter((action) => action.control === "metadataexplorer" && action.properties && action.properties.enabled)
            .switchMap(() => {
                return Rx.Observable.of(purgeMapInfoResults(), hideMapinfoMarker());
            }),

    hideFeatureInfoOnMapPopupClose: (action$) =>
        action$
            .ofType(MAP_POPUP_REMOVE)
            .filter(({ id }) => id === 'identify')
            .switchMap(() => Rx.Observable.of(purgeMapInfoResults(), hideMapinfoMarker()))
};
