/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useRef } from 'react';
import OpenLayersDrawGeometryInteraction from '../../../utils/openlayers/DrawGeometryInteraction';

/**
 * Support for 2D drawing, this component provides only the interactions and callback for a drawing workflow
 * @name DrawGeometrySupport
 * @prop {object} map instance of the current map library in use
 * @prop {boolean} active activate the drawing functionalities
 * @prop {string} geometryType type of geometry to draw: `Circle`, `Point`, `LineString` or `Polygon`
 * @prop {string} geodesic if true the coordinates will visualized as geodetic
 * @prop {function} onDrawStart callback triggered at drawing start
 * @prop {function} onDrawing callback triggered at every `click`/`pointerdown` events
 * @prop {function} onDrawEnd callback triggered at drawing end with double click event or single click if `coordinatesLength` is defined
 * @prop {number} coordinatesLength number of coordinates expected by a `LineString` or `Polygon` geometry, `onDrawEnd` will be called after the last coordinates added with single click interaction
 * @prop {object} style override the default style of drawing mode (see `web/client/utils/DrawUtils.js`)
 */
function DrawGeometrySupport({
    map,
    active,
    geometryType = 'LineString',
    geodesic = false,
    onDrawStart = () => { },
    onDrawing = () => { },
    onDrawEnd = () => { },
    onInit = () => { },
    onDestroy = () => { },
    coordinatesLength,
    style
}) {

    const draw = useRef();
    useEffect(() => {
        if (map && active) {
            onInit();
            draw.current = new OpenLayersDrawGeometryInteraction({
                map,
                type: geometryType,
                coordinatesLength,
                style,
                geodesic,
                onDrawStart,
                onDrawing,
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
    }, [map, active, geometryType, coordinatesLength, geodesic]);
    return null;
}

export default DrawGeometrySupport;
