/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, createEventHandler, withProps, mapPropsStream } from 'recompose';
import { findIndex, get, maxBy } from "lodash";
import { Observable } from "rxjs";

const getContentIndex = (contents, id) => {
    const index = findIndex(contents, { id });
    return contents[index === -1 || !index ? 0 : index];
};

const createBackgroundIdStream = (intersection$) =>
    intersection$
        // create a map with the latest states of each intersection event
        .scan((visibleItems = {}, { id, visible, entry }) => ({
            ...visibleItems,
            [id]: {
                visible,
                entry
            }
        }), {})
        // select the current background id
        .map((visibleItems = {}) =>
            // get the one with max intersectionRatio that should be the selected background ID
            maxBy(
                Object.keys(visibleItems),
                (k) => get(visibleItems[k], 'entry.intersectionRatio')
            )
        )
        // optimization
        .distinctUntilChanged()
        // create the prop
        .map(backgroundId => ({
            backgroundId
        }));

export const backgroundProp = withProps(

    ({ backgroundId, contents = [] }) => ({
        background: get(getContentIndex(contents, backgroundId) || 0, 'background') || {
            type: 'none'
        }
    }));
/**
 * Holds the current background as background property
 * by intercepting onVisibilityChange from components.
 */
export default compose(
    mapPropsStream(props$ => {
        const { handler: onVisibilityChange, stream: intersection$ } = createEventHandler();
        return Observable.combineLatest(
            props$,
            createBackgroundIdStream(intersection$, props$)
                .startWith({}), // emit first event from all the streams to allow first rendering
            // HERE WE CAN PLACE EVERY OTHER INTERSECTION EVENT STREAM HANDLER
            (...propsParts) => ({
                ...(propsParts.reduce((props = {}, part) => ({ ...props, ...part }), {})),
                onVisibilityChange
            })
        ).do(props => console.log(props && props.background));
    }),
    backgroundProp
);
