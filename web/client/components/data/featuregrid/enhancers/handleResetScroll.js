/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { compose, branch, withHandlers, mapPropsStream, createEventHandler } = require('recompose');

/**
 * This enhancer forces refresh of records of the current position of the grid
 * by forcing a scroll event when filter or sort event happens.
 * This because the current enhancer that manages virtual scroll doesn't take into account sort or filter
 * events. So when one of these events happens, the feature grid triggers a load of the first page, but not the current position, showing blank records.
 */
module.exports = branch(
    ({ virtualScroll }) => virtualScroll,
    compose(
        mapPropsStream( props$ => {
            const { handler: updateScrollState, stream: updateScrollState$} = createEventHandler();
            const {handler: refreshCurrentPage, stream: refreshCurrentPage$} = createEventHandler();
            return props$.combineLatest(
                updateScrollState$
                    .combineLatest(
                        refreshCurrentPage$,
                        (scroll) => scroll
                    )
                    .withLatestFrom(
                        props$,
                        (scrollState, {onGridScroll = () => { }}) => ({ scrollState, onGridScroll})
                    )
                    .debounceTime(1000)
                    .do(({ scrollState, onGridScroll = () => { } }) => onGridScroll(scrollState))
                    .ignoreElements()
                    .startWith({}),
                (props) => ({
                    ...props,
                    updateScrollState,
                    refreshCurrentPage
                })
            );

        }),
        withHandlers({
            onGridScroll: ({ onGridScroll = () => { }, _setScrollState = () => { }, updateScrollState = () => {} }) => (scrollState) => {
                _setScrollState(scrollState);
                updateScrollState(scrollState);
                return onGridScroll(scrollState);
            },
            onGridSort: ({ onGridSort = () => { }, refreshCurrentPage = () => { } }) => (...args) => {
                refreshCurrentPage();

                return onGridSort(...args);
            },
            onAddFilter: ({ onAddFilter = () => { }, refreshCurrentPage = () => { }}) => (...args) => {
                refreshCurrentPage();
                onAddFilter(...args);
            }
        })
    )
);
