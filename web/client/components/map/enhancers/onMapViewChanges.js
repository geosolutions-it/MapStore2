/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, withHandlers, withPropsOnChange } from 'recompose';

/**
 * Enhance map to add the `onMapViewChanges` handler passed as prop to the list of event handlers.
 * The handler is called with only one parameter (the map) that is the result of the merge of
 * original callback (where center, zoom, bbox, size, mapStateSource and projection are separated) with the current `map` prop
 */
export default compose(
    withHandlers({
        onMapViewChanges: ({ map = {}, onMapViewChanges = () => {}}) => (center, zoom, bbox, size, mapStateSource, projection, viewerOptions, resolution) => {
            onMapViewChanges({
                ...map,
                center,
                bbox: {
                    ...map.bbox,
                    ...bbox
                },
                zoom,
                size,
                mapStateSource,
                projection,
                resolution
            });
        }
    }),
    withPropsOnChange(
        ['onMapViewChanges', 'eventHandlers'],
        ({ onMapViewChanges = () => {}, eventHandlers = {} } = {}) => ({
            eventHandlers: {
                ...eventHandlers,
                onMapViewChanges
            }
        })
    )
);
