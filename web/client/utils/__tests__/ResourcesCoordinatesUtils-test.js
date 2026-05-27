/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    getFeatureFromExtent,
    boundsToExtentString,
    getAdjustedExtent
} from '../ResourcesCoordinatesUtils';
import expect from 'expect';

describe('ResourcesCoordinatesUtils', () => {
    it('getFeatureFromExtent', () => {
        expect(getFeatureFromExtent('-180,-90,180,90')).toEqual({
            type: 'Feature',
            geometry: {
                type: 'MultiPolygon',
                coordinates: [[[[-180, -90], [-180, 90], [180, 90], [180, -90], [-180, -90]]]]
            },
            properties: {}
        });
        expect(getFeatureFromExtent('-180,-90,0,90,0,-90,180,90')).toEqual({
            type: 'Feature',
            geometry: {
                type: 'MultiPolygon',
                coordinates: [
                    [[[-180, -90], [-180, 90], [0, 90], [0, -90], [-180, -90]]],
                    [[[0, -90], [0, 90], [180, 90], [180, -90], [0, -90]]]]
            },
            properties: {}
        });
    });
    it('boundsToExtentString', () => {
        expect(boundsToExtentString({ minx: -180, miny: -90, maxx: 180, maxy: 90 }, 'EPSG:4326')).toBe('-180.0000,-90.0000,180.0000,90.0000');
    });
    it('getAdjustedExtent', () => {
        expect(getAdjustedExtent([-180, -90, 180, 90], 'EPSG:4326')).toEqual([ -180, -89.999999, 180, 89.999999 ]);
    });
});
