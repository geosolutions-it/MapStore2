/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import * as Rx from 'rxjs';
import toBbox from 'turf-bbox';
import pointOnSurface from '@turf/point-on-surface';
import {isNil, sortBy} from 'lodash';
import uuid from 'uuid';
import bboxTurf from '@turf/bbox';

import {centerToMarkerSelector, getLayerFromName, layersSelector} from '../selectors/layers';

import {updateAdditionalLayer} from '../actions/additionallayers';
import {
    ERROR_FEATURE_INFO,
    EXCEPTIONS_FEATURE_INFO,
    featureInfoClick,
    LOAD_FEATURE_INFO,
    showMapinfoMarker,
    updateCenterToMarker
} from '../actions/mapInfo';
import {zoomToExtent, zoomToPoint} from '../actions/map';
import {ADD_LAYER, changeLayerProperties} from '../actions/layers';
import {
    addMarker,
    nonQueriableLayerError,
    resultsPurge, SCHEDULE_SEARCH_LAYER_WITH_FILTER,
    SEARCH_LAYER_WITH_FILTER, searchLayerWithFilter,
    searchResultError,
    searchResultLoaded,
    searchTextChanged,
    searchTextLoading,
    selectNestedService,
    serverError,
    TEXT_SEARCH_ADD_MARKER,
    TEXT_SEARCH_ITEM_SELECTED,
    TEXT_SEARCH_RESET,
    TEXT_SEARCH_RESULTS_PURGE,
    TEXT_SEARCH_SHOW_GFI,
    TEXT_SEARCH_STARTED,
    ZOOM_ADD_POINT
} from '../actions/search';

import CoordinatesUtils, { reproject } from '../utils/CoordinatesUtils';
import {defaultIconStyle, layerIsVisibleForGFI, showGFIForService} from '../utils/SearchUtils';
import {generateTemplateString} from '../utils/TemplateUtils';

import {API} from '../api/searchText';
import {getFeatureSimple} from '../api/WFS';
import {defaultQueryableFilter, getDefaultInfoFormatValueFromLayer} from '../utils/MapInfoUtils';
import {identifyOptionsSelector, isMapPopup} from '../selectors/mapInfo';
import { addPopup } from '../actions/mapPopups';
import { IDENTIFY_POPUP } from '../components/map/popups';
import { projectionSelector } from '../selectors/map';

const getInfoFormat = (layerObj, state) => getDefaultInfoFormatValueFromLayer(layerObj, {...identifyOptionsSelector(state)});

/**
 * Gets every `TEXT_SEARCH_STARTED` event.
 * Dispatches the request to all the services in the action, postprocess them
 * and updates every tume the results
 * @param {external:Observable} action$ manages `TEXT_SEARCH_STARTED` and `TEXT_SEARCH_RESULTS_PURGE`, `TEXT_SEARCH_RESET`, `TEXT_SEARCH_ITEM_SELECTED` for cancellation
 * @memberof epics.search
 * @return {external:Observable}
 */
export const searchEpic = action$ =>
    action$.ofType(TEXT_SEARCH_STARTED)
        .debounceTime(250)
        .switchMap( action =>
        // create a stream of streams from array
            Rx.Observable.from(
                (action.services || [ {type: "nominatim", priority: 5} ])
                // Create an stream for each Service
                    .map((service) => {
                        const serviceInstance = API.Utils.getService(service.type);
                        if (!serviceInstance) {
                            const err = new Error("Service Missing");
                            err.msgId = "search.service_missing";
                            err.serviceType = service.type;
                            return Rx.Observable.of(err).do((e) => {throw e; });
                        }
                        return Rx.Observable.defer(() =>
                            serviceInstance(action.searchText, service.options)
                                .then( (response = []) => response.map(result => ({...result, __SERVICE__: service, __PRIORITY__: service.priority || 0}))
                                ))
                            .retryWhen(errors => errors.delay(200).scan((count, err) => {
                                if ( count >= 2) {
                                    throw err;
                                }
                                return count + 1;
                            }, 0));
                    }) // map
            )// from
            // merge all results from the streams
                .mergeAll()
                .scan((oldRes, newRes) => sortBy([...oldRes, ...newRes], ["__PRIORITY__"]))
            // limit the number of results returned from all services to maxResults
                .map((results) => searchResultLoaded(results.slice(0, action.maxResults || 15), false))
                .startWith(searchTextLoading(true))
                .takeUntil(action$.ofType( TEXT_SEARCH_RESULTS_PURGE, TEXT_SEARCH_RESET, TEXT_SEARCH_ITEM_SELECTED))
                .concat([searchTextLoading(false)])
                .catch(e => {
                    const err = {msgId: "search.generic_error", ...e, message: e.message, stack: e.stack};
                    return Rx.Observable.from([searchResultError(err), searchTextLoading(false)]);
                })
        );

/**
 * Gets every `TEXT_SEARCH_ITEM_SELECTED` event.
 * on item selections zooms to the selected item, adds the marker to the marker layer and clear
 * search results.
 * If the selected item has a `__SERVICE__.then` entry, configures the search tool
 * to manage the nested services.
 * If the searvice has a search text template, it configures the searchText with
 * using the template.
 * @param {Observable} action$ stream of actions. Manages `TEXT_SEARCH_ITEM_SELECTED`
 * @memberof epics.search
 * @return {Observable}
 */

export const searchItemSelected = (action$) =>
    action$.ofType(TEXT_SEARCH_ITEM_SELECTED)
        .switchMap(action => {
            // itemSelectionStream --> emits actions for zoom and marker add
            let itemSelectionStream = Rx.Observable.of(action.item)
                .concatMap((item) => {
                    if (item && item.__SERVICE__ && item.__SERVICE__.geomService) {
                        let staticFilter = generateTemplateString(item.__SERVICE__.geomService.options.staticFilter || "")(item);
                        // retrieve geometry from geomService or pass the item directly
                        return Rx.Observable.fromPromise(
                            API.Utils.getService(item.__SERVICE__.geomService.type)("", Object.assign({}, item.__SERVICE__.geomService.options, { staticFilter }))
                                .then(res => Object.assign({}, item, { geometry: CoordinatesUtils.mergeToPolyGeom(res) }))
                        );
                    }
                    return Rx.Observable.of(action.item);
                }).concatMap((item) => {
                    // check if the service has been configured to start a GetFeatureInfo request based on the item selected
                    // if so, then do it with a point inside the geometry
                    let bbox = item.bbox || item.properties.bbox || toBbox(item);
                    let actions = [
                        zoomToExtent([bbox[0], bbox[1], bbox[2], bbox[3]], "EPSG:4326", item.__SERVICE__ && item.__SERVICE__.options && item.__SERVICE__.options.maxZoomLevel || 21),
                        addMarker(item)
                    ];
                    return actions;
                });

            const item = action.item;
            let nestedServices = item && item.__SERVICE__ && item.__SERVICE__.then;
            // if a nested service is present, select the item and the nested service
            let nestedServicesStream = nestedServices ? Rx.Observable.of(selectNestedService(
                nestedServices.map((nestedService) => ({
                    ...nestedService,
                    options: {
                        item,
                        ...nestedService.options
                    }
                })), {
                    text: generateTemplateString(item.__SERVICE__.displayName || "")(item),
                    placeholder: item.__SERVICE__.nestedPlaceholder && generateTemplateString(item.__SERVICE__.nestedPlaceholder || "")(item),
                    placeholderMsgId: item.__SERVICE__.nestedPlaceholderMsgId && generateTemplateString(item.__SERVICE__.nestedPlaceholderMsgId || "")(item)
                },
                generateTemplateString(item.__SERVICE__.searchTextTemplate || "")(item)
            )) : Rx.Observable.empty();

            // if the service has a searchTextTemplate, use it to modify the search text to display
            let searchTextTemplate = item.__SERVICE__ && item.__SERVICE__.searchTextTemplate;
            let searchTextStream = searchTextTemplate ? Rx.Observable.of(searchTextChanged(generateTemplateString(searchTextTemplate)(item))) : Rx.Observable.empty();

            return Rx.Observable.of(resultsPurge()).concat(itemSelectionStream, nestedServicesStream, searchTextStream);
        });

/**
 * Handles performing a GFI on the selected search results after zooming in, and adds a marker
 * @param {external:Observable} action$ manages [`FEATURE_INFO_CLICK` and `SHOW_MAPINFO_MARKER`] for showing identify feature info
 * @memberof epics.search
 * @return {external:Observable}
 */
export const getFeatureInfoOfSelectedItem = (action$, store) =>
    action$.ofType(TEXT_SEARCH_ADD_MARKER).switchMap((action) => {
        const item = action.markerPosition;
        if (item.__SERVICE__ && !isNil(item.__SERVICE__.launchInfoPanel) && item.__SERVICE__.options && item.__SERVICE__.options.typeName) {
            let coord = pointOnSurface(item).geometry.coordinates;
            const latlng = { lng: coord[0], lat: coord[1] };
            const typeName = item.__SERVICE__.options.typeName;
            if (coord) {
                const state = store.getState();
                const layerObj = typeName && getLayerFromName(state, typeName);
                let itemId = null;
                let filterNameList = [];
                let overrideParams = {};
                let forceVisibility = false;
                if (item.__SERVICE__.launchInfoPanel === "single_layer") {
                    /* take info from the item selected and restrict feature info to this layer
                    * and filtering with `featureid` which might be ignored by other servers,
                    * but can be used by GeoServer to select the specific feature instead to showing all the results
                    * when info_format is other than application/json */
                    forceVisibility = item.__SERVICE__.forceSearchLayerVisibility;
                    filterNameList = [typeName];
                    itemId = item.id;
                    overrideParams = {
                        [item.__SERVICE__.options.typeName]: {
                            info_format: getInfoFormat(layerObj, state),
                            ...(itemId
                                ? {
                                    featureid: itemId,
                                    CQL_FILTER: undefined
                                }
                                : {}
                            )
                        }
                    };
                }
                const ignoreVisibilityLimits = true;
                return [
                    ...(forceVisibility && layerObj ? [changeLayerProperties(layerObj.id, {visibility: true})] : []),
                    ...(!item.__SERVICE__.openFeatureInfoButtonEnabled ? [featureInfoClick({ latlng }, typeName, filterNameList, overrideParams, itemId, ignoreVisibilityLimits)] : []),

                    showMapinfoMarker()
                ];
            }
        }
        return Rx.Observable.empty();
    }).delay(50);
/**
 * Handles show GFI button click action.
 */
export const textSearchShowGFIEpic = (action$, store) =>
    action$.ofType(TEXT_SEARCH_SHOW_GFI)
        .filter(({item = {}}) => !item?.__SERVICE__?.customGFI)
        .switchMap(({item}) => {
            const state = store.getState();
            const typeName = item?.__SERVICE__?.options?.typeName;
            const layerObj = typeName && getLayerFromName(state, typeName);
            const bbox = item.bbox || item.properties.bbox || toBbox(item);
            const coord = pointOnSurface(item).geometry.coordinates;
            const latlng = { lng: coord[0], lat: coord[1] };
            const itemId = item.id;
            const ignoreVisibilityLimits = true;
            return !!coord &&
                showGFIForService(item?.__SERVICE__) && layerIsVisibleForGFI(layerObj, item?.__SERVICE__) ?
                Rx.Observable.of(
                    ...(item?.__SERVICE__?.forceSearchLayerVisibility && layerObj ? [changeLayerProperties(layerObj.id, {visibility: true})] : []),
                    featureInfoClick({ latlng }, typeName, [typeName], {
                        [typeName]: {
                            info_format: getInfoFormat(layerObj, state),
                            ...(itemId
                                ? {
                                    featureid: itemId,
                                    // GeoServer rises an error in case CQL_FILTER and featureId are present in the same time
                                    // so we need to remove it (anyway featureid filter is enough)
                                    CQL_FILTER: undefined
                                }
                                : {}
                            )
                        } }, itemId, ignoreVisibilityLimits),
                    showMapinfoMarker(),
                    addMarker(item)
                ).merge(
                    // wait for response received (so feature info panel open)
                    // to zoom to extent, in order to center the geometry in the visible bounding box
                    bbox ?
                        action$
                            .ofType(LOAD_FEATURE_INFO)
                            .take(1)
                            .mapTo(zoomToExtent([bbox[0], bbox[1], bbox[2], bbox[3]], "EPSG:4326", item?.__SERVICE__?.options?.maxZoomLevel || 21))
                            .takeUntil(action$.ofType(EXCEPTIONS_FEATURE_INFO, ERROR_FEATURE_INFO))
                        : Rx.Observable.empty()
                )
                // disable temporary centerToMarker when this operation happens, because we have the zoom
                    .let(stream$ => bbox && centerToMarkerSelector(store.getState())
                        ? stream$.startWith(updateCenterToMarker(false)).concat(Rx.Observable.of(updateCenterToMarker(true)))
                        : stream$
                    )
                : Rx.Observable.empty();
        });

/**
 * Gets every `ZOOM_ADD_POINT` event.
 * it creates/updates an additional layer for showing a marker for a given point
 *
*/
export const zoomAndAddPointEpic = (action$, store) =>
    action$.ofType(ZOOM_ADD_POINT)
        .switchMap(action => {
            const feature = {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [action.pos.x, action.pos.y]
                }
            };

            const state = store.getState();
            return Rx.Observable.from([
                updateAdditionalLayer("search", "search", 'overlay', {
                    features: [feature],
                    type: "vector",
                    name: "searchPoints",
                    id: "searchPoints",
                    visibility: true,
                    style: state.search && state.search.style || defaultIconStyle
                }),
                zoomToPoint(action.pos, action.zoom, action.crs)
            ]);
        });


/**
 * Gets every `SEARCH_WITH_FILTER` event.
 * Triggers a GetFeature with a subsequent getFeatureInfo with a point taken from geometry of first feature retrieved
*/
export const searchOnStartEpic = (action$, store) =>
    action$.ofType(SEARCH_LAYER_WITH_FILTER)
        .switchMap(({layer: name, "cql_filter": cqlFilter, queryParamZoomOption = {}}) => {
            const state = store.getState();
            let queryableLayers = [...layersSelector(state)].filter(l=>defaultQueryableFilter(l));          // ignore visibility limits
            const isLayerNotQueryableSelected = queryableLayers.filter(l => l.name === name).length === 0;
            // if layer is NOT queriable and visible then show error notification
            if (isLayerNotQueryableSelected) {
                return Rx.Observable.of(nonQueriableLayerError());
            }
            const layer = getLayerFromName(state, name);
            if (layer && cqlFilter) {
                return Rx.Observable.defer(() =>
                // take geoserver url from layer
                    getFeatureSimple(layer.url, {
                        maxFeatures: 1,
                        typeName: name,
                        srsName: "EPSG:4326",
                        outputFormat: "application/json",
                        // create a filter like : `(ATTR ilike '%word1%') AND (ATTR ilike '%word2%')`
                        cql_filter: cqlFilter
                    })
                        .then( (response = {}) => response.features && response.features.length && {...response.features[0], typeName: name})
                )
                    .switchMap(({ type, geometry, typeName, bbox }) => {
                        const coord = pointOnSurface({ type, geometry }).geometry.coordinates;
                        if (coord) {
                            const latlng = {lng: coord[0], lat: coord[1] };
                            const projection = projectionSelector(store.getState());
                            const { x, y } = reproject(
                                coord,
                                "EPSG:4326",
                                projection
                            );
                            let mapActionObservable;
                            if (isMapPopup(store.getState())) {
                                mapActionObservable = Rx.Observable.of(
                                    addPopup(uuid(), {
                                        component: IDENTIFY_POPUP,
                                        maxWidth: 600,
                                        position: { coordinates: [x, y] }
                                    })
                                );
                            } else {
                                mapActionObservable = Rx.Observable.of(
                                    showMapinfoMarker()
                                );
                            }
                            const ignoreVisibilityLimits = true;
                            // trigger get feature info
                            return Rx.Observable.of(
                                featureInfoClick(
                                    { latlng },
                                    typeName,
                                    [typeName],
                                    { [typeName]: { cql_filter: cqlFilter } }, null, ignoreVisibilityLimits, bbox ? bbox : bboxTurf(geometry), queryParamZoomOption
                                )
                            )
                                .merge(mapActionObservable);
                        }
                        return Rx.Observable.empty();
                    }).catch(() => {
                        return Rx.Observable.of(serverError());
                    });
            }
            return Rx.Observable.empty();
        });

/**
 * Gets every `SCHEDULE_SEARCH_LAYER_WITH_FILTER` event.
 * Triggers a GetFeature with a subsequent getFeatureInfo with a point taken from geometry of first feature retrieved after layer is added to the map
 */
export const delayedSearchEpic = (action$) =>
    action$.ofType(SCHEDULE_SEARCH_LAYER_WITH_FILTER)
        .switchMap(({layer: name, "cql_filter": cqlFilter, queryParamZoomOption = {}}) => {
            return action$.ofType(ADD_LAYER)
                .filter(({layer}) => layer.name === name)
                .take(1)
                .switchMap(() => {
                    return Rx.Observable.of(searchLayerWithFilter({layer: name, "cql_filter": cqlFilter, queryParamZoomOption}));
                });
        });
