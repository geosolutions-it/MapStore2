/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from "expect";
import cog from "../cog";

describe("mapinfo COG utils", () => {
    it("should create a getFeatureInfo request", () => {
        const layerId = "6ba42670-f3c-21f0-8e1f-dd66f6ae634d";
        const layer = {
            "id": layerId,
            "format": "cog",
            "title": {
                "en-US": "Cloud layer title"
            },
            "type": "cog",
            "url": "https://mydomain.com/cog.tif",
            "visibility": true,
            "singleTile": false,
            "dimensions": [],
            "hideLoading": false,
            "handleClickOnLayer": false,
            "useForElevation": false,
            "hidden": false,
            "expanded": false
        };
        const currentLocale = "en-US";
        const pixValueRaw = new Uint8Array([140, 80, 80, 255]);
        const pixValueBands = pixValueRaw.reduce((acc, value, index) => ({ ...acc, [index + 1]: value }), {});
        const latlng = {
            "lat": 40.19133465092119, "lng": -92.60925292968749
        };
        const point = {
            "pixel": {
                "x": 460, "y": 110
            },
            "latlng": latlng,
            "rawPos": [
                -92.60925292968749, 40.19133465092119
            ],
            "modifiers": {
                "alt": false,
                "ctrl": false,
                "metaKey": false,
                "shift": false
            },
            "intersectedPixels": {
                "0": {
                    "id": layerId,
                    "bands": pixValueBands
                }
            },
            "intersectedFeatures": [
                {
                    "id": layerId,
                    "features": [
                        {
                            "id": 165,
                            "properties": {
                                "id": "USA",
                                "name": "United States of America"
                            },
                            "type": "Feature",
                            "geometry": {
                                "type": "MultiPolygon",
                                "coordinates": [
                                    [
                                        [
                                            [-159.34512, 21.982],
                                            [-159.46372, 21.88299],
                                            [-159.80051, 22.06533],
                                            [-159.34512, 21.982]
                                        ]
                                    ]
                                ]
                            }
                        }
                    ]
                }
            ]
        };

        const request = cog.buildRequest(layer, { point, currentLocale });
        const expectedRequest = {
            "request": {
                "features": [
                    {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [latlng.lng, latlng.lat]
                        },
                        "properties": {
                            "bands": pixValueBands
                        }
                    }
                ],
                "outputFormat": "application/json"
            },
            "metadata": {
                "title": "Cloud layer title"
            },
            "url": "https://mydomain.com/cog.tif"
        };

        expect(request).toEqual(expectedRequest);
    });
});
