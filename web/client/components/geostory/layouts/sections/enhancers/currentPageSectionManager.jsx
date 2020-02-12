/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, createEventHandler, mapPropsStream, setObservableConfig } from 'recompose';
import { get, minBy} from "lodash";
import { Observable } from "rxjs";

// TODO: externalize
import rxjsConfig from 'recompose/rxjsObservableConfig';
setObservableConfig(rxjsConfig);
/**
 * Handles the intersection event stream into calls to `updateCurrentPage`, when the current section changes.
 * @param {stream} intersection$ the stream of intersection event calls
 */
const createCurrentPageUpdateStream = (intersection$, props$) =>
    props$.map(({interceptorTime, updateCurrentPage} = {}) => ({interceptorTime, updateCurrentPage}) )
        .distinctUntilKeyChanged("interceptorTime") // Configurable delay
        .switchMap(({interceptorTime: delay = 100, updateCurrentPage} = {}) => {
            return intersection$
                // create a map with the latest states of each intersection event
                .scan((items = {}, { id, visible, entry }) => ({
                    ...items,
                    [id]: {
                        visible,
                        entry
                    }
                }), {})
                .debounceTime(delay) // Try to improve performances, debounce before calculations
                // select the current section id
                .map((items = {}) => {
                    // get the highest visible item as current page using the distance from top and not the order in the object
                    const currentSection =  minBy(
                        Object.keys(items),
                        (k) => items[k].visible ? get(items[k], 'entry.boundingClientRect.top') : Infinity
                    );
                    return currentSection;
                })
                .do(sectionId => {
                    updateCurrentPage && updateCurrentPage({sectionId});
                }).ignoreElements();
        });

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
