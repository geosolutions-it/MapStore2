/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

// var GeoCodingApi = require('../api/Nominatim');

const {TEXT_SEARCH_STARTED, TEXT_SEARCH_RESULTS_PURGE, TEXT_SEARCH_RESET, searchTextLoading, searchResultLoaded, searchResultError} = require('../actions/search');
const Rx = require('rxjs');
const services = require('../api/searchText');

const get = require('lodash');
const searchEpic = action$ =>
  action$.ofType(TEXT_SEARCH_STARTED)
    .debounceTime(250)
    .mergeMap( action =>
            Rx.Observable.forkJoin(
                (action.services || [ {type: "nominatim"} ])
                    .map( service => services[service.type](action.searchText, service.options)
                    .then( (response= []) => response.map(result => ({...result, __SERVICE__: service})) )
                )
            ).concatAll()
            // ----[a]------------------
            // --------[c]--------------
            // -------------[b]---------
            .scan( (oldRes, newRes) => [...oldRes, ...newRes].sort( (a, b) => get(a, "_SERVICE__.priority") > get(b, "_SERVICE__.priority") ))
            // ----[a]-[a,c]-[a,b,c]-----
            .map((results) => searchResultLoaded(results, false))
            .takeUntil(action$.ofType([ TEXT_SEARCH_STARTED, TEXT_SEARCH_RESULTS_PURGE, TEXT_SEARCH_RESET]))
            .startWith(searchTextLoading(true))
            .concat([searchTextLoading(false)])
            .catch(e => Rx.Observable.from([searchResultError(e), searchTextLoading(false)]))

);

module.exports = {
    searchEpic
};
