/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { flatGeobufExtractGeometryType } from '../FlatGeobufLayerUtils';
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
});
