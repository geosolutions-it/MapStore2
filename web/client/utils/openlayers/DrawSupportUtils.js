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

const calculateRadius = (center, coordinates) => {
    return isArray(coordinates) && isArray(coordinates[0]) && isArray(coordinates[0][0]) ? Math.sqrt(Math.pow(center[0] - coordinates[0][0][0], 2) + Math.pow(center[1] - coordinates[0][0][1], 2)) : 100;
};

export const transformPolygonToCircle = (feature, mapCrs) => {

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
        const radius = feature.getProperties().radius || calculateRadius(center, feature.getGeometry().getCoordinates());
        feature.setGeometry(new Circle(center, radius));
        return feature;
    }
    return feature;
};
