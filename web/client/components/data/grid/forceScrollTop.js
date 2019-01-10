/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { compose, branch, withHandlers, mapPropsStream, createEventHandler } = require('recompose');
const Rx = require('rxjs');
/**
 * This enhancer forces the `DataGrid` to scroll to top when a sort or a filter event is performed.
 * This is a workaround needed in a virtualScroll context, because the virtual scroll enhancer doesn't take care
 * of the current position when filter or sort event happens, so the grid  will load the first page and nothing more,
 * leaving current records blank. In any case, the correct solution is to current position outside, to allow correct reload
 * of current records.
 * The forced refresh is implemented by updating the `scrollToTopCounter` property every time
 * a sort or a filter event is triggered.
 */
module.exports = branch(
    ({ virtualScroll }) => virtualScroll,
    compose(
        mapPropsStream( props$ => {
            const { handler: scrollToTop, stream: scrollToTop$} = createEventHandler();
            return props$.combineLatest(
                // add an incremental `scrollToTopCounter` variable each time scrollToTop handler is called
                scrollToTop$
                    .throttle((time = 0) => Rx.Observable.timer(time))
                    .scan((acc) => acc + 1, 0)
                    .map(scrollToTopCounter => ({scrollToTopCounter}))
                    .startWith({}),
                (props, forceScrollProps) => ({
                    ...props,
                    ...forceScrollProps,
                    scrollToTop
                })
            );

        }),
        withHandlers({
            onGridSort: ({ onGridSort = () => { }, scrollToTop = () => { } }) => (...args) => {
                scrollToTop(0);
                return onGridSort(...args);
            },
            onAddFilter: ({ onAddFilter = () => { }, scrollToTop = () => { }}) => (...args) => {
                scrollToTop(1000);
                onAddFilter(...args);
            }
        })
    )
);
