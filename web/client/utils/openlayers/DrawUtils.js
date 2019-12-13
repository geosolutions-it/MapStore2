/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { DragPan, PinchRotate, DragRotate, KeyboardPan, MouseWheelZoom, PinchZoom, DoubleClickZoom, DragZoom, KeyboardZoom } from 'ol/interaction';
import {Point, LineString, MultiPoint, MultiLineString, Polygon, MultiPolygon, Circle} from 'ol/geom';
import {fromCircle} from 'ol/geom/Polygon';

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
            fromCircle(new Circle([center.x, center.y], radius), 100) : new Polygon(coordinates ? coordinates : []);
    }
    }
    return geometry;
};

export const isPolygon = (feature = {}) => {
    return feature && feature.geometry && feature.geometry.type === "Polygon";
};

export const DEFAULT_INTERACTION_OPTIONS = {
    "dragPan": {
        options: { kinetic: false },
        Instance: DragPan
    },
    "keyboardPan": {
        options: { kinetic: false },
        Instance: KeyboardPan
    },
    "mouseWheelZoom": {
        options: { duration: 0 },
        Instance: MouseWheelZoom
    },
    "doubleClickZoom": {
        options: { duration: 0 },
        Instance: DoubleClickZoom
    },
    "shiftDragZoom": {
        options: { duration: 0 },
        Instance: DragZoom
    },
    "keyboardZoom": {
        options: {  },
        Instance: KeyboardZoom
    },
    "pinchZoom": {
        options: { duration: 0 },
        Instance: PinchZoom
    },
    "pinchRotate": {
        options: { },
        Instance: PinchRotate
    },
    "altShiftDragRotate": {
        options: { },
        Instance: DragRotate
    }
};
