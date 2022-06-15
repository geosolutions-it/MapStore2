/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get } from 'lodash';

import {INFO_FORMATS} from './FeatureInfoUtils';
import {calculateCircleCoordinates, calculateCircleRadiusFromPixel, reproject} from "./CoordinatesUtils";
import {GET_COORDINATES_FROM_PIXEL_HOOK, GET_PIXEL_FROM_COORDINATES_HOOK, getHook} from "./MapUtils";

export const getFormatForResponse = (res, props) => {
    const {format, queryParams = {}} = res;
    // handle WMS/WMTS.., and also WFS
    return queryParams.info_format
        || queryParams.outputFormat
        || format && INFO_FORMATS[format]
        || props.format;
};

export const responseValidForEdit = (res) => !!get(res, 'layer.search.url');


/**
 * Recalculates pixel and geometric filter to allow also GFI emulation for WFS.
 * This information is used also to switch to edit mode (feature grid) from GFI applying the same filter
 * @param {object} point the point clicked, emitted by featureInfoClick action
 * @param {string} projection map projection
 */
export const updatePointWithGeometricFilter = (point, projection) => {
    // calculate a query for edit
    const lng = get(point, 'latlng.lng');
    const lat = get(point, 'latlng.lat');
    // update pixel if changed
    const pos = reproject([lng, lat], 'EPSG:4326', projection);
    const getPixel = getHook(GET_PIXEL_FROM_COORDINATES_HOOK);
    let pixel;
    if (getPixel) {
        const [x, y] = getPixel([pos.x, pos.y]);
        pixel = { x, y };
    } else {
        pixel = point.pixel;
    }
    const hook = getHook(GET_COORDINATES_FROM_PIXEL_HOOK);
    const PIXEL_RADIUS = 5;
    const radius = hook ? calculateCircleRadiusFromPixel(
        hook,
        pixel,
        pos,
        PIXEL_RADIUS
    ) : point.resolution * PIXEL_RADIUS;
    // emulation of feature info filter to query WFS services (edit and/or WFS layer)
    const geometricFilter = {
        type: 'geometry',
        enabled: true,
        value: {
            geometry: {
                center: [pos.x, pos.y],
                coordinates: calculateCircleCoordinates(pos, radius, 12),
                extent: [pos.x - radius, pos.y - radius, pos.x + radius, pos.y + radius],
                projection,
                radius,
                type: "Polygon"
            },
            method: "Circle",
            operation: "INTERSECTS"
        }
    };
    return {
        ...point,
        pixel,
        geometricFilter
    };
};
