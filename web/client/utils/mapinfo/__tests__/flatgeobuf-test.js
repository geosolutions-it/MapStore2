/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from "expect";
import flatgeobuf from "../flatgeobuf";

describe("mapinfo flatgeobuf utils", () => {
    it("should create a GetFeature request", () => {
        const layerId = "3c442670-f77c-11f0-9e1f-dd66f6ae6da2";
        const layer = {
            "id": layerId,
            "format": "fgb",
            "style": {
                "format": "geostyler",
                "metadata": {
                    "editorType": "visual"
                },
                "body": {
                    "rules": [
                    ]
                }
            },
            "title": {
                "en-US": "countries"
            },
            "type": "flatgeobuf",
            "url": "https://flatgeobuf.org/test/data/countries.fgb",
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
        const point = {
            "pixel": {
                "x": 424, "y": 317.8473693926526
            },
            "latlng": {
                "lat": 40.19133465092119, "lng": -92.60925292968749
            },
            "rawPos": [
                -92.60925292968749, 40.19133465092119
            ],
            "modifiers": {
                "alt": false,
                "ctrl": false,
                "metaKey": false,
                "shift": false
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

        const request = flatgeobuf.buildRequest(layer, { point, currentLocale });
        expect(request).toEqual(
            {
                "request": {
                    "features": point.intersectedFeatures[0].features,
                    "outputFormat": "application/json"
                },
                "metadata": {
                    "title": "countries"
                },
                "url": "client"
            }
        );
    });
});
