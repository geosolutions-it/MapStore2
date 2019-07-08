/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {Point, LineString, MultiPoint, MultiLineString, Polygon, MultiPolygon, Circle} from 'ol/geom';

export const createOLGeometry = ({ type, coordinates, radius, center } = {}) => {
    let geometry;
    switch (type) {
        case "Point": { geometry = new Point(coordinates ? coordinates : []); break; }
        case "LineString": { geometry = new LineString(coordinates ? coordinates : []); break; }
        case "MultiPoint": { geometry = new MultiPoint(coordinates ? coordinates : []); break; }
        case "MultiLineString": { geometry = new MultiLineString(coordinates ? coordinates : []); break; }
        case "MultiPolygon": { geometry = new MultiPolygon(coordinates ? coordinates : []); break; }
        // defaults is Polygon / Circle
        default: {
            geometry = radius && center ?
                Polygon.fromCircle(new Circle([center.x, center.y], radius), 100) : new Polygon(coordinates ? coordinates : []);
        }
    }
    return geometry;
};

export const isPolygon = (feature = {}) => {
    return feature && feature.geometry && feature.geometry.type === "Polygon";
};
