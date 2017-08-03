/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {TEXT_SEARCH_STARTED,
    TEXT_SEARCH_RESULTS_PURGE,
    TEXT_SEARCH_RESET,
    TEXT_SEARCH_ITEM_SELECTED,
    searchTextLoading,
    searchResultLoaded,
    searchResultError,
    addMarker,
    selectNestedService,
    searchTextChanged,
    resultsPurge
    } = require('../actions/search');

const mapUtils = require('../utils/MapUtils');
const CoordinatesUtils = require('../utils/CoordinatesUtils');
const Rx = require('rxjs');
const {API} = require('../api/searchText');
const {changeMapView} = require('../actions/map');
const toBbox = require('turf-bbox');
const {generateTemplateString} = require('../utils/TemplateUtils');
const assign = require('object-assign');

const {get} = require('lodash');

/**
 * Gets every `TEXT_SEARCH_STARTED` event.
 * Dispatches the request to all the services in the action, postprocess them
 * and updates every tume the results
 * @param {external:Observable} action$ manages `TEXT_SEARCH_STARTED` and `TEXT_SEARCH_RESULTS_PURGE`, `TEXT_SEARCH_RESET`, `TEXT_SEARCH_ITEM_SELECTED` for cancellation
 * @memberof epics.search
 * @return {external:Observable}
 */
const searchEpic = action$ =>
  action$.ofType(TEXT_SEARCH_STARTED)
    .debounceTime(250)
    .switchMap( action =>
         // create a stream of streams from array
        Rx.Observable.from(
            (action.services || [ {type: "nominatim"} ])
             // Create an stream for each Service
            .map((service) =>
                Rx.Observable.defer(() =>
                    API.Utils.getService(service.type)(action.searchText, service.options)
                        .then( (response = []) => response.map(result => ({...result, __SERVICE__: service, __PRIORITY__: service.priority || 0}))
                ))
                .retryWhen(errors => errors.delay(200).scan((count, err) => {
                    if ( count >= 2) {
                        throw err;
                    }
                    return count + 1;
                }, 0))
            ) // map
        ) // from
        // merge all results from the streams
        .mergeAll()
        .scan( (oldRes, newRes) => [...oldRes, ...newRes].sort( (a, b) => get(b, "__PRIORITY__") - get(a, "__PRIORITY__") ) .slice(0, 15))
        .map((results) => searchResultLoaded(results, false))
        .startWith(searchTextLoading(true))
        .takeUntil(action$.ofType( TEXT_SEARCH_RESULTS_PURGE, TEXT_SEARCH_RESET, TEXT_SEARCH_ITEM_SELECTED))
        .concat([searchTextLoading(false)])
        .catch(e => Rx.Observable.from([searchResultError(e), searchTextLoading(false)]))
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

const searchItemSelected = action$ =>
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
     * Actions for search
     * @name epics.search
     */
module.exports = {
    searchEpic,
    searchItemSelected
};
