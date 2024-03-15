/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useRef, useEffect } from 'react';
import CesiumDrawGeometryInteraction from '../../../utils/cesium/DrawGeometryInteraction';

/**
 * Support for 3D drawing, this component provides only the interactions and callback for a drawing workflow
 * @name DrawGeometrySupport
 * @prop {object} map instance of the current map library in use
 * @prop {boolean} active activate the drawing functionalities
 * @prop {string} geometryType type of geometry to draw. can be: `Point`, `LineString` or `Polygon`
 * @prop {boolean} geodesic if true the coordinates will be forced to the ellipsoid at 0 height
 * @prop {function} onDrawStart callback triggered at drawing start
 * @prop {function} onDrawing callback triggered at every `click`/`pointerdown` events
 * @prop {function} onMouseMove callback triggered at every mouse move events
 * @prop {function} onDrawEnd callback triggered at drawing end with double click event or single click if coordinatesLength is defined
 * @prop {function} getObjectsToExcludeOnPick function that return all the primitive collection to be excluded while picking the coordinates, it is useful to exclude the current drawn geometries
 * @prop {boolean} depthTestAgainstTerrain force depth against terrain while picking the coordinates
 * @prop {boolean} sampleTerrain enable sample terrain functionality only for Point geometry type
 * @prop {number} coordinatesLength number of coordinates expected by a `LineString` or `Polygon` geometry, `onDrawEnd` will be called after the last coordinates added with single click interaction
 * @prop {function} getPositionInfo override the default getPositionInfo function, mainly used for testing
 * @prop {object} style override the default style of drawing mode (see `web/client/utils/DrawUtils.js`)
 */
function DrawGeometrySupport({
    map,
    active,
    geometryType = 'LineString',
    geodesic = false,
    onDrawStart = () => { },
    onDrawing = () => { },
    onMouseMove = () => { },
    onDrawEnd = () => { },
    onInit = () => { },
    onDestroy = () => { },
    getObjectsToExcludeOnPick,
    depthTestAgainstTerrain,
    sampleTerrain,
    coordinatesLength,
    getPositionInfo,
    style
}) {
    const draw = useRef();
    useEffect(() => {
        if (map?.canvas && active) {
            onInit();
            draw.current = new CesiumDrawGeometryInteraction({
                map,
                type: geometryType,
                coordinatesLength,
                getPositionInfo,
                getObjectsToExcludeOnPick,
                depthTestAgainstTerrain,
                style,
                geodesic,
                sampleTerrain,
                onDrawStart,
                onDrawing,
                onMouseMove,
                onDrawEnd
            });
        }
        return () => {
            if (draw.current) {
                onDestroy({
                    coordinates: [...draw.current.getCoordinates()]
                });
                draw.current.remove();
                draw.current = null;
            }
        };
    }, [map, active, geometryType, sampleTerrain, coordinatesLength, geodesic]);

    return null;
}

export default DrawGeometrySupport;
