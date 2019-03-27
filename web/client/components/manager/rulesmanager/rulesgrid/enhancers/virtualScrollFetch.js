/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const { loadRules } = require('../../../../../observables/rulesmanager');
const sameFilter = ({filters: f1}, {filters: f2}) => f1 === f2;
const {updatePages, getPagesToLoad} = require('../../../../../utils/RulesGridUtils');
/**
 * Create an operator that responds to page$ request stream.
 * While loading the pages request are stored and the last request is emitted on load end
 * @param {Observable} page$ the stream of virtual scroll pages requests
 * @returns a function that can be merged with stream of
 * props to retrieve data using virtual scroll. This stearm doesn't emit
 */
module.exports = page$ => props$ => props$.distinctUntilChanged((oProps, nProps) => sameFilter(oProps, nProps))
    .switchMap(({size = 5, maxStoredPages = 5, filters = {},
        onLoad = () => { }, moreRules, setLoading, onLoadError = () => { }
    }) => page$.delay(1).exhaustMap((pagesRequest) => {
        // First request
        setLoading(true);
        return loadRules(pagesRequest.pagesToLoad, filters, size)
            .do(newPages => onLoad({
                ...updatePages(newPages.pages, pagesRequest, maxStoredPages)
            }))
            .do(() => setLoading(false))
            .catch((e) => Rx.Observable.of({
                error: e
            }).do(() => onLoadError({
                title: "rulesmanager.errorTitle",
                message: "rulesmanager.errorLoadingRules"
            })).do(() => setLoading(false))) // Store pages requests and emit on first request end
            .withLatestFrom(page$, ({pages: nPages}, lastRequest) => ({
                lastRequest,
                nPages
            }))
            .filter(({error}) => !error)
            .map(({lastRequest, nPages}) => {
                // Prepare the new request merging last loaded pages and last pages request
                const {pages: tPages} = updatePages(nPages, pagesRequest, maxStoredPages);
                const pagesToLoad = getPagesToLoad(lastRequest.startPage, lastRequest.endPage, tPages);
                return {...lastRequest,
                    pages: tPages,
                    pagesToLoad};
            })
            .filter(({pagesToLoad}) => pagesToLoad.length > 0)
            .do((newRequest) => moreRules(newRequest));
    })
    );
