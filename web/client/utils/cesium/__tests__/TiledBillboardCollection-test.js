/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import * as Cesium from 'cesium';
import TiledBillboardCollection, { getLevelWithMaximumTexelSpacing, makeTile } from '../TiledBillboardCollection';

describe('TiledBillboardCollection', () => {
    let mockMap;
    let mockScene;
    let mockCamera;
    let mockGlobe;
    let mockTerrainProvider;

    beforeEach(() => {
        // Create proper mock objects that match Cesium's expected interface
        mockCamera = {
            position: new Cesium.Cartesian3(0, 0, 1000000),
            direction: new Cesium.Cartesian3(0, 0, -1),
            pitch: 0,
            moveEnd: {
                addEventListener: () => {},
                removeEventListener: () => {}
            },
            computeViewRectangle: () => ({
                west: -0.1,
                south: -0.1,
                east: 0.1,
                north: 0.1
            })
        };

        mockGlobe = {
            _surface: {
                _tilesToRender: [
                    { level: 10 },
                    { level: 12 },
                    { level: 15 }
                ]
            }
        };

        mockTerrainProvider = {
            getLevelMaximumGeometricError: () => 100
        };

        mockScene = {
            globe: mockGlobe,
            primitives: {
                add: () => {},
                remove: () => {}
            },
            requestRender: () => {},
            pick: () => new Cesium.Cartesian3(0, 0, 0)
        };

        mockMap = {
            scene: mockScene,
            camera: mockCamera,
            terrainProvider: mockTerrainProvider
        };
    });

    describe('getLevelWithMaximumTexelSpacing function', () => {
        let mockTilingScheme;

        beforeEach(() => {
            // Simple mock tiling scheme - just returns mock data
            mockTilingScheme = {
                ellipsoid: { maximumRadius: 6378137.0 },
                rectangle: { width: 2 * Math.PI },
                getNumberOfXTilesAtLevel: () => 2
            };
        });

        it('should return a number type', () => {
            const result = getLevelWithMaximumTexelSpacing(
                mockTilingScheme,
                1000,
                0,
                512
            );

            expect(typeof result).toBe('number');
        });

        it('should return a non-negative integer', () => {
            const result = getLevelWithMaximumTexelSpacing(
                mockTilingScheme,
                500,
                Math.PI / 4,
                256
            );

            expect(typeof result).toBe('number');
            expect(result >= 0).toBe(true);
            expect(Number.isInteger(result)).toBe(true);
        });
    });

    describe('makeTile function', () => {
        let mockTilingScheme;
        let mockCartographic;

        beforeEach(() => {
            // Mock cartographic position
            mockCartographic = new Cesium.Cartographic(
                Math.PI / 4, // 45 degrees longitude
                Math.PI / 6, // 30 degrees latitude
                0 // sea level
            );

            // Simple mock tiling scheme - just returns mock data
            mockTilingScheme = {
                positionToTileXY: () => {
                    // Return mock tile coordinates
                    return { x: 5, y: 3 };
                },

                tileXYToRectangle: () => {
                    // Return mock rectangle
                    return {
                        west: -0.5,
                        south: 0.2,
                        east: -0.3,
                        north: 0.4
                    };
                }
            };
        });

        it('should create a tile object with correct structure', () => {
            const imageryLevel = 5;
            const result = makeTile(mockCartographic, imageryLevel, mockTilingScheme);

            expect(result).toBeTruthy();
            expect(typeof result).toBe('object');
            expect(result.x !== undefined).toBe(true);
            expect(result.y !== undefined).toBe(true);
            expect(result.z !== undefined).toBe(true);
            expect(result.id !== undefined).toBe(true);
            expect(result.rectangle !== undefined).toBe(true);
        });

        it('should set correct tile coordinates and level', () => {
            const imageryLevel = 3;
            const result = makeTile(mockCartographic, imageryLevel, mockTilingScheme);

            expect(typeof result.x).toBe('number');
            expect(typeof result.y).toBe('number');
            expect(result.z).toBe(imageryLevel);
            expect(result.x).toBe(5); // From mock data
            expect(result.y).toBe(3); // From mock data
        });

        it('should generate correct tile ID format', () => {
            const imageryLevel = 7;
            const result = makeTile(mockCartographic, imageryLevel, mockTilingScheme);

            expect(typeof result.id).toBe('string');
            expect(result.id).toBe('5:3:7'); // From mock data: x:y:level
            expect(result.id.split(':').length).toBe(3);
        });

        it('should create Cesium Rectangle object', () => {
            const imageryLevel = 4;
            const result = makeTile(mockCartographic, imageryLevel, mockTilingScheme);

            expect(result.rectangle).toBeTruthy();
            expect(result.rectangle.constructor.name).toBe('Rectangle');
            expect(typeof result.rectangle.west).toBe('number');
            expect(typeof result.rectangle.south).toBe('number');
            expect(typeof result.rectangle.east).toBe('number');
            expect(typeof result.rectangle.north).toBe('number');
        });


        it('should handle rectangle properties from mock data', () => {
            const result = makeTile(mockCartographic, 8, mockTilingScheme);

            // Check rectangle has expected mock values
            expect(result.rectangle.west).toBe(-0.5);
            expect(result.rectangle.south).toBe(0.2);
            expect(result.rectangle.east).toBe(-0.3);
            expect(result.rectangle.north).toBe(0.4);
        });
    });


    it('should create TiledBillboardCollection with custom options', () => {
        const customCollection = new TiledBillboardCollection({
            map: mockMap,
            debugTiles: true,
            tileWidth: 256,
            minimumLevel: 5,
            maximumLevel: 15,
            loadTile: () => {
                return Promise.resolve({ features: [] });
            },
            style: { symbolizers: [{ kind: 'Icon' }] },
            msId: 'custom-ms-id',
            opacity: 0.5
        });
        customCollection.load();

        expect(customCollection._debugTiles).toBe(true);
        expect(customCollection._tileWidth).toBe(256);
        expect(customCollection._minimumLevel).toBe(5);
        expect(customCollection._maximumLevel).toBe(15);
        expect(customCollection._style).toEqual({ symbolizers: [{ kind: 'Icon' }] });
    });

    it('should handle loadTile function that returns features', (done) => {
        const mockFeatures = [
            {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [0, 0] },
                properties: { name: 'Test Point' }
            }
        ];

        const customCollection = new TiledBillboardCollection({
            map: mockMap,
            loadTile: () => Promise.resolve({ features: mockFeatures }),
            style: { symbolizers: [{ kind: 'Icon' }] }
        });

        expect(customCollection._loadTile).toBeTruthy();

        // Test the loadTile function with a mock tile
        const mockTile = { id: 'test-tile', x: 0, y: 0, z: 10 };
        customCollection._loadTile(mockTile).then((result) => {
            expect(result).toEqual({ features: mockFeatures });
            done();
        }).catch(done);
    });
});
