/**
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in this source tree.
 */

import expect from 'expect';
import { getZoomedFov } from '../PanoramaViewer';

const CesiumMock = {
    Math: {
        clamp: (value, min, max) => Math.max(min, Math.min(max, value))
    }
};

describe('PanoramaViewer', () => {
    it('zooms in when the wheel delta is positive', () => {
        const fov = Math.PI / 2;
        expect(getZoomedFov(fov, 1, CesiumMock)).toBe(fov * 0.9);
    });

    it('zooms out when the wheel delta is negative', () => {
        const fov = Math.PI / 2;
        expect(getZoomedFov(fov, -1, CesiumMock)).toBe(fov * 1.1);
    });

    it('keeps the field of view within the supported bounds', () => {
        expect(getZoomedFov(0.1, 1, CesiumMock)).toBe(Math.PI / 6);
        expect(getZoomedFov(Math.PI * 1.8, -1, CesiumMock)).toBe(Math.PI * 100 / 180);
    });
});
