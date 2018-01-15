/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const Rx = require('rxjs');

const {compose, createEventHandler, mapPropsStream} = require('recompose');
const withScrollSpy = require('./withScrollSpy');


/**
 * Create a stream that does the implements the infinite scrollTop
 * @param  {Observable} initialLoadStream$ A stream that emits the first load with load page parameters
 * @param  {Observable} loadMore$          Stream of events triggered to load more pages
 * @param  {function} loadPage           A function that returns the observable that emits the page loaded. the event emitted must have at least { items [ ...items of the new page], total: the total number of results}
 * @return {Observable}                    Stream of props {with items, loading, error, total}
 */
const virtualScrollStream = (initialLoadStream$, loadMore$, loadPage) =>
    initialLoadStream$.switchMap( searchParams =>
        loadPage(searchParams, 0)
            .startWith({loading: true})
            .concat(
                loadMore$
                    .throttleTime(500)
                    .distinct()
                    .exhaustMap(page =>
                        loadPage(searchParams, page)
                        .startWith({
                            loading: true
                        })
                    )
            )
            .scan( ({items, ...other }, {items: newItems, ...newOther}) => ({
                items: newItems ? [...(items || []), ...newItems] : items || [],
                ...other,
                ...newOther
            }))
    )
    .catch(error => Rx.Observable.of({loading: false, error}));

/**
 * Add infinite scroll functionality to a component.
 *
 * To do that you must provide the following parameters:
 * @param  {function} loadPage         A function that returns an observable that emits props with at least `{items: [items of the page], total: 100}`
 * @param  {[type]} scrollSpyOptions [description]
 * @return {[type]}                  [description]
 */
module.exports = ({
    loadPage,
    scrollSpyOptions
}) => compose(
        mapPropsStream((props$) => {
            const {handler: onLoadMore, stream: loadMore$} = createEventHandler();
            const {handler: loadFirst, stream: initialStream} = createEventHandler();
            return props$.combineLatest(virtualScrollStream(
                initialStream,
                loadMore$,
                loadPage
            ).startWith({}), (a, b) => ({
                ...a,
                ...b,
                onLoadMore,
                loadFirst
            }));
        }),
        withScrollSpy(scrollSpyOptions)

);
