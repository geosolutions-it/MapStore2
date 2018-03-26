/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { withStateHandlers, withProps, compose} = require("recompose");
const withResizeSpy = require('../../misc/enhancers/withResizeSpy');

/**
 * Makes the map adaptive to the container and allow auto-resize on dimension's change.
 * @param {number} debounceTime debounce time on resize event
 */
module.exports = (debounceTime = 0) => compose(
    withStateHandlers(
        () => ({
            resize: 0
        }),
        {
            onResize: ({resize = 0}) => () => ({
                resize: resize + 1
            })
        }
    ),
    withResizeSpy({
        debounceTime
    }),
    withProps(
        ({options, resize}) => ({
            options: {
                ...options,
                resize
            }
        })
    )
);
