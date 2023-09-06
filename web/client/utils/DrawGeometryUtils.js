/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { reproject, getUnits } from './CoordinatesUtils';
import { METERS_PER_UNIT } from './MapUtils';

const DEFAULT_RADIUS = 6371008.8;

function sphereOffset(c1, distance, bearing, radius = DEFAULT_RADIUS) {
    const lat1 = (c1[1] * Math.PI) / 180;
    const lon1 = (c1[0] * Math.PI) / 180;
    const dByR = distance / radius;
    const lat = Math.asin(
        Math.sin(lat1) * Math.cos(dByR) +
        Math.cos(lat1) * Math.sin(dByR) * Math.cos(bearing)
    );
    const lon = lon1 +
        Math.atan2(
            Math.sin(bearing) * Math.sin(dByR) * Math.cos(lat1),
            Math.cos(dByR) - Math.sin(lat1) * Math.sin(lat)
        );
    return [(lon * 180) / Math.PI, (lat * 180) / Math.PI];
}

function circular(center, radius, { sides = 128, sphereRadius } = {}) {
    const flatCoordinates = [];
    for (let i = 0; i < sides; ++i) {
        flatCoordinates.push(sphereOffset(center, radius, (2 * Math.PI * i) / sides, sphereRadius));
    }
    flatCoordinates.push(flatCoordinates[0]);
    return flatCoordinates;
}

function modulo(a, b) {
    const r = a % b;
    return r * b < 0 ? r + b : r;
}

function circle(_center, _radius, { sides = 128, projection = 'EPSG:3857' } = {}) {
    const projectedCenter = reproject(_center, 'EPSG:4326', projection);
    const center = [projectedCenter.x, projectedCenter.y];
    const units = getUnits(projection);
    const radius = _radius / METERS_PER_UNIT[units];
    const stride = 2;
    const arrayLength = stride * (sides + 1);
    const flatCoordinates = new Array(arrayLength);
    for (let i = 0; i < arrayLength; i += stride) {
        flatCoordinates[i] = 0;
        flatCoordinates[i + 1] = 0;
        for (let j = 2; j < stride; j++) {
            flatCoordinates[i + j] = center[j];
        }
    }
    const startAngle = 0;
    for (let i = 0; i <= sides; ++i) {
        const offset = i * stride;
        const angle = startAngle + (modulo(i, sides) * 2 * Math.PI) / sides;
        flatCoordinates[offset] = center[0] + radius * Math.cos(angle);
        flatCoordinates[offset + 1] = center[1] + radius * Math.sin(angle);
    }
    let arr = [];
    for (let i = 0; i < flatCoordinates.length - 1; i++) {
        if ((i % 2) === 0) {
            const point = reproject([
                flatCoordinates[i],
                flatCoordinates[i + 1]
            ], projection, 'EPSG:4326');
            arr.push([point.x, point.y]);
        }
    }
    return arr;
}

export function circleToPolygon(center, radius, geodesic, options) {
    const func = geodesic ? circular : circle;
    return {
        type: 'Polygon',
        coordinates: [func(center, radius, options)]
    };
}
