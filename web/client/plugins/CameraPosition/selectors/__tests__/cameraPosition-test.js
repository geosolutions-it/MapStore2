/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    getShowCameraPosition,
    getCameraPositionCrs,
    getCameraPositionHeightType
} from '../cameraPosition';

describe('cameraPosition selectors', () => {
    it('getShowCameraPosition', () => {
        const state = {
            cameraPosition: {
                showCameraPosition: true,
                crs: 'EPSG:4326',
                heightType: 'Ellipsoidal'
            }
        };
        expect(getShowCameraPosition(state)).toBe(true);
    });

    it('getShowCameraPosition when false', () => {
        const state = {
            cameraPosition: {
                showCameraPosition: false,
                crs: 'EPSG:4326',
                heightType: 'Ellipsoidal'
            }
        };
        expect(getShowCameraPosition(state)).toBe(false);
    });

    it('getShowCameraPosition with undefined state', () => {
        const state = {};
        expect(getShowCameraPosition(state)).toBe(undefined);
    });

    it('getCameraPositionCrs', () => {
        const state = {
            cameraPosition: {
                showCameraPosition: true,
                crs: 'EPSG:4326',
                heightType: 'Ellipsoidal'
            }
        };
        expect(getCameraPositionCrs(state)).toBe('EPSG:4326');
    });

    it('getCameraPositionCrs with different CRS', () => {
        const state = {
            cameraPosition: {
                showCameraPosition: true,
                crs: 'EPSG:3857',
                heightType: 'Ellipsoidal'
            }
        };
        expect(getCameraPositionCrs(state)).toBe('EPSG:3857');
    });

    it('getCameraPositionCrs with undefined state', () => {
        const state = {};
        expect(getCameraPositionCrs(state)).toBe(undefined);
    });

    it('getCameraPositionHeightType', () => {
        const state = {
            cameraPosition: {
                showCameraPosition: true,
                crs: 'EPSG:4326',
                heightType: 'Ellipsoidal'
            }
        };
        expect(getCameraPositionHeightType(state)).toBe('Ellipsoidal');
    });

    it('getCameraPositionHeightType with MSL', () => {
        const state = {
            cameraPosition: {
                showCameraPosition: true,
                crs: 'EPSG:4326',
                heightType: 'MSL'
            }
        };
        expect(getCameraPositionHeightType(state)).toBe('MSL');
    });

    it('getCameraPositionHeightType with undefined state', () => {
        const state = {};
        expect(getCameraPositionHeightType(state)).toBe(undefined);
    });

    it('all selectors work with complete state', () => {
        const state = {
            cameraPosition: {
                showCameraPosition: true,
                crs: 'EPSG:3857',
                heightType: 'MSL'
            }
        };
        expect(getShowCameraPosition(state)).toBe(true);
        expect(getCameraPositionCrs(state)).toBe('EPSG:3857');
        expect(getCameraPositionHeightType(state)).toBe('MSL');
    });
});
