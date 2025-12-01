/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from "expect";
import vector from "../vector";

describe("mapinfo vector utils", () => {
    it("should create a request for a generic vector layer", () => {
        const layer = {
            id: "layer1",
            title: "My Layer",
            features: [{ properties: { prop1: "val", embedUrl: "test" } }],
            featureInfo: {
                format: "TEMPLATE",
                template: "<p>Test</p>"
            }
        };
        const props = {
            point: {
                latlng: { lat: 40, lng: 10 },
                intersectedFeatures: [
                    {
                        id: "layer1",
                        features: [
                            { type: "Feature", properties: { prop1: "val", embedUrl: "test" } }
                        ]
                    }
                ]
            },
            map: {
                resolution: 10,
                units: "m"
            }
        };
        const result = vector.buildRequest(layer, props);

        expect(result).toEqual({
            request: {
                features: [{ type: "Feature", properties: { prop1: "val", embedUrl: "test" } }],
                outputFormat: "application/json",
                lat: 40,
                lng: 10
            },
            metadata: {
                fields: ["prop1", "embedUrl"],
                title: "My Layer",
                resolution: 10,
                buffer: 2,
                units: "m",
                rowViewer: undefined,
                viewer: undefined,
                featureInfo: {
                    format: "TEMPLATE",
                    template: "<p>Test</p>"
                },
                layerId: "layer1"
            },
            url: "client"
        });
    });
});

