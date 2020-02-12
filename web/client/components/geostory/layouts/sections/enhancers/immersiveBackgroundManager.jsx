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
const createBackgroundIdStream = (intersection$, props$) => {
    const visibility$ = intersection$
        // create a map with the latest states of each intersection event
        .scan((items = {}, { id, visible, entry }) => ({
            ...items,
            [id]: {
                visible,
                entry
            }
        }), {})
        .debounceTime(100) // Better to debounce before calculations
        .map((items = {}) => {
            // get the one with max intersectionRatio that should be the selected background ID
            const maxItem = maxBy(
                Object.keys(items),
                (k) => items[k].visible ? get(items[k], 'entry.intersectionRatio') : -Infinity
            );
            return {maxItem, items};
        });

    return Observable.merge(
        visibility$
            .pluck('maxItem')
            // optimization to avoid not useful events
            .distinctUntilChanged()
            // create the property from the Id stream
            .map(backgroundId => ({
                backgroundId
            })),
        visibility$
            .map(({maxItem, items}) => {
                if (get(items[maxItem], 'entry.intersectionRatio') === 0) {
                    return "EMPTY";
                }
                return maxItem;
            })
            // optimization to avoid not useful events
            .withLatestFrom(props$.pluck('updateCurrentPage'))
            .do(([columnId, updateCurrentPage]) => updateCurrentPage && updateCurrentPage({columnId}))
            .ignoreElements()
    );
};

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
            path: `sections[{"id": "${id}"}].contents[{"id": "${contentId}"}].background`
        };
    });
/**
 * Holds the current background as background property
 * by intercepting onVisibilityChange from components.
 */

export const updateBackgroundEnhancer = withHandlers({
    updateBackground: ({ sectionId, contentId, update = () => { } }) => (path, ...args) => update(`sections[{"id": "${sectionId}"}].contents[{"id": "${contentId}"}].background.` + path, ...args),
    updateSection: ({ sectionId, update = () => { } }) => (...args) => update(`sections[{"id": "${sectionId}"}]`, ...args)
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
