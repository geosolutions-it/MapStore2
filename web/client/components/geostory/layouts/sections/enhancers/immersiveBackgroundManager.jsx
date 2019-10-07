/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, createEventHandler, withProps, mapPropsStream, withHandlers, setObservableConfig } from 'recompose';
import { findIndex, get, maxBy } from "lodash";
import { Observable } from "rxjs";

// TODO: externalize
import rxjsConfig from 'recompose/rxjsObservableConfig';
setObservableConfig(rxjsConfig);

const getContentInView = (contents, id) => {
    const index = findIndex(contents, { id });
    return contents[index === -1 || !index ? 0 : index];
};

/**
 * Transforms the intersection events stream into backgroundId property stream.
 * @param {stream} intersection$ the stream of intersection event calls
 */
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
        // optimization to avoid not useful events
        .distinctUntilChanged()
        // create the property from the Id stream
        .map(backgroundId => ({
            backgroundId
        }));

/**
 * enhancer that uses the `backgroundId` property to select the background object
 * from `contents` property
 */
export const backgroundProp = withProps(
    ({ id, backgroundId, contents = [] }) => {
        const contentInView = getContentInView(contents, backgroundId) || {};
        const contentId = contentInView && contentInView.id;
        return {
            background: get(contentInView, 'background') || { type: 'none' },
            contentId,
            sectionId: id,
            path: `sections[{"id": "${id}"}].contents[{"id": "${contentId}"}].background`,
            sectionPath: `sections[{"id": "${id}"}]`
        };
    });
/**
 * Holds the current background as background property
 * by intercepting onVisibilityChange from components.
 */

export const updateBackgroundEnhancer = withHandlers({
    updateBackground: ({ sectionId, contentId, update = () => { } }) => (path, ...args) => update(`sections[{"id": "${sectionId}"}].contents[{"id": "${contentId}"}].background.` + path, ...args)
});

export const backgroundPropWithHandler = compose(
    backgroundProp,
    updateBackgroundEnhancer
);

export default compose(
    mapPropsStream(props$ => {
        // create an handler for intersection events
        const { handler: onVisibilityChange, stream: intersection$ } = createEventHandler();
        return Observable.combineLatest(
            props$, // rendering properties stream
            createBackgroundIdStream(intersection$, props$) // generates backgroundId property stream
                .startWith({}), // emit first event from all the streams to allow first rendering
            // HERE WE CAN PLACE EVERY OTHER INTERSECTION EVENT STREAM HANDLER
            (...propsParts) => ({
                ...(propsParts.reduce((props = {}, part) => ({ ...props, ...part }), {})),
                onVisibilityChange
            })
        );
    }),
    backgroundPropWithHandler
);
