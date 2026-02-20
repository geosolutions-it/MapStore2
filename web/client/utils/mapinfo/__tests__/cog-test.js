/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from "expect";
import {addLayerInstance} from '../../cog/LayerUtils';
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
        const point = {
            "pixel": {
                "x": 460, "y": 110
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
        const pixValue = new Uint8Array([140, 80, 80, 255]);
        const pseudoLayerOl = {
            getData: () => { // simulate getData() method of OL TileLayer instance
                return pixValue;
            }
        };
        const map = {  // simulate map instance
            visualizationMode: '2D'
        };

        addLayerInstance(layerId, pseudoLayerOl, 'openlayers'); // required from cog.buildRequest()

        const request = cog.buildRequest(layer, { point, currentLocale, map });

        expect(request).toEqual(
            {
                "request": {
                    "features": [  // return 1 feature for each bands values
                        {
                            "type": "Feature",
                            "geometry": {
                                "type": "Point",
                                "coordinates": [
                                    -92.60925292968749,
                                    40.19133465092119
                                ]
                            },
                            "properties": {
                                "value": 140,
                                "band": 0
                            }
                        },
                        {
                            "type": "Feature",
                            "geometry": {
                                "type": "Point",
                                "coordinates": [
                                    -92.60925292968749,
                                    40.19133465092119
                                ]
                            },
                            "properties": {
                                "value": 80,
                                "band": 1
                            }
                        },
                        {
                            "type": "Feature",
                            "geometry": {
                                "type": "Point",
                                "coordinates": [
                                    -92.60925292968749,
                                    40.19133465092119
                                ]
                            },
                            "properties": {
                                "value": 80,
                                "band": 2
                            }
                        },
                        {
                            "type": "Feature",
                            "geometry": {
                                "type": "Point",
                                "coordinates": [
                                    -92.60925292968749,
                                    40.19133465092119
                                ]
                            },
                            "properties": {
                                "value": 255,
                                "band": 3
                            }
                        }
                    ],
                    "outputFormat": "application/json"
                },
                "metadata": {
                    "title": "Cloud layer title"
                },
                "url": "https://mydomain.com/cog.tif"
            }
        );
    });
});
