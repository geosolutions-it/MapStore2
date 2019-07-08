/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { isVectorFormat } from '../VectorTileUtils';

describe('VectorTileUtils', () => {
    it('test isVectorFormat with vector formats', () => {
        const MVT = 'application/vnd.mapbox-vector-tile';
        expect(isVectorFormat(MVT)).toBe(true);

        const GeoJSON = 'application/json;type=geojson';
        expect(isVectorFormat(GeoJSON)).toBe(true);

        const TopoJSON = 'application/json;type=topojson';
        expect(isVectorFormat(TopoJSON)).toBe(true);
    });
    it('test isVectorFormat with image formats', () => {
        const PNG = 'image/png';
        expect(isVectorFormat(PNG)).toBe(false);

        const PNG8 = 'image/png8';
        expect(isVectorFormat(PNG8)).toBe(false);

        const JPEG = 'image/jpeg';
        expect(isVectorFormat(JPEG)).toBe(false);

        const GIF = 'image/gif';
        expect(isVectorFormat(GIF)).toBe(false);
    });
});
