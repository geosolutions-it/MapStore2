/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import cameraPosition from '../cameraPosition';

import {
    changeCameraPositionCrs,
    changeCameraPositionHeightType,
    showCameraPosition,
    hideCameraPosition
} from '../../actions/cameraPosition';

describe('cameraPosition reducer', () => {
    it('initial state', () => {
        const state = cameraPosition(undefined, {});
        expect(state).toEqual({
            showCameraPosition: false,
            crs: 'EPSG:4326',
            heightType: 'Ellipsoidal'
        });
    });

    it('show camera position', () => {
        const state = cameraPosition({}, showCameraPosition());
        expect(state.showCameraPosition).toBe(true);
    });

    it('hide camera position', () => {
        const state = cameraPosition({ showCameraPosition: true }, hideCameraPosition());
        expect(state.showCameraPosition).toBe(false);
    });

    it('change camera position CRS', () => {
        const initialState = {
            showCameraPosition: false,
            crs: 'EPSG:4326',
            heightType: 'Ellipsoidal'
        };
        const state = cameraPosition(initialState, changeCameraPositionCrs('EPSG:3857'));
        expect(state.crs).toBe('EPSG:3857');
        expect(state.showCameraPosition).toBe(false);
        expect(state.heightType).toBe('Ellipsoidal');
    });

    it('change camera position CRS with different values', () => {
        const initialState = {
            showCameraPosition: true,
            crs: 'EPSG:4326',
            heightType: 'MSL'
        };
        const testCRS = ['EPSG:3857', 'EPSG:3003', 'EPSG:32633'];
        testCRS.forEach(crs => {
            const state = cameraPosition(initialState, changeCameraPositionCrs(crs));
            expect(state.crs).toBe(crs);
            expect(state.showCameraPosition).toBe(true);
            expect(state.heightType).toBe('MSL');
        });
    });

    it('change camera position height type', () => {
        const initialState = {
            showCameraPosition: false,
            crs: 'EPSG:4326',
            heightType: 'Ellipsoidal'
        };
        const state = cameraPosition(initialState, changeCameraPositionHeightType('MSL'));
        expect(state.heightType).toBe('MSL');
        expect(state.crs).toBe('EPSG:4326');
        expect(state.showCameraPosition).toBe(false);
    });

    it('change camera position height type with different values', () => {
        const initialState = {
            showCameraPosition: true,
            crs: 'EPSG:3857',
            heightType: 'Ellipsoidal'
        };
        const heightTypes = ['Ellipsoidal', 'MSL'];
        heightTypes.forEach(heightType => {
            const state = cameraPosition(initialState, changeCameraPositionHeightType(heightType));
            expect(state.heightType).toBe(heightType);
            expect(state.crs).toBe('EPSG:3857');
            expect(state.showCameraPosition).toBe(true);
        });
    });

    it('multiple actions in sequence', () => {
        let state = cameraPosition(undefined, {});
        expect(state.showCameraPosition).toBe(false);
        expect(state.crs).toBe('EPSG:4326');
        expect(state.heightType).toBe('Ellipsoidal');

        state = cameraPosition(state, showCameraPosition());
        expect(state.showCameraPosition).toBe(true);

        state = cameraPosition(state, changeCameraPositionCrs('EPSG:3857'));
        expect(state.crs).toBe('EPSG:3857');
        expect(state.showCameraPosition).toBe(true);

        state = cameraPosition(state, changeCameraPositionHeightType('MSL'));
        expect(state.heightType).toBe('MSL');
        expect(state.crs).toBe('EPSG:3857');
        expect(state.showCameraPosition).toBe(true);

        state = cameraPosition(state, hideCameraPosition());
        expect(state.showCameraPosition).toBe(false);
        expect(state.crs).toBe('EPSG:3857');
        expect(state.heightType).toBe('MSL');
    });
});
