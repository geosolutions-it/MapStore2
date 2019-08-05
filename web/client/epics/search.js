/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import * as Rx from 'rxjs';
import toBbox from 'turf-bbox';
import assign from 'object-assign';
import {head} from 'lodash';

import { queryableLayersSelector, getLayerFromName } from '../selectors/layers';

import { updateAdditionalLayer } from '../actions/additionallayers';
import { showMapinfoMarker, featureInfoClick} from '../actions/mapInfo';
import { changeMapView, zoomToPoint} from '../actions/map';
import {
    SEARCH_LAYER_WITH_FILTER,
    TEXT_SEARCH_STARTED,
    TEXT_SEARCH_RESULTS_PURGE,
    TEXT_SEARCH_RESET,
    TEXT_SEARCH_ITEM_SELECTED,
    ZOOM_ADD_POINT,
    addMarker,
    nonQueriableLayerError,
    serverError,
    resultsPurge,
    searchTextLoading,
    searchResultLoaded,
    searchResultError,
    selectNestedService,
	searchTextChanged
} from '../actions/search';

import CoordinatesUtils from '../utils/CoordinatesUtils';
import mapUtils from '../utils/MapUtils';
import {defaultIconStyle} from '../utils/SearchUtils';
import {generateTemplateString} from '../utils/TemplateUtils';

import {API} from '../api/searchText';
import {getFeatureSimple} from '../api/WFS';
import {sortBy} from 'lodash';

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
            (action.services || [ {type: "nominatim"} ])
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
        .scan( (oldRes, newRes) => sortBy([...oldRes, ...newRes], ["__PRIORITY__"]))
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

export const searchItemSelected = action$ =>
    action$.ofType(TEXT_SEARCH_ITEM_SELECTED)
    .switchMap(action => {
        // itemSelectionStream --> emits actions for zoom and marker add
        let itemSelectionStream = Rx.Observable.of(action.item)
            .concatMap((item) => {
                if (item && item.__SERVICE__ && item.__SERVICE__.geomService) {
                    let staticFilter = generateTemplateString(item.__SERVICE__.geomService.options.staticFilter || "")(item);
                    // retrieve geometry from geomService or pass the item directly
                    return Rx.Observable.fromPromise(
                        API.Utils.getService(item.__SERVICE__.geomService.type)("", assign( {}, item.__SERVICE__.geomService.options, { staticFilter } ))
                            .then(res => assign({}, item, {geometry: CoordinatesUtils.mergeToPolyGeom(res)} ) )
                    );
                }
                return Rx.Observable.of(action.item);
            }).concatMap((item) => {
                let bbox = item.bbox || item.properties.bbox || toBbox(item);
                let mapSize = action.mapConfig.size;

                // zoom by the max. extent defined in the map's config
                let newZoom = mapUtils.getZoomForExtent(CoordinatesUtils.reprojectBbox(bbox, "EPSG:4326", action.mapConfig.projection), mapSize, 0, 21, null);

                // center by the max. extent defined in the map's config
                let newCenter = mapUtils.getCenterForExtent(bbox, "EPSG:4326");
                let actions = [
                    changeMapView(newCenter, newZoom, {
                        bounds: {
                            minx: bbox[0],
                            miny: bbox[1],
                            maxx: bbox[2],
                            maxy: bbox[3]
                        },
                        crs: "EPSG:4326",
                        rotation: 0
                    }, action.mapConfig.size, null, action.mapConfig.projection),
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


export const getFirstCoord = (geometry = {}) => {
    switch (geometry && geometry.type) {
        case "Point": return geometry.coordinates;
        case "LineString": case "MultiPoint": return head(geometry.coordinates);
        case "Polygon": case "MultiLineString": return head(head(geometry.coordinates));
        case "MultiPolygon": return head(head(head(geometry.coordinates)));
        default: return null;
    }
};

/**
 * Gets every `SEARCH_WITH_FILTER` event.
 * Triggers a GetFeature with a subsequent getFeatureInfo with a point taken from geometry of first feature retrieved
*/
export const searchOnStartEpic = (action$, store) =>
    action$.ofType(SEARCH_LAYER_WITH_FILTER)
        .switchMap(({layer: name, "cql_filter": cqlFilter}) => {
            const state = store.getState();
            // if layer is NOT queriable and visible then show error notification
            if (queryableLayersSelector(state).filter(l => l.name === name ).length === 0) {
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
                .switchMap(({geometry, typeName}) => {
                    let coord = getFirstCoord(geometry);
                    const latlng = {lng: coord[0], lat: coord[1] };

                    if (coord) { // trigger get feature info
                        return Rx.Observable.of(featureInfoClick({latlng}, typeName, [typeName], {[typeName]: {cql_filter: cqlFilter}}), showMapinfoMarker());
                    }
                    return Rx.Observable.empty();
                }).catch(() => {
                    return Rx.Observable.of(serverError());
                });
            }
            return Rx.Observable.empty();
        });
