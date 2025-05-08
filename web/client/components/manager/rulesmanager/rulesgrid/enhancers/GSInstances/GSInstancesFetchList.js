/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';

import { loadGSInstances } from '../../../../../../observables/rulesmanager';
const sameFilter = ({filters: f1}, {filters: f2}) => f1 === f2;
import { updatePages, getPagesToLoad } from '../../../../../../utils/RulesGridUtils';

/**
 * Create an operator that responds to page$ request stream.
 * While loading the pages request are stored and the last request is emitted on load end
 * @param {Observable} page$ the stream of virtual scroll pages requests
 * @returns a function that can be merged with stream of
 * props to retrieve data using virtual scroll. This stearm doesn't emit
 */
export default page$ => props$ => props$.distinctUntilChanged((oProps, nProps) => sameFilter(oProps, nProps))
    .switchMap(({maxStoredPages = 5,
        onLoad = () => { }, moreGSInstances, setLoading, onLoadError = () => { }
    }) => page$.delay(1).exhaustMap((pagesRequest) => {
        // First request
        setLoading(true);
        return loadGSInstances()
            .do(({pages, rowsCount}) => onLoad({
                ...updatePages(pages, pagesRequest, maxStoredPages), rowsCount
            }))
            .do(() => setLoading(false))
            .catch((e) => Rx.Observable.of({
                error: e
            }).do(() => onLoadError({
                title: "rulesmanager.errorTitle",
                message: "rulesmanager.errorLoadingGSInstances"
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
            .do((newRequest) => moreGSInstances(newRequest));
    })
    );
