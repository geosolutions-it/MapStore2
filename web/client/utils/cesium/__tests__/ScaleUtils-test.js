/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import * as Cesium from 'cesium';
import { isCameraPerpendicularToSurface, getMapScaleForCesium } from '../ScaleUtils';

describe('test calc scale utils for cesium', () => {
    it('isCameraPerpendicularToSurface - nadir (straight down) returns true', () => {
        const ellipsoid = Cesium.Ellipsoid.WGS84;
        const position = Cesium.Cartesian3.fromDegrees(0, 0);
        const surfaceNormal = ellipsoid.geodeticSurfaceNormal(position);

        // Camera direction opposite to surface normal = looking straight down
        const camera = {
            direction: Cesium.Cartesian3.negate(surfaceNormal, new Cesium.Cartesian3())
        };

        const result = isCameraPerpendicularToSurface(camera, position, ellipsoid, 0.95);
        expect(result).toBe(true);
    });

    it('isCameraPerpendicularToSurface - oblique angle returns false', () => {
        const ellipsoid = Cesium.Ellipsoid.WGS84;
        const position = Cesium.Cartesian3.fromDegrees(0, 0);

        // Tilted camera direction (~45° from nadir, dot ≈ -0.7)
        const camera = {
            direction: new Cesium.Cartesian3(0, -0.7, -0.7)
        };

        const result = isCameraPerpendicularToSurface(camera, position, ellipsoid, 0.95);
        expect(result).toBe(false);
    });

    it('isCameraPerpendicularToSurface - horizontal view returns false', () => {
        const ellipsoid = Cesium.Ellipsoid.WGS84;
        const position = Cesium.Cartesian3.fromDegrees(0, 0);

        // Camera looking horizontally (dot = 0)
        const camera = {
            direction: new Cesium.Cartesian3(1, 0, 0)
        };

        const result = isCameraPerpendicularToSurface(camera, position, ellipsoid, 0.95);
        expect(result).toBe(false);
    });

    it('getMapScaleForCesium - returns number when camera looks at sky', () => {
    // Minimal stub: globe.pick returns undefined = looking at sky
        const mockViewer = {
            scene: {
                canvas: { clientWidth: 800, clientHeight: 600 },
                camera: {
                    direction: new Cesium.Cartesian3(0, 0, 1),
                    positionCartographic: { height: 10000 },
                    getPickRay: () => ({})
                },
                globe: {
                    ellipsoid: Cesium.Ellipsoid.WGS84,
                    pick: () => undefined
                }
            }
        };

        const result = getMapScaleForCesium(mockViewer);

        expect(typeof result).toBe('number');
        expect(Number.isInteger(result)).toBe(true);
        expect(result).toBeGreaterThan(0);
    });

    it('getMapScaleForCesium - returns number with valid positions + perpendicular camera', () => {
    // Minimal stub: valid positions + perpendicular camera → triggers fallback by design
        const mockPos = Cesium.Cartesian3.fromDegrees(0, 0, 0);
        const mockViewer = {
            scene: {
                canvas: { clientWidth: 800, clientHeight: 600 },
                camera: {
                    direction: new Cesium.Cartesian3(0, 0, -1), // straight down
                    positionCartographic: { height: 5000 },
                    getPickRay: () => ({})
                },
                globe: {
                    ellipsoid: Cesium.Ellipsoid.WGS84,
                    pick: () => mockPos,
                    cartesianToCartographic: () => ({
                        longitude: 0,
                        latitude: 0,
                        height: 0
                    })
                }
            }
        };

        const result = getMapScaleForCesium(mockViewer);

        expect(typeof result).toBe('number');
        expect(Number.isInteger(result)).toBe(true);
    });

    it('getMapScaleForCesium - returns number with valid positions + oblique camera', () => {
    // Minimal stub: valid positions + oblique camera → uses EllipsoidGeodesic path
        const mockPos = Cesium.Cartesian3.fromDegrees(0, 0, 0);
        const mockViewer = {
            scene: {
                canvas: { clientWidth: 800, clientHeight: 600 },
                camera: {
                    direction: new Cesium.Cartesian3(0, -0.5, -0.8), // tilted
                    positionCartographic: { height: 5000 },
                    getPickRay: () => ({})
                },
                globe: {
                    ellipsoid: Cesium.Ellipsoid.WGS84,
                    pick: () => mockPos,
                    cartesianToCartographic: () => ({
                        longitude: 0,
                        latitude: 0,
                        height: 0
                    })
                }
            }
        };

        const result = getMapScaleForCesium(mockViewer);

        expect(typeof result).toBe('number');
        expect(Number.isInteger(result)).toBe(true);
    });
});
