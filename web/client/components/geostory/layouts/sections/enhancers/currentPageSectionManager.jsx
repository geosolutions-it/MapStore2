/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, createEventHandler, mapPropsStream } from 'recompose';
import { get, maxBy } from "lodash";
import { Observable } from "rxjs";

// TODO: externalize
import { setObservableConfig } from 'recompose';
import rxjsConfig from 'recompose/rxjsObservableConfig';
setObservableConfig(rxjsConfig);

/**
 * Handles the intersection event stream into calls to `updateCurrentPage`, when the current section changes.
 * @param {stream} intersection$ the stream of intersection event calls
 */
const createCurrentPageUpdateStream = (intersection$, props$) =>
    intersection$
        // create a map with the latest states of each intersection event
        .scan((visibleItems = {}, { id, visible, entry }) => ({
            ...visibleItems,
            [id]: {
                visible,
                entry
            }
        }), {})
        // select the current section id
        .map((visibleItems = {}) =>
            // get the one with max intersectionRatio that should be the current sectionId
            maxBy(
                Object.keys(visibleItems),
                (k) => get(visibleItems[k], 'entry.intersectionRatio')
            )
        )
        // optimization to avoid not useful events
        .distinctUntilChanged()
        // create the property from the Id stream
        .withLatestFrom(props$.pluck('updateCurrentPage'))
        .do(([sectionId, updateCurrentPage]) => updateCurrentPage && updateCurrentPage({sectionId}))
        .ignoreElements();

/**
 * Enhances the story containers to call `updateCurrentPage` when `onVisibilityChange` is called
 * updating the latest sectionId visible in the page.
 */
export default compose(
    mapPropsStream(props$ => {
        // create an handler for intersection events
        const { handler: onVisibilityChange, stream: intersection$ } = createEventHandler();
        return Observable.combineLatest(
            props$, // rendering properties stream
            createCurrentPageUpdateStream(intersection$, props$) // generates updateCurrentPage calls when section is updated by calling updateCurrentPage
                .startWith({}), // emit first event from all the streams to allow first rendering
            // HERE WE CAN PLACE EVERY OTHER INTERSECTION EVENT STREAM HANDLER
            (...propsParts) => ({
                ...(propsParts.reduce((props = {}, part) => ({ ...props, ...part }), {})),
                onVisibilityChange
            })
        );
    })
);
