/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    flatGeobufExtractGeometryType,
    getFlatGeobufGeometryTypeFromOptions,
    getFlatGeobufCrsFromMetadata,
    getFlatGeobufCrsFromOptions
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
                sourceMetadata: { geometryType: 6 } // would resolve to MultiPolygon
            })).toBe('Point');
        });
        it('falls back to sourceMetadata header id', () => {
            expect(getFlatGeobufGeometryTypeFromOptions({
                sourceMetadata: { geometryType: 3 }
            })).toBe('Polygon');
        });
        it('returns undefined when header id is Unknown (0)', () => {
            expect(getFlatGeobufGeometryTypeFromOptions({
                sourceMetadata: { geometryType: 0 }
            })).toBe(undefined);
        });
        it('returns undefined when nothing is provided', () => {
            expect(getFlatGeobufGeometryTypeFromOptions({})).toBe(undefined);
            expect(getFlatGeobufGeometryTypeFromOptions(undefined)).toBe(undefined);
        });
    });
    describe('getFlatGeobufCrsFromMetadata', () => {
        it('returns the CRS string from metadata crs object', () => {
            expect(getFlatGeobufCrsFromMetadata({
                crs: { org: 'EPSG', code: 4326 }
            })).toBe('EPSG:4326');
        });
        it('handles non-4326 CRS', () => {
            expect(getFlatGeobufCrsFromMetadata({
                crs: { org: 'EPSG', code: 3857 }
            })).toBe('EPSG:3857');
        });
        it('falls back to EPSG:4326 when crs is absent', () => {
            expect(getFlatGeobufCrsFromMetadata({})).toBe('EPSG:4326');
            expect(getFlatGeobufCrsFromMetadata(null)).toBe('EPSG:4326');
            expect(getFlatGeobufCrsFromMetadata(undefined)).toBe('EPSG:4326');
        });
        it('normalizes EPSG:4269 (NAD83) to EPSG:4326', () => {
            expect(getFlatGeobufCrsFromMetadata({
                crs: { org: 'EPSG', code: 4269 }
            })).toBe('EPSG:4326');
        });
        it('normalizes EPSG:4258 (ETRS89) to EPSG:4326', () => {
            expect(getFlatGeobufCrsFromMetadata({
                crs: { org: 'EPSG', code: 4258 }
            })).toBe('EPSG:4326');
        });
        it('normalizes EPSG:4283 (GDA94) to EPSG:4326', () => {
            expect(getFlatGeobufCrsFromMetadata({
                crs: { org: 'EPSG', code: 4283 }
            })).toBe('EPSG:4326');
        });
        it('normalizes CRS:84 to EPSG:4326', () => {
            expect(getFlatGeobufCrsFromMetadata({
                crs: { org: 'CRS', code: 84 }
            })).toBe('EPSG:4326');
        });
        it('does not normalize non-equivalent CRS like EPSG:32632', () => {
            expect(getFlatGeobufCrsFromMetadata({
                crs: { org: 'EPSG', code: 32632 }
            })).toBe('EPSG:32632');
        });
    });
    describe('getFlatGeobufCrsFromOptions', () => {
        it('reads CRS from options.sourceMetadata', () => {
            expect(getFlatGeobufCrsFromOptions({
                sourceMetadata: { crs: { org: 'EPSG', code: 32632 } }
            })).toBe('EPSG:32632');
        });
        it('falls back to EPSG:4326 when sourceMetadata is absent', () => {
            expect(getFlatGeobufCrsFromOptions({})).toBe('EPSG:4326');
            expect(getFlatGeobufCrsFromOptions(undefined)).toBe('EPSG:4326');
        });
    });
});
