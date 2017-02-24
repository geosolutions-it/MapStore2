/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

// var GeoCodingApi = require('../api/Nominatim');

const {TEXT_SEARCH_STARTED,
    TEXT_SEARCH_RESULTS_PURGE,
    TEXT_SEARCH_RESET,
    TEXT_SEARCH_ITEM_SELECTED,
    searchTextLoading,
    searchResultLoaded,
    searchResultError,
    addMarker,
    resultsPurge
    } = require('../actions/search');
const mapUtils = require('../utils/MapUtils');
const CoordinatesUtils = require('../utils/CoordinatesUtils');
const Rx = require('rxjs');
const services = require('../api/searchText');
const {changeMapView} = require('../actions/map');
const pointOnSurface = require('turf-point-on-surface');


const get = require('lodash');
const searchEpic = action$ =>
  action$.ofType(TEXT_SEARCH_STARTED)
    .debounceTime(250)
    .switchMap( action =>
            Rx.Observable.forkJoin(
                (action.services || [ {type: "nominatim"} ])
                    .map( (service, index) => services[service.type](action.searchText, service.options)
                    .then( (response= []) => response.map(result => ({...result, __SERVICE__: service.id || index, __PRIORITY__: service.priority})) )
                )
            ).concatAll()
            // ----[a]------------------
            // --------[c]--------------
            // -------------[b]---------
            .scan( (oldRes, newRes) => [...oldRes, ...newRes].sort( (a, b) => get(a, "__PRIORITY__") > get(b, "__PRIORITY__") ))
            // ----[a]-[a,c]-[a,b,c]-----
            .map((results) => searchResultLoaded(results, false, services))
            .takeUntil(action$.ofType([ TEXT_SEARCH_RESULTS_PURGE, TEXT_SEARCH_RESET]))
            .startWith(searchTextLoading(true))
            .concat([searchTextLoading(false)])
            .catch(e => Rx.Observable.from([searchResultError(e), searchTextLoading(false)]))

);
const searchItemSelected = action$ =>
    action$.ofType(TEXT_SEARCH_ITEM_SELECTED)
    .mergeMap(action => {
        const item = action.item;


        let mapSize = action.mapConfig.size;
        // zoom by the max. extent defined in the map's config
        let bbox = item.bbox || item.properties.bbox;
        var newZoom = mapUtils.getZoomForExtent(CoordinatesUtils.reprojectBbox(bbox, "EPSG:4326", action.mapConfig.projection), mapSize, 0, 21, null);

        // center by the max. extent defined in the map's config
        let newCenter = mapUtils.getCenterForExtent(bbox, "EPSG:4326");
        // let markerCoordinates = {lat: newCenter.y, lng: newCenter.x};
        const point = pointOnSurface(item);
        if (point && point.geometry && point.geometry.coordinates) {
            // markerCoordinates = {lat: point.geometry.coordinates[1], lng: point.geometry.coordinates[0]};
        }
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
            addMarker(item),
            resultsPurge()];
        return Rx.Observable.from(actions);
    });

module.exports = {
    searchEpic,
    searchItemSelected
};
