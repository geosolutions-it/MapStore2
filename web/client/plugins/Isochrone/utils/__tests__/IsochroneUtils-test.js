/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    getIsochroneLayer,
    getMarkerLayerIdentifier,
    getRunLayerIdentifier,
    getRouteDetail
} from '../IsochroneUtils';
import { BUCKET_COLORS, CONTROL_NAME, ISOCHRONE_ROUTE_LAYER } from '../../constants';

describe('IsochroneUtils', () => {

    describe('getIsochroneLayer', () => {
        const sampleData = [
            {
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
                }
            },
            {
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[0.5, 0.5], [1.5, 0.5], [1.5, 1.5], [0.5, 1.5], [0.5, 0.5]]]
                }
            }
        ];

        const sampleConfig = {
            profile: 'car',
            distance_limit: 500,
            buckets: 2
        };

        it('should generate isochrone layer with default parameters', () => {
            const result = getIsochroneLayer();

            expect(result).toExist();
            expect(result.layer).toExist();
            expect(result.bbox).toExist();
            expect(result.data).toExist();

            expect(result.layer.type).toBe('vector');
            expect(result.layer.name).toBe(ISOCHRONE_ROUTE_LAYER);
            expect(result.layer.title).toBe(CONTROL_NAME);
            expect(result.layer.visibility).toBe(true);
            expect(result.layer.features).toEqual([]);
        });

        it('should generate isochrone layer with data', () => {
            const result = getIsochroneLayer(sampleData);

            expect(result.layer.features.length).toBe(2);
            expect(result.layer.features[0]).toBeTruthy();
            expect(result.layer.features[0].properties.id).toEqual('isochrone-polygon-0');
            expect(result.layer.features[0].geometry).toBeTruthy();
            expect(result.layer.features[1]).toBeTruthy();
            expect(result.layer.features[1].properties.id).toEqual('isochrone-polygon-1');
            expect(result.layer.features[1].geometry).toBeTruthy();
        });

        it('should generate isochrone layer with config', () => {
            const result = getIsochroneLayer(sampleData, sampleConfig);

            expect(result.data.config).toEqual(sampleConfig);
        });

        it('should generate proper layer structure', () => {
            const result = getIsochroneLayer(sampleData);

            expect(result.layer.type).toBe('vector');
            expect(result.layer.id).toExist();
            expect(typeof result.layer.id).toBe('string');
            expect(result.layer.name).toBe(ISOCHRONE_ROUTE_LAYER);
            expect(result.layer.title).toBe(CONTROL_NAME);
            expect(result.layer.visibility).toBe(true);
            expect(Array.isArray(result.layer.features)).toBe(true);
            expect(result.layer.features.length).toBe(2);
            expect(result.layer.style.format).toBe('geostyler');
            expect(Array.isArray(result.layer.style.body.rules)).toBe(true);
            expect(result.layer.style.body.rules.length).toBe(2);
        });

        it('should generate proper style rules for each feature', () => {
            const result = getIsochroneLayer(sampleData);
            const rules = result.layer.style.body.rules;

            expect(rules.length).toBe(2);
            expect(rules[0]).toEqual({
                filter: ['||', ['==', 'id', 'isochrone-polygon-0']],
                name: 'isochrone-polygon-0',
                symbolizers: [{
                    kind: 'Fill',
                    color: BUCKET_COLORS[0],
                    fillOpacity: 0.7,
                    outlineColor: "#000000",
                    outlineOpacity: 1,
                    outlineWidth: 2,
                    msClassificationType: 'both',
                    msClampToGround: true
                }]
            });
            expect(rules[1]).toEqual({
                filter: ['||', ['==', 'id', 'isochrone-polygon-1']],
                name: 'isochrone-polygon-1',
                symbolizers: [{
                    kind: 'Fill',
                    color: BUCKET_COLORS[1],
                    fillOpacity: 0.7,
                    outlineColor: "#000000",
                    outlineOpacity: 1,
                    msClassificationType: 'both',
                    msClampToGround: true,
                    outlineWidth: 2
                }]
            });
        });
        it('should generate proper feature and marker style rule', () => {
            const result = getIsochroneLayer(sampleData, { location: [0, 0] });
            const rules = result.layer.style.body.rules;
            expect(result.layer.features.length).toBe(3);
            expect(rules.length).toBe(3);
            expect(rules[0]).toEqual({
                filter: ['||', ['==', 'id', 'isochrone-polygon-0']],
                name: 'isochrone-polygon-0',
                symbolizers: [{
                    kind: 'Fill',
                    color: BUCKET_COLORS[0],
                    fillOpacity: 0.7,
                    outlineColor: "#000000",
                    outlineOpacity: 1,
                    outlineWidth: 2,
                    msClassificationType: 'both',
                    msClampToGround: true
                }]
            });
            expect(rules[1]).toEqual({
                filter: ['||', ['==', 'id', 'isochrone-polygon-1']],
                name: 'isochrone-polygon-1',
                symbolizers: [{
                    kind: 'Fill',
                    color: BUCKET_COLORS[1],
                    fillOpacity: 0.7,
                    outlineColor: "#000000",
                    outlineOpacity: 1,
                    msClassificationType: 'both',
                    msClampToGround: true,
                    outlineWidth: 2
                }]
            });
            expect(rules[2]).toEqual({
                name: "center",
                symbolizers: [
                    {
                        kind: "Mark",
                        wellKnownName: "Circle",
                        color: "#dddddd",
                        fillOpacity: 0,
                        strokeColor: "#000000",
                        strokeOpacity: 1,
                        strokeWidth: 2,
                        radius: 4,
                        rotate: 0,
                        msBringToFront: false,
                        msHeightReference: "none"
                    }
                ],
                filter: [ '||', [ '==', 'id', 'point' ] ]
            });
        });

        it('should use correct bucket colors', () => {
            const data = Array.from({ length: 5 }, () => ({
                geometry: { type: 'Polygon', coordinates: [] }
            }));
            const result = getIsochroneLayer(data);
            const rules = result.layer.style.body.rules;

            expect(rules[0].symbolizers[0].color).toBe(BUCKET_COLORS[0]);
            expect(rules[1].symbolizers[0].color).toBe(BUCKET_COLORS[1]);
            expect(rules[2].symbolizers[0].color).toBe(BUCKET_COLORS[2]);
            expect(rules[3].symbolizers[0].color).toBe(BUCKET_COLORS[3]);
        });

        it('should use last bucket color for features beyond available colors', () => {
            const data = Array.from({ length: BUCKET_COLORS.length + 3 }, () => ({
                geometry: { type: 'Polygon', coordinates: [] }
            }));
            const result = getIsochroneLayer(data);
            const rules = result.layer.style.body.rules;

            const lastColor = BUCKET_COLORS[BUCKET_COLORS.length - 1];
            expect(rules[BUCKET_COLORS.length].symbolizers[0].color).toBe(lastColor);
            expect(rules[BUCKET_COLORS.length + 1].symbolizers[0].color).toBe(lastColor);
            expect(rules[BUCKET_COLORS.length + 2].symbolizers[0].color).toBe(lastColor);
        });

        it('should handle empty data array', () => {
            const result = getIsochroneLayer([]);

            expect(result.layer.features).toEqual([]);
            expect(result.layer.style.body.rules).toEqual([]);
        });

        it('should handle null data', () => {
            const result = getIsochroneLayer(null);

            expect(result.layer.features).toEqual([]);
            expect(result.layer.style.body.rules).toEqual([]);
        });

        it('should handle undefined data', () => {
            const result = getIsochroneLayer(undefined);

            expect(result.layer.features).toEqual([]);
            expect(result.layer.style.body.rules).toEqual([]);
        });

        it('should generate bbox from features', () => {
            const result = getIsochroneLayer(sampleData);

            expect(result.bbox).toExist();
            expect(Array.isArray(result.bbox)).toBe(true);
            expect(result.bbox.length).toBe(4); // [minX, minY, maxX, maxY]
            expect(typeof result.bbox[0]).toBe('number');
            expect(typeof result.bbox[1]).toBe('number');
            expect(typeof result.bbox[2]).toBe('number');
            expect(typeof result.bbox[3]).toBe('number');
        });

        it('should return data object with layer and bbox', () => {
            const result = getIsochroneLayer(sampleData, sampleConfig);

            expect(result.data).toEqual({
                layer: result.layer,
                bbox: result.bbox,
                config: sampleConfig
            });
        });

        it('should handle complex geometry types', () => {
            const complexData = [
                {
                    geometry: {
                        type: 'MultiPolygon',
                        coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]]
                    }
                },
                {
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]]
                    }
                }
            ];
            const result = getIsochroneLayer(complexData);

            expect(result.layer.features.length).toBe(2);
            expect(result.layer.features[0].geometry.type).toBe('MultiPolygon');
            expect(result.layer.features[1].geometry.type).toBe('Polygon');
        });

        it('should preserve original data properties', () => {
            const dataWithProperties = [
                {
                    geometry: { type: 'Polygon', coordinates: [] },
                    properties: { customProp: 'value1' }
                },
                {
                    geometry: { type: 'Polygon', coordinates: [] },
                    properties: { customProp: 'value2' }
                }
            ];
            const result = getIsochroneLayer(dataWithProperties);

            expect(result.layer.features[0].properties).toEqual({
                id: 'isochrone-polygon-0'
            });
            expect(result.layer.features[1].properties).toEqual({
                id: 'isochrone-polygon-1'
            });
        });

        it('should generate unique IDs for each call', () => {
            const result1 = getIsochroneLayer(sampleData);
            const result2 = getIsochroneLayer(sampleData);

            expect(result1.layer.id).toNotEqual(result2.layer.id);
        });

        it('should compute isochrone bands correctly', () => {
            const data = [
                {
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]]
                    }
                },
                {
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[[0.5, 0.5], [1.5, 0.5], [1.5, 1.5], [0.5, 1.5], [0.5, 0.5]]]
                    }
                }
            ];
            const result = getIsochroneLayer(data);

            expect(result.layer.features.length).toBe(2);
            expect(result.layer.features[0].properties.id).toBe('isochrone-polygon-0');
            expect(result.layer.features[1].properties.id).toBe('isochrone-polygon-1');
        });

        it('should handle single feature correctly', () => {
            const singleFeatureData = [
                {
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
                    }
                }
            ];
            const result = getIsochroneLayer(singleFeatureData);

            expect(result.layer.features.length).toBe(1);
            expect(result.layer.features[0].geometry).toEqual(singleFeatureData[0].geometry);
            expect(result.layer.style.body.rules.length).toBe(1);
        });

        it('should generate valid GeoJSON features', () => {
            const result = getIsochroneLayer(sampleData);

            result.layer.features.forEach(feature => {
                expect(feature.type).toBe('Feature');
                expect(feature.geometry).toExist();
                expect(feature.properties).toExist();
                expect(feature.properties.id).toExist();
            });
        });

        it('should generate valid GeoStyler style', () => {
            const result = getIsochroneLayer(sampleData);

            expect(result.layer.style.format).toBe('geostyler');
            expect(result.layer.style.body).toExist();
            expect(result.layer.style.body.rules).toExist();
            expect(Array.isArray(result.layer.style.body.rules)).toBe(true);

            result.layer.style.body.rules.forEach(rule => {
                expect(rule.filter).toExist();
                expect(rule.symbolizers).toExist();
                expect(Array.isArray(rule.symbolizers)).toBe(true);
                expect(rule.symbolizers.length).toBe(1);
                expect(rule.symbolizers[0].kind).toBe('Fill');
            });
        });
    });

    describe('getMarkerLayerIdentifier', () => {
        it('should generate correct identifier for index 0', () => {
            const result = getMarkerLayerIdentifier(0);

            expect(result).toEqual(ISOCHRONE_ROUTE_LAYER + '_marker_0');
        });

        it('should use correct constants', () => {
            const result = getMarkerLayerIdentifier(0);

            expect(result).toEqual(ISOCHRONE_ROUTE_LAYER + '_marker_0');
        });

        it('should generate unique identifiers for different indices', () => {
            const result1 = getMarkerLayerIdentifier(1);
            const result2 = getMarkerLayerIdentifier(2);
            const result3 = getMarkerLayerIdentifier(3);

            expect(result1).toNotEqual(result2);
            expect(result2).toNotEqual(result3);
            expect(result1).toNotEqual(result3);
        });

        it('should handle string index', () => {
            const result = getMarkerLayerIdentifier('test');

            expect(result).toEqual(ISOCHRONE_ROUTE_LAYER + '_marker_test');
        });

        it('should handle numeric string index', () => {
            const result = getMarkerLayerIdentifier('123');

            expect(result).toEqual(ISOCHRONE_ROUTE_LAYER + '_marker_123');
        });
    });

    describe('getRunLayerIdentifier', () => {
        it('should generate correct identifier for id 0', () => {
            const result = getRunLayerIdentifier(0);

            expect(result).toEqual(ISOCHRONE_ROUTE_LAYER + '_run_0');
        });

        it('should use correct constants', () => {
            const result = getRunLayerIdentifier(0);

            expect(result).toEqual(ISOCHRONE_ROUTE_LAYER + '_run_0');
        });

        it('should generate unique identifiers for different ids', () => {
            const result1 = getRunLayerIdentifier(1);
            const result2 = getRunLayerIdentifier(2);
            const result3 = getRunLayerIdentifier(3);

            expect(result1).toNotEqual(result2);
            expect(result2).toNotEqual(result3);
            expect(result1).toNotEqual(result3);
        });

        it('should handle string id', () => {
            const result = getRunLayerIdentifier('test');

            expect(result).toEqual(ISOCHRONE_ROUTE_LAYER + '_run_test');
        });

        it('should handle numeric string id', () => {
            const result = getRunLayerIdentifier('123');

            expect(result).toEqual(ISOCHRONE_ROUTE_LAYER + '_run_123');
        });
    });

    describe('getRouteDetail', () => {
        it('should return empty string when config is empty', () => {
            const result = getRouteDetail({});
            expect(result).toBe('');
        });

        it('should return empty string when config is null', () => {
            const result = getRouteDetail(null);
            expect(result).toBe('');
        });

        it('should return empty string when config is undefined', () => {
            const result = getRouteDetail(undefined);
            expect(result).toBe('');
        });

        it('should return object with location and distance when distanceLimit is provided', () => {
            const config = {
                location: [5.123456, 5.987654],
                distanceLimit: 5000 // 5km in meters
            };
            const result = getRouteDetail(config);

            expect(result).toEqual({
                lat: '5.99',
                lon: '5.12',
                distance: 5000,
                time: null
            });
        });

        it('should return object with location and time when timeLimit is provided', () => {
            const config = {
                location: [10.5, 20.7],
                timeLimit: 600 // 10 minutes in seconds
            };
            const result = getRouteDetail(config);

            expect(result).toEqual({
                lat: '20.70',
                lon: '10.50',
                distance: null,
                time: 600
            });
        });

        it('should return object with both distance and time when both are provided', () => {
            const config = {
                location: [15.25, 25.75],
                distanceLimit: 3000, // 3km
                timeLimit: 600 // 10 minutes
            };
            const result = getRouteDetail(config);

            expect(result).toEqual({
                lat: '25.75',
                lon: '15.25',
                distance: 3000,
                time: 600
            });
        });

        it('should handle config with no distanceLimit or timeLimit', () => {
            const config = {
                location: [0, 0]
            };
            const result = getRouteDetail(config);

            expect(result).toEqual({
                lat: '0.00',
                lon: '0.00',
                distance: null,
                time: null
            });
        });
    });
});
