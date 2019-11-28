/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import isArray from 'lodash/isArray';
import { reproject } from '../CoordinatesUtils';

import { getCenter } from 'ol/extent';
import { Circle } from 'ol/geom';

const calculateRadius = (center, coordinates, mapCrs, coordinateCrs) => {
    if (isArray(coordinates) && isArray(coordinates[0]) && isArray(coordinates[0][0])) {
        const point = reproject(coordinates[0][0], coordinateCrs, mapCrs);
        return Math.sqrt(Math.pow(center[0] - point.x, 2) + Math.pow(center[1] - point.y, 2));
    }
    return 100;
};

/**
 * Transform a feature that is a circle with Polygon geometry in coordinateCrs to a feature with Circle geometry in mapCrs
 * @param {Feature} feature feature to transform
 * @param {string} mapCrs map's current crs
 * @param {string} [coordinateCrs=mapCrs] crs that feature's coordinates are in
 * @returns {Feature} the transformed feature
 */
export const transformPolygonToCircle = (feature, mapCrs, coordinateCrs = mapCrs) => {
    if (!feature.getGeometry() || feature.getGeometry().getType() !== "Polygon" || feature.getProperties().center && feature.getProperties().center.length === 0) {
        return feature;
    }
    if (feature.getProperties() && feature.getProperties().isCircle && feature.getProperties().center && feature.getProperties().center[0] && feature.getProperties().center[1]) {
        // center must be a valid point
        const extent = feature.getGeometry().getExtent();
        let center;
        if (feature.getProperties().center) {
            center = reproject(feature.getProperties().center, "EPSG:4326", mapCrs);
            center = [center.x, center.y];
        } else {
            center = getCenter(extent);
        }
        // check if projection equal to the one used when drawing the circle
        const radius = feature.getProperties().crs === mapCrs ? feature.getProperties().radius : calculateRadius(center, feature.getGeometry().getCoordinates(), mapCrs, coordinateCrs);
        feature.setGeometry(new Circle(center, radius));
        return feature;
    }
    return feature;
};
