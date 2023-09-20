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
/**
 * Default geometry type extractor
 * @param {object} feature GeoJSON feature
 * @returns string supported: `Point`, `LineString`, `Polygon` or `Circle`
 */
const getModifyGeometryType = (feature) => feature?.geometry?.type;
/**
 * Return a function to apply the correct geometryType to the modify properties
 * @param {function} options.getGeometryType should return a string representing the editing geometry given a GeoJSON feature as argument (see `getModifyGeometryType`)
 * @returns function
 */
export const featureToModifyProperties = ({ getGeometryType = getModifyGeometryType } = {}) =>
    (feature) => ({ ...feature?.properties, geometryType: getGeometryType(feature) });
/**
 * Applies modified value to a GeoJSON feature properties object
 * @param {object} modifyProperties modified properties
 * @param {number} modifyProperties.radius radius of the circle in meters when geometry type is `Circle`
 * @param {object} feature the original GeoJSON feature
 * @returns object with changed properties
 */
export const modifyPropertiesToFeatureProperties = (modifyProperties, feature) => ({
    ...feature?.properties,
    ...(modifyProperties?.radius !== undefined && { radius: modifyProperties.radius })
});
