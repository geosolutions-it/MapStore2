/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * This utility function return a valid style for the drawing and modify style used by the map supports
 * @param {object} style optional style overrides
 * @returns the style object
 */
export function generateEditingStyle(style) {
    return {
        wireframe: {
            color: '#000000',
            opacity: 1.0,
            depthFailColor: '#000000',
            depthFailOpacity: 0.4,
            width: 0.5
        },
        lineDrawing: {
            color: '#000000',
            opacity: 1.0,
            depthFailColor: '#000000',
            depthFailOpacity: 0.4,
            width: 3,
            dashLength: 8.0
        },
        line: {
            color: '#ffcc33',
            opacity: 1.0,
            depthFailColor: '#ffcc33',
            depthFailOpacity: 0.4,
            width: 2
        },
        areaDrawing: {
            color: '#ffffff',
            opacity: 0.5,
            depthFailColor: '#ffffff',
            depthFailOpacity: 0.25
        },
        area: {
            color: '#ffffff',
            opacity: 0.5,
            depthFailColor: '#ffffff',
            depthFailOpacity: 0.25
        },
        cursor: {
            color: '#ff0000',
            width: 2,
            radius: 4
        },
        coordinatesNode: {
            color: '#333333',
            width: 2,
            radius: 5
        },
        ...style
    };
}
