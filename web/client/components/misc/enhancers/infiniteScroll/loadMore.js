/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { mapPropsStream, createEventHandler} = require('recompose');
const Rx = require('rxjs');

/**
 * Create a stream that does the implements the infinite scrollTop
 * @param  {Observable} initialLoadStream$ A stream that emits the first load with load page parameters
 * @param  {Observable} loadMore$          Stream of events triggered to load more pages
 * @param  {function} loadPage           A function that returns the observable that emits the page loaded. the event emitted must have at least { items [ ...items of the new page], total: the total number of results}
 * @return {Observable}                    Stream of props {with items, loading, error, total}
 */
const loadMoreStream = (initialStream$, loadMore$, loadPage) =>
    initialStream$.switchMap(searchParams =>
        loadPage(searchParams, 0)
            .startWith({ loading: true })
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
            .scan(({ items, ...other }, { items: newItems, ...newOther }) => ({
                items: newItems ? [...(items || []), ...newItems] : items || [],
                ...other,
                ...newOther
            }))
    )
        .catch(error => Rx.Observable.of({ loading: false, error }));
/**
 * Enhancer that implements paginated data retrival in append mode for the enhanced component.
 * Currently is made to work with `withInfiniteScroll`. The idea is that you are going to load data with some parameters,
 * then next pages will use the same parameters, so the only thing that changes is the page number.
 * Accepts a prop handler that returns a stream `loadPage`. The events from this stream will be merged to
 * incoming upper component props, adding a `loading` prop that turns true and then false at the beginning and the end of the stream.
 * loadPage gets 2 params:
 *  - searchParams: the params of the current data loading
 *  - page: the page to load.
 * In addition to these props, it adds 2 handlers:
 *  - loadFirst: emits an event on the steam to load page 0. Useful if you want
 *  - onLoadMore: triggers the load of the page x, where x is the page number. items props from the stream will be appended to the existing ones
 * A tipical usage is, of course with infinite scroll.
 * ```
 * const MyCmp ({loadFirst, onLoadMore}) => (<div>
 *  <button onClick={() => loadFirst()}>Load first page</button>
 *  <button onClick={() => onLoadPage(1)}>Load page 1</button> // you could manage page number state
 * </div>)
 * const CMP = ()(MyCmp);
 * ```
 * @param {function} loadPage the function that returns the stream. It must accept 2 params: `searchParams`, `page`.
 */

module.exports = (loadPage = () => Rx.Observable.empty()) => mapPropsStream((props$) => {
    const { handler: onLoadMore, stream: loadMore$ } = createEventHandler();
    const { handler: loadFirst, stream: initialStream$ } = createEventHandler();
    return props$.combineLatest(loadMoreStream(
        initialStream$,
        loadMore$,
        loadPage
    ).startWith({}), (a, b) => ({
        ...a,
        ...b,
        onLoadMore,
        loadFirst
    }));
});
