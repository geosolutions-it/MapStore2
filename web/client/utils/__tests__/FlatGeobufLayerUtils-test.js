/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    flatGeobufExtractGeometryType,
    getFlatGeobufGeometryTypeFromOptions
} from '../FlatGeobufLayerUtils';
import expect from 'expect';

describe("FlatGeobufLayerUtils", () => {
    it('extractGeometryAttributeName from Flatgeobuf layer', () => {
        const layerMetadata = {
            "geometryType": 6,
            "columns": [
                {
                    "name": "the_geom",
                    "type": 7,
                    "title": null,
                    "description": null,
                    "width": -1,
                    "precision": -1,
                    "scale": -1,
                    "nullable": true,
                    "unique": false,
                    "primary_key": false
                }
            ]
        };
        expect(flatGeobufExtractGeometryType(layerMetadata)).toBe("MultiPolygon");
    });
    describe('getFlatGeobufGeometryTypeFromOptions', () => {
        it('prefers explicit options.geometryType', () => {
            expect(getFlatGeobufGeometryTypeFromOptions({
                geometryType: 'Point',
                metadata: { geometryType: 6 } // would resolve to MultiPolygon
            })).toBe('Point');
        });
        it('falls back to metadata header id', () => {
            expect(getFlatGeobufGeometryTypeFromOptions({
                metadata: { geometryType: 3 }
            })).toBe('Polygon');
        });
        it('returns undefined when header id is Unknown (0)', () => {
            expect(getFlatGeobufGeometryTypeFromOptions({
                metadata: { geometryType: 0 }
            })).toBe(undefined);
        });
        it('returns undefined when nothing is provided', () => {
            expect(getFlatGeobufGeometryTypeFromOptions({})).toBe(undefined);
            expect(getFlatGeobufGeometryTypeFromOptions(undefined)).toBe(undefined);
        });
    });
});
