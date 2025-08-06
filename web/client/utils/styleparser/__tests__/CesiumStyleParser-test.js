/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as Cesium from 'cesium';
import expect from 'expect';

import CesiumStyleParser from '../CesiumStyleParser';
import GeoJSONStyledFeatures from '../../cesium/GeoJSONStyledFeatures';

const parser = new CesiumStyleParser();

describe('CesiumStyleParser', () => {
    describe('readStyle', () => {
        it('should return null, read function not implemented', (done) => {
            parser.readStyle()
                .then((parsed) => {
                    try {
                        expect(parsed).toBe(null);
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });
    });
    describe('writeStyle', () => {
        it('should write a style function with fill symbolizer', (done) => {
            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: '#ff0000',
                                fillOpacity: 0.5,
                                outlineColor: '#00ff00',
                                outlineOpacity: 0.25,
                                outlineWidth: 2,
                                outlineDasharray: [10, 10],
                                msClassificationType: 'terrain',
                                msClampToGround: true,
                                symbolizerId: 'symbolizer-01'
                            }
                        ]
                    }
                ]
            };
            const feature = {
                type: 'Feature',
                properties: {},
                id: 'feature-01',
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[7, 41], [14, 41], [14, 46], [7, 46], [7, 41]]]
                }
            };
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }]
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(2);
                    const [polygon, polyline] = styledFeatures;
                    expect(polygon.id).toBe('feature-01:symbolizer-01:polygon');
                    expect(polygon.primitive.type).toBe('polygon');
                    expect(polygon.primitive.entity.polygon.material.toString()).toEqual('(1, 0, 0, 0.5)');
                    expect(polygon.primitive.entity.polygon.classificationType).toBe(Cesium.ClassificationType.TERRAIN);
                    expect(polyline.id).toBe('feature-01:symbolizer-01:polyline');
                    expect(polyline.primitive.type).toBe('polyline');
                    expect(polyline.primitive.entity.polyline.classificationType).toBe(Cesium.ClassificationType.TERRAIN);
                    expect(polyline.primitive.entity.polyline.width).toBe(2);
                    expect(polyline.primitive.entity.polyline.material.color.toString()).toBe('(0, 1, 0, 0.25)');
                    expect(polyline.primitive.entity.polyline.clampToGround).toBe(true);
                    expect(polyline.primitive.entity.polyline.material.dashPattern.getValue()).toBe(65280);
                    done();
                }).catch(done);
        });
        it('should write a style function with fill symbolizer, clampToGround=false', (done) => {
            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: '#ff0000',
                                fillOpacity: 0.5,
                                outlineColor: '#00ff00',
                                outlineOpacity: 0.25,
                                outlineWidth: 2,
                                msClassificationType: 'terrain',
                                msClampToGround: false,
                                symbolizerId: 'symbolizer-01'
                            }
                        ]
                    }
                ]
            };
            const feature = {
                type: 'Feature',
                properties: {},
                id: 'feature-01',
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[7, 41], [14, 41], [14, 46], [7, 46], [7, 41]]]
                }
            };
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }]
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(2);
                    const [polygon, polyline] = styledFeatures;
                    expect(polygon.id).toBe('feature-01:symbolizer-01:polygon');
                    expect(polygon.primitive.type).toBe('polygon');
                    expect(polygon.primitive.entity.polygon.material.toString()).toEqual('(1, 0, 0, 0.5)');
                    expect(polygon.primitive.entity.polygon.classificationType).toBeFalsy();
                    expect(polyline.id).toBe('feature-01:symbolizer-01:polyline');
                    expect(polyline.primitive.type).toBe('polyline');
                    expect(polyline.primitive.entity.polyline.classificationType).toBeFalsy();
                    expect(polyline.primitive.entity.polyline.width).toBe(2);
                    expect(polyline.primitive.entity.polyline.material.toString()).toBe('(0, 1, 0, 0.25)');
                    expect(polyline.primitive.entity.polyline.clampToGround).toBe(false);
                    done();
                }).catch(done);
        });
        it('should write a style function with line symbolizer', (done) => {
            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Line',
                                color: '#ff0000',
                                opacity: 0.5,
                                width: 2,
                                msClampToGround: true,
                                symbolizerId: 'symbolizer-01'
                            }
                        ]
                    }
                ]
            };
            const feature = {
                type: 'Feature',
                properties: {},
                id: 'feature-01',
                geometry: {
                    type: 'LineString',
                    coordinates: [[7, 41], [14, 41], [14, 46], [7, 46]]
                }
            };
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }]
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(1);
                    const [polyline] = styledFeatures;
                    expect(polyline.primitive.entity.polyline.material.toString()).toBe('(1, 0, 0, 0.5)');
                    expect(polyline.primitive.entity.polyline.width).toBe(2);
                    expect(polyline.primitive.entity.polyline.clampToGround).toBe(true);
                    done();
                }).catch(done);
        });
        it('should write a style function with line symbolizer with dasharray', (done) => {
            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Line',
                                color: '#ff0000',
                                opacity: 0.5,
                                width: 2,
                                dasharray: [4, 4],
                                symbolizerId: 'symbolizer-01'
                            }
                        ]
                    }
                ]
            };
            const feature = {
                type: 'Feature',
                properties: {},
                id: 'feature-01',
                geometry: {
                    type: 'LineString',
                    coordinates: [[7, 41], [14, 41], [14, 46], [7, 46]]
                }
            };
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }]
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(1);
                    const [polyline] = styledFeatures;
                    expect(polyline.primitive.entity.polyline.material.color.toString()).toBe('(1, 0, 0, 0.5)');
                    expect(polyline.primitive.entity.polyline.material.dashLength.getValue()).toBe(8);
                    expect(polyline.primitive.entity.polyline.material.dashPattern.getValue()).toBe(65280);
                    done();
                }).catch(done);
        });
        it('should write a style function with mark symbolizer', (done) => {

            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Mark',
                                wellKnownName: 'Circle',
                                color: '#ff0000',
                                fillOpacity: 0.5,
                                strokeColor: '#00ff00',
                                strokeOpacity: 0.25,
                                strokeWidth: 3,
                                radius: 16,
                                rotate: 90,
                                msBringToFront: true,
                                symbolizerId: 'symbolizer-01'
                            }
                        ]
                    }
                ]
            };

            const feature = {
                type: 'Feature',
                properties: {},
                id: 'feature-01',
                geometry: {
                    type: 'Point',
                    coordinates: [7, 41]
                }
            };

            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }]
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(1);
                    const [billboard] = styledFeatures;
                    expect(billboard.primitive.entity.billboard.scale).toBe(1);
                    expect(billboard.primitive.entity.billboard.rotation).toBe(-Math.PI / 2);
                    expect(billboard.primitive.entity.billboard.disableDepthTestDistance).toBe(Number.POSITIVE_INFINITY);
                    expect(billboard.primitive.entity.billboard.heightReference).toBe(Cesium.HeightReference.NONE);
                    done();
                }).catch(done);
        });
        it('should write a style function with icon symbolizer', (done) => {

            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Icon',
                                /* png 1px x 1px */
                                image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=',
                                opacity: 0.5,
                                size: 32,
                                rotate: 90,
                                msBringToFront: true,
                                anchor: 'bottom-left',
                                symbolizerId: 'symbolizer-01'
                            }
                        ]
                    }
                ]
            };
            const feature = {
                type: 'Feature',
                properties: {},
                id: 'feature-01',
                geometry: {
                    type: 'Point',
                    coordinates: [7, 41]
                }
            };
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }]
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(1);
                    const [billboard] = styledFeatures;
                    expect(billboard.primitive.entity.billboard.image).toBe('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=');
                    expect(billboard.primitive.entity.billboard.color.toString()).toBe('(1, 1, 1, 0.5)');
                    expect(billboard.primitive.entity.billboard.scale).toBe(32);
                    expect(billboard.primitive.entity.billboard.rotation).toBe(-Math.PI / 2);
                    expect(billboard.primitive.entity.billboard.disableDepthTestDistance).toBe(Number.POSITIVE_INFINITY);
                    expect(billboard.primitive.entity.billboard.horizontalOrigin).toBe(Cesium.HorizontalOrigin.LEFT);
                    expect(billboard.primitive.entity.billboard.verticalOrigin).toBe(Cesium.VerticalOrigin.BOTTOM);
                    expect(billboard.primitive.entity.billboard.heightReference).toBe(Cesium.HeightReference.NONE);
                    done();
                }).catch(done);
        });
        it('should write a style function with model symbolizer', (done) => {

            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Model',
                                model: '/path/to/file.glb',
                                scale: 1,
                                heading: 0,
                                roll: 0,
                                pitch: 0,
                                color: '#ffffff',
                                opacity: 0.5,
                                msHeightReference: 'relative',
                                height: 10,
                                symbolizerId: 'symbolizer-01'
                            }
                        ]
                    }
                ]
            };
            const feature = {
                type: 'Feature',
                properties: {},
                id: 'feature-01',
                geometry: {
                    type: 'Point',
                    coordinates: [7, 41]
                }
            };
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }]
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(1);
                    const [model] = styledFeatures;
                    expect(model.primitive.entity.model.uri._url).toBe('/path/to/file.glb');
                    expect(model.primitive.entity.model.color.toString()).toBe('(1, 1, 1, 0.5)');
                    expect(model.primitive.entity.model.scale).toBe(1);
                    expect(model.primitive.entity.model.heightReference).toBe(Cesium.HeightReference.RELATIVE_TO_GROUND);
                    done();
                }).catch(done);
        });
        it('should write a style function with text symbolizer', (done) => {

            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Text',
                                label: '{{text}} World!',
                                offset: [16, 16],
                                color: '#000000',
                                haloColor: '#ffffff',
                                haloWidth: 2,
                                fontStyle: 'italic',
                                fontWeight: 'bold',
                                font: ['Arial'],
                                size: 32,
                                rotate: 90,
                                anchor: 'top-right',
                                symbolizerId: 'symbolizer-01'
                            }
                        ]
                    }
                ]
            };
            const feature = {
                type: 'Feature',
                id: 'feature-01',
                properties: {
                    text: 'Hello'
                },
                geometry: {
                    type: 'Point',
                    coordinates: [7, 41]
                }
            };
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }]
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(1);
                    const [label] = styledFeatures;
                    expect(label.primitive.entity.label.text).toBe('Hello World!');
                    expect(label.primitive.entity.label.font).toBe('italic bold 32px Arial');
                    expect(label.primitive.entity.label.pixelOffset.toString()).toBe('(16, 16)');
                    expect(label.primitive.entity.label.fillColor.toString()).toBe('(0, 0, 0, 1)');
                    expect(label.primitive.entity.label.outlineColor.toString()).toBe('(1, 1, 1, 1)');
                    expect(label.primitive.entity.label.outlineWidth).toBe(2);
                    expect(label.primitive.entity.label.horizontalOrigin).toBe(Cesium.HorizontalOrigin.RIGHT);
                    expect(label.primitive.entity.label.verticalOrigin).toBe(Cesium.VerticalOrigin.TOP);
                    expect(label.primitive.entity.label.heightReference).toBe(Cesium.HeightReference.NONE);
                    done();
                }).catch(done);
        });
        it('should add leader line to all point geometries symbolizer', (done) => {

            const leaderLineOptions = {
                msLeaderLineColor: '#ff0000',
                msLeaderLineOpacity: 0.5,
                msLeaderLineWidth: 2
            };

            const style = {
                name: '',
                rules: [
                    {
                        filter: ['==', 'id', 1],
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Mark',
                                wellKnownName: 'Circle',
                                color: '#ff0000',
                                fillOpacity: 0.5,
                                strokeColor: '#00ff00',
                                strokeOpacity: 0.25,
                                strokeWidth: 3,
                                radius: 16,
                                rotate: 90,
                                msBringToFront: true,
                                ...leaderLineOptions,
                                symbolizerId: 'symbolizer-01'
                            }
                        ]
                    },
                    {
                        filter: ['==', 'id', 2],
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Icon',
                                /* png 1px x 1px */
                                image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=',
                                opacity: 0.5,
                                size: 32,
                                rotate: 90,
                                msBringToFront: true,
                                ...leaderLineOptions,
                                symbolizerId: 'symbolizer-02'
                            }
                        ]
                    },
                    {
                        filter: ['==', 'id', 3],
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Text',
                                label: '{{text}} World!',
                                offset: [16, 16],
                                color: '#000000',
                                haloColor: '#ffffff',
                                haloWidth: 2,
                                fontStyle: 'italic',
                                fontWeight: 'bold',
                                font: ['Arial'],
                                size: 32,
                                rotate: 90,
                                ...leaderLineOptions,
                                symbolizerId: 'symbolizer-03'
                            }
                        ]
                    },
                    {
                        filter: ['==', 'id', 4],
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Model',
                                model: '/path/to/file.glb',
                                scale: 1,
                                heading: 0,
                                roll: 0,
                                pitch: 0,
                                color: '#ffffff',
                                opacity: 0.5,
                                msHeightReference: 'relative',
                                height: 10,
                                ...leaderLineOptions,
                                symbolizerId: 'symbolizer-04'
                            }
                        ]
                    }
                ]
            };
            const features = [1, 2, 3, 4].map(id => ({
                type: 'Feature',
                id,
                properties: {
                    text: 'Hello',
                    id
                },
                geometry: {
                    type: 'Point',
                    coordinates: [7, 41, 500]
                }
            }));
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: features.map((feature) => ({ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }))
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(9);
                    const [
                        mark,
                        markLeaderLine,
                        icon,
                        iconLeaderLine,
                        text,
                        textLeaderLine,
                        textOffset,
                        model,
                        modelLeaderLine
                    ] = styledFeatures;
                    expect(mark.primitive.entity.billboard).toBeTruthy();
                    expect(markLeaderLine.primitive.entity.polyline).toBeTruthy();
                    expect(icon.primitive.entity.billboard).toBeTruthy();
                    expect(iconLeaderLine.primitive.entity.polyline).toBeTruthy();
                    expect(text.primitive.entity.label).toBeTruthy();
                    expect(textLeaderLine.primitive.entity.polyline).toBeTruthy();
                    expect(textOffset.primitive.entity.billboard).toBeTruthy();
                    expect(model.primitive.entity.model).toBeTruthy();
                    expect(modelLeaderLine.primitive.entity.polyline).toBeTruthy();
                    [
                        markLeaderLine,
                        iconLeaderLine,
                        textLeaderLine,
                        modelLeaderLine
                    ].forEach(leaderLine => {
                        expect(leaderLine.primitive.entity.polyline.material.toString()).toBe('(1, 0, 0, 0.5)');
                        expect(leaderLine.primitive.entity.polyline.width).toBe(2);
                    });

                    expect(textOffset.primitive.entity.billboard.color.toString()).toBe('(1, 0, 0, 0.5)');
                    expect(textOffset.primitive.entity.billboard.pixelOffset.toString()).toBe('(8, 8)');
                    const leaderLineCanvas = textOffset.primitive.entity.billboard.image;
                    expect(leaderLineCanvas.width).toBe(16);
                    expect(leaderLineCanvas.height).toBe(16);
                    done();
                }).catch(done);
        });
        it('should add leader line where HeightReference is Relative', (done) => {
            const style = {
                "name": "",
                "rules": [
                    {
                        "name": "",
                        "symbolizers": [
                            {
                                "kind": "Mark",
                                "color": "#ffea00",
                                "fillOpacity": 1,
                                "strokeColor": "#3f3f3f",
                                "strokeOpacity": 1,
                                "strokeWidth": 1,
                                "radius": 32,
                                "wellKnownName": "Star",
                                "msHeightReference": "relative",
                                "msBringToFront": false,
                                "symbolizerId": "ea1db421-980f-11ed-a8e7-c1b9d44be36c",
                                "msHeight": 5000,
                                "msLeaderLineWidth": 4,
                                "msLeaderLineColor": "#ff0000",
                                "msLeaderLineOpacity": 1
                            }
                        ],
                        "ruleId": "ea1db420-980f-11ed-a8e7-c1b9d44be36c"
                    }
                ]
            };
            const feature = {
                type: "Feature",
                id: 'feature-01',
                properties: {},
                geometry: {
                    type: "Point",
                    coordinates: [9, 45]
                }
            };
            const sampleTerrainTest = () => Promise.resolve([new Cesium.Cartographic(9, 45, 1000)]);
            const mockMap = {terrainProvider: {ready: true}};
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }],
                    sampleTerrain: sampleTerrainTest,
                    map: mockMap
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(2);
                    const [billboard, leaderLine] = styledFeatures;
                    expect(billboard.primitive.entity.billboard).toBeTruthy();
                    expect(leaderLine.primitive.entity.polyline).toBeTruthy();
                    const cartographicPosition = Cesium.Cartographic.fromCartesian(billboard.primitive.geometry);
                    const leaderLineCartographicPositionA = Cesium.Cartographic.fromCartesian(leaderLine.primitive.geometry[0][0]);
                    const leaderLineCartographicPositionB = Cesium.Cartographic.fromCartesian(leaderLine.primitive.geometry[0][1]);
                    expect(Math.round(cartographicPosition.height)).toBe(5000);
                    expect(Math.round(leaderLineCartographicPositionA.height)).toBe(1000);
                    expect(Math.round(leaderLineCartographicPositionB.height)).toBe(6000);
                    done();
                }).catch(done);
        });

        it('should add leader line where HeightReference is none', (done) => {
            const style = {
                "name": "",
                "rules": [
                    {
                        "name": "",
                        "symbolizers": [
                            {
                                "kind": "Mark",
                                "color": "#ffea00",
                                "fillOpacity": 1,
                                "strokeColor": "#3f3f3f",
                                "strokeOpacity": 1,
                                "strokeWidth": 1,
                                "radius": 32,
                                "wellKnownName": "Star",
                                "msHeightReference": "none",
                                "msBringToFront": false,
                                "symbolizerId": "ea1db421-980f-11ed-a8e7-c1b9d44be36c",
                                "msHeight": 5000,
                                "msLeaderLineWidth": 4,
                                "msLeaderLineColor": "#ff0000",
                                "msLeaderLineOpacity": 1
                            }
                        ],
                        "ruleId": "ea1db420-980f-11ed-a8e7-c1b9d44be36c"
                    }
                ]
            };
            const feature = {
                type: "Feature",
                id: 'feature-01',
                properties: {},
                geometry: {
                    type: "Point",
                    coordinates: [9, 45]
                }
            };
            const sampleTerrainTest = () => Promise.resolve([new Cesium.Cartographic(9, 45, 1000)]);
            const mockMap = {terrainProvider: {ready: true}};
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }],
                    sampleTerrain: sampleTerrainTest,
                    map: mockMap
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(2);
                    const [billboard, leaderLine] = styledFeatures;
                    expect(billboard.primitive.entity.billboard).toBeTruthy();
                    expect(leaderLine.primitive.entity.polyline).toBeTruthy();
                    const cartographicPosition = Cesium.Cartographic.fromCartesian(billboard.primitive.geometry);
                    const leaderLineCartographicPositionA = Cesium.Cartographic.fromCartesian(leaderLine.primitive.geometry[0][0]);
                    const leaderLineCartographicPositionB = Cesium.Cartographic.fromCartesian(leaderLine.primitive.geometry[0][1]);
                    expect(Math.round(cartographicPosition.height)).toBe(5000);
                    expect(Math.round(leaderLineCartographicPositionA.height)).toBe(1000);
                    expect(Math.round(leaderLineCartographicPositionB.height)).toBe(5000);
                    done();
                }).catch(done);
        });

        it('should add leader line where HeightReference is clamp', (done) => {
            const style = {
                "name": "",
                "rules": [
                    {
                        "name": "",
                        "symbolizers": [
                            {
                                "kind": "Mark",
                                "color": "#ffea00",
                                "fillOpacity": 1,
                                "strokeColor": "#3f3f3f",
                                "strokeOpacity": 1,
                                "strokeWidth": 1,
                                "radius": 32,
                                "wellKnownName": "Star",
                                "msHeightReference": "clamp",
                                "msBringToFront": false,
                                "symbolizerId": "ea1db421-980f-11ed-a8e7-c1b9d44be36c",
                                "msHeight": 5000,
                                "msLeaderLineWidth": 4,
                                "msLeaderLineColor": "#ff0000",
                                "msLeaderLineOpacity": 1
                            }
                        ],
                        "ruleId": "ea1db420-980f-11ed-a8e7-c1b9d44be36c"
                    }
                ]
            };
            const feature = {
                type: "Feature",
                id: 'feature-01',
                properties: {},
                geometry: {
                    type: "Point",
                    coordinates: [9, 45]
                }
            };
            const sampleTerrainTest = () => Promise.resolve([new Cesium.Cartographic(9, 45, 1000)]);
            const mockMap = {terrainProvider: {ready: true}};
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }],
                    sampleTerrain: sampleTerrainTest,
                    map: mockMap
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(2);
                    const [billboard, leaderLine] = styledFeatures;
                    expect(billboard.primitive.entity.billboard).toBeTruthy();
                    expect(leaderLine.primitive.entity.polyline).toBeTruthy();
                    const cartographicPosition = Cesium.Cartographic.fromCartesian(billboard.primitive.geometry);
                    const leaderLineCartographicPositionA = Cesium.Cartographic.fromCartesian(leaderLine.primitive.geometry[0][0]);
                    const leaderLineCartographicPositionB = Cesium.Cartographic.fromCartesian(leaderLine.primitive.geometry[0][1]);
                    expect(Math.round(cartographicPosition.height)).toBe(5000);
                    expect(Math.round(leaderLineCartographicPositionA.height)).toBe(1000);
                    expect(Math.round(leaderLineCartographicPositionB.height)).toBe(1000);
                    done();
                }).catch(done);
        });

        it('should write a style function with circle symbolizer', (done) => {
            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Circle',
                                color: '#ff0000',
                                opacity: 0.5,
                                outlineColor: '#00ff00',
                                outlineWidth: 2,
                                radius: 1000000,
                                geodesic: true,
                                outlineOpacity: 0.25,
                                outlineDasharray: [10, 10],
                                symbolizerId: 'symbolizer-01'
                            }
                        ]
                    }
                ]
            };
            const feature = {
                type: 'Feature',
                properties: {},
                id: 'feature-01',
                geometry: {
                    type: 'Point',
                    coordinates: [7, 41]
                }
            };
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }]
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(2);
                    const [polygon, polyline] = styledFeatures;
                    expect(polygon.id).toBe('feature-01:symbolizer-01:polygon');
                    expect(polygon.primitive.type).toBe('polygon');
                    expect(polygon.primitive.entity.polygon.material.toString()).toEqual('(1, 0, 0, 0.5)');
                    expect(polyline.id).toBe('feature-01:symbolizer-01:polyline');
                    expect(polyline.primitive.type).toBe('polyline');
                    expect(polyline.primitive.entity.polyline.width).toBe(2);
                    expect(polyline.primitive.entity.polyline.material.color.toString()).toBe('(0, 1, 0, 0.25)');
                    expect(polyline.primitive.entity.polyline.material.dashPattern.getValue()).toBe(65280);
                    done();
                }).catch(done);
        });

        it('should be able to use feature properties as style value', (done) => {
            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: {
                                    name: 'property',
                                    args: ['color']
                                },
                                fillOpacity: {
                                    name: 'property',
                                    args: ['opacity']
                                },
                                outlineColor: '#00ff00',
                                outlineOpacity: 0.25,
                                outlineWidth: {
                                    name: 'property',
                                    args: ['size']
                                },
                                outlineDasharray: [10, 10],
                                msClassificationType: 'terrain',
                                msClampToGround: true,
                                symbolizerId: 'symbolizer-01'
                            }
                        ]
                    }
                ]
            };
            const feature = {
                type: 'Feature',
                id: 'feature-01',
                properties: {
                    color: '#ff0000',
                    opacity: 0.5,
                    size: 2
                },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[7, 41], [14, 41], [14, 46], [7, 46], [7, 41]]]
                }
            };
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }]
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(2);
                    const [polygon, polyline] = styledFeatures;
                    expect(polygon.id).toBe('feature-01:symbolizer-01:polygon');
                    expect(polygon.primitive.type).toBe('polygon');
                    expect(polygon.primitive.entity.polygon.material.toString()).toEqual('(1, 0, 0, 0.5)');
                    expect(polygon.primitive.entity.polygon.classificationType).toBe(Cesium.ClassificationType.TERRAIN);
                    expect(polyline.id).toBe('feature-01:symbolizer-01:polyline');
                    expect(polyline.primitive.type).toBe('polyline');
                    expect(polyline.primitive.entity.polyline.classificationType).toBe(Cesium.ClassificationType.TERRAIN);
                    expect(polyline.primitive.entity.polyline.width).toBe(2);
                    expect(polyline.primitive.entity.polyline.material.color.toString()).toBe('(0, 1, 0, 0.25)');
                    expect(polyline.primitive.entity.polyline.clampToGround).toBe(true);
                    expect(polyline.primitive.entity.polyline.material.dashPattern.getValue()).toBe(65280);
                    done();
                }).catch(done);
        });
        it('should write a style function with model symbolizer with x/y translation', (done) => {

            const translateDelta = 100;
            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Model',
                                model: '/path/to/file.glb',
                                scale: 1,
                                heading: 0,
                                roll: 0,
                                pitch: 0,
                                color: '#ffffff',
                                opacity: 0.5,
                                msHeightReference: 'relative',
                                height: 10,
                                msTranslateX: translateDelta,
                                msTranslateY: translateDelta,
                                msLeaderLineColor: '#ff0000',
                                msLeaderLineOpacity: 0.5,
                                msLeaderLineWidth: 2,
                                symbolizerId: 'symbolizer-01'
                            }
                        ]
                    }
                ]
            };

            const lng = 7;
            const lat = 41;
            const feature = {
                type: 'Feature',
                properties: {},
                id: 'feature-01',
                geometry: {
                    type: 'Point',
                    coordinates: [lng, lat]
                }
            };
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }]
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(2);
                    const [model, modelLeaderLine] = styledFeatures;
                    const expectedTranslatedDistance = Math.round(Math.sqrt(2) * translateDelta);
                    const initialPosition = Cesium.Cartesian3.fromDegrees(lng, lat);
                    const distancePosition = Math.round(Cesium.Cartesian3.distance(
                        initialPosition,
                        model.primitive.geometry
                    ));
                    expect(distancePosition).toBe(expectedTranslatedDistance);
                    const leaderLinePositions = modelLeaderLine.primitive.geometry[0];
                    const distanceLeaderLineA = Math.round(Cesium.Cartesian3.distance(
                        initialPosition,
                        leaderLinePositions[0]
                    ));
                    expect(distanceLeaderLineA).toBe(0);
                    const distanceLeaderLineB = Math.round(Cesium.Cartesian3.distance(
                        initialPosition,
                        leaderLinePositions[1]
                    ));
                    expect(distanceLeaderLineB).toBe(expectedTranslatedDistance);
                    done();
                }).catch(done);
        });
        it('should write style function with extruded fill symbolizer (none height reference)', (done) => {
            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                symbolizerId: 'symbolizer-01',
                                kind: 'Fill',
                                color: '#ff0000',
                                fillOpacity: 0.5,
                                msHeight: 10,
                                msExtrudedHeight: 20,
                                msHeightReference: 'none',
                                msExtrusionRelativeToGeometry: false
                            }
                        ]
                    }
                ]
            };
            const feature = {
                type: 'Feature',
                properties: {},
                id: 'feature-01',
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[7, 41], [14, 41], [14, 46], [7, 46], [7, 41]]]
                }
            };
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }]
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(1);
                    const [polygon] = styledFeatures;
                    expect(polygon.primitive.entity.polygon.height).toBe(10);
                    expect(polygon.primitive.entity.polygon.extrudedHeight).toBe(20);
                    done();
                }).catch(done);
        });
        it('should write style function with extruded fill symbolizer (relative height reference)', (done) => {
            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                symbolizerId: 'symbolizer-01',
                                kind: 'Fill',
                                color: '#ff0000',
                                fillOpacity: 0.5,
                                msHeight: 10,
                                msExtrudedHeight: 20,
                                msHeightReference: 'relative',
                                msExtrusionRelativeToGeometry: false
                            }
                        ]
                    }
                ]
            };
            const feature = {
                type: 'Feature',
                properties: {},
                id: 'feature-01',
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[7, 41], [14, 41], [14, 46], [7, 46], [7, 41]]]
                }
            };
            const sampleTerrainTest = () => Promise.resolve(feature.geometry.coordinates[0].map(([lng, lat]) => {
                return new Cesium.Cartographic(lng, lat, 100);
            }));
            const mockMap = {terrainProvider: {ready: true}};
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }],
                    sampleTerrain: sampleTerrainTest,
                    map: mockMap
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(1);
                    const [polygon] = styledFeatures;
                    expect(polygon.primitive.entity.polygon.height).toBe(undefined);
                    expect(Math.round(Cesium.Cartographic.fromCartesian(polygon.primitive.geometry[0][0]).height)).toBe(110);
                    expect(polygon.primitive.entity.polygon.extrudedHeight).toBe(120);
                    done();
                }).catch(done);
        });
        it('should write style function with extruded fill symbolizer (clamp height reference)', (done) => {
            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                symbolizerId: 'symbolizer-01',
                                kind: 'Fill',
                                color: '#ff0000',
                                fillOpacity: 0.5,
                                msHeight: 10,
                                msExtrudedHeight: 20,
                                msHeightReference: 'clamp',
                                msExtrusionRelativeToGeometry: false
                            }
                        ]
                    }
                ]
            };
            const feature = {
                type: 'Feature',
                properties: {},
                id: 'feature-01',
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[7, 41], [14, 41], [14, 46], [7, 46], [7, 41]]]
                }
            };
            const sampleTerrainTest = () => Promise.resolve(feature.geometry.coordinates[0].map(([lng, lat]) => {
                return new Cesium.Cartographic(lng, lat, 100);
            }));
            const mockMap = {terrainProvider: {ready: true}};
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }],
                    sampleTerrain: sampleTerrainTest,
                    map: mockMap
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(1);
                    const [polygon] = styledFeatures;
                    expect(polygon.primitive.entity.polygon.height).toBe(undefined);
                    expect(Math.round(Cesium.Cartographic.fromCartesian(polygon.primitive.geometry[0][0]).height)).toBe(100);
                    expect(polygon.primitive.entity.polygon.extrudedHeight).toBe(120);
                    done();
                }).catch(done);
        });
        it('should write style function with extruded fill symbolizer (none height reference and relative extrusion)', (done) => {
            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                symbolizerId: 'symbolizer-01',
                                kind: 'Fill',
                                color: '#ff0000',
                                fillOpacity: 0.5,
                                msHeight: 10,
                                msExtrudedHeight: 20,
                                msHeightReference: 'none',
                                msExtrusionRelativeToGeometry: true
                            }
                        ]
                    }
                ]
            };
            const feature = {
                type: 'Feature',
                properties: {},
                id: 'feature-01',
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[7, 41], [14, 41], [14, 46], [7, 46], [7, 41]]]
                }
            };
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }]
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(1);
                    const [polygon] = styledFeatures;
                    expect(polygon.primitive.entity.polygon.height).toBe(undefined);
                    expect(Math.round(Cesium.Cartographic.fromCartesian(polygon.primitive.geometry[0][0]).height)).toBe(10);
                    expect(polygon.primitive.entity.polygon.extrudedHeight).toBe(30);
                    done();
                }).catch(done);
        });
        it('should write style function with extruded fill symbolizer (relative height reference and relative extrusion)', (done) => {
            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                symbolizerId: 'symbolizer-01',
                                kind: 'Fill',
                                color: '#ff0000',
                                fillOpacity: 0.5,
                                msHeight: 10,
                                msExtrudedHeight: 20,
                                msHeightReference: 'relative',
                                msExtrusionRelativeToGeometry: true
                            }
                        ]
                    }
                ]
            };
            const feature = {
                type: 'Feature',
                properties: {},
                id: 'feature-01',
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[7, 41], [14, 41], [14, 46], [7, 46], [7, 41]]]
                }
            };
            const sampleTerrainTest = () => Promise.resolve(feature.geometry.coordinates[0].map(([lng, lat]) => {
                return new Cesium.Cartographic(lng, lat, 100);
            }));
            const mockMap = {terrainProvider: {ready: true}};
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }],
                    sampleTerrain: sampleTerrainTest,
                    map: mockMap
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(1);
                    const [polygon] = styledFeatures;
                    expect(polygon.primitive.entity.polygon.height).toBe(undefined);
                    expect(Math.round(Cesium.Cartographic.fromCartesian(polygon.primitive.geometry[0][0]).height)).toBe(110);
                    expect(polygon.primitive.entity.polygon.extrudedHeight).toBe(130);
                    done();
                }).catch(done);
        });
        it('should write a style function with line symbolizer and circle extrusion', (done) => {
            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Line',
                                symbolizerId: 'symbolizer-01',
                                msExtrudedHeight: 100,
                                msExtrusionColor: '#ff0000',
                                msExtrusionOpacity: 0.5,
                                msExtrusionType: 'Circle'
                            }
                        ]
                    }
                ]
            };
            const feature = {
                type: 'Feature',
                properties: {},
                id: 'feature-01',
                geometry: {
                    type: 'LineString',
                    coordinates: [[7, 41], [14, 41], [14, 46], [7, 46]]
                }
            };
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }]
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(1);
                    const [polylineVolume] = styledFeatures;
                    expect(polylineVolume.primitive.entity.polylineVolume.material.toString()).toBe('(1, 0, 0, 0.5)');
                    expect(polylineVolume.primitive.entity.polylineVolume.shape.length).toBe(360);
                    done();
                }).catch(done);
        });
        it('should write style function with extruded fill symbolizer (none height reference)', (done) => {
            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Line',
                                symbolizerId: 'symbolizer-01',
                                msExtrusionColor: '#ff0000',
                                msExtrusionOpacity: 0.5,
                                msHeight: 10,
                                msExtrudedHeight: 20,
                                msHeightReference: 'none',
                                msExtrusionRelativeToGeometry: false
                            }
                        ]
                    }
                ]
            };
            const feature = {
                type: 'Feature',
                properties: {},
                id: 'feature-01',
                geometry: {
                    type: 'LineString',
                    coordinates: [[7, 41], [14, 41], [14, 46], [7, 46]]
                }
            };
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }]
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(1);
                    const [polyline] = styledFeatures;
                    expect(Math.round(polyline.primitive.minimumHeights[0][0])).toBe(10);
                    expect(Math.round(polyline.primitive.maximumHeights[0][0])).toBe(20);
                    done();
                }).catch(done);
        });
        it('should write style function with extruded fill symbolizer (relative height reference)', (done) => {
            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Line',
                                symbolizerId: 'symbolizer-01',
                                msExtrusionColor: '#ff0000',
                                msExtrusionOpacity: 0.5,
                                msHeight: 10,
                                msExtrudedHeight: 20,
                                msHeightReference: 'relative',
                                msExtrusionRelativeToGeometry: false
                            }
                        ]
                    }
                ]
            };
            const feature = {
                type: 'Feature',
                properties: {},
                id: 'feature-01',
                geometry: {
                    type: 'LineString',
                    coordinates: [[7, 41], [14, 41], [14, 46], [7, 46]]
                }
            };
            const sampleTerrainTest = () => Promise.resolve(feature.geometry.coordinates.map(([lng, lat]) => {
                return new Cesium.Cartographic(lng, lat, 100);
            }));
            const mockMap = {terrainProvider: {ready: true}};
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }],
                    sampleTerrain: sampleTerrainTest,
                    map: mockMap
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(1);
                    const [polyline] = styledFeatures;
                    expect(Math.round(polyline.primitive.minimumHeights[0][0])).toBe(110);
                    expect(Math.round(polyline.primitive.maximumHeights[0][0])).toBe(120);
                    done();
                }).catch(done);
        });
        it('should write style function with extruded fill symbolizer (clamp height reference)', (done) => {
            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Line',
                                symbolizerId: 'symbolizer-01',
                                msExtrusionColor: '#ff0000',
                                msExtrusionOpacity: 0.5,
                                msHeight: 10,
                                msExtrudedHeight: 20,
                                msHeightReference: 'clamp',
                                msExtrusionRelativeToGeometry: false
                            }
                        ]
                    }
                ]
            };
            const feature = {
                type: 'Feature',
                properties: {},
                id: 'feature-01',
                geometry: {
                    type: 'LineString',
                    coordinates: [[7, 41], [14, 41], [14, 46], [7, 46]]
                }
            };
            const sampleTerrainTest = () => Promise.resolve(feature.geometry.coordinates.map(([lng, lat]) => {
                return new Cesium.Cartographic(lng, lat, 100);
            }));
            const mockMap = {terrainProvider: {ready: true}};
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }],
                    sampleTerrain: sampleTerrainTest,
                    map: mockMap
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(1);
                    const [polyline] = styledFeatures;
                    expect(Math.round(polyline.primitive.minimumHeights[0][0])).toBe(100);
                    expect(Math.round(polyline.primitive.maximumHeights[0][0])).toBe(120);
                    done();
                }).catch(done);
        });
        it('should write style function with extruded fill symbolizer (none height reference and relative extrusion)', (done) => {
            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Line',
                                symbolizerId: 'symbolizer-01',
                                msExtrusionColor: '#ff0000',
                                msExtrusionOpacity: 0.5,
                                msHeight: 10,
                                msExtrudedHeight: 20,
                                msHeightReference: 'none',
                                msExtrusionRelativeToGeometry: true
                            }
                        ]
                    }
                ]
            };
            const feature = {
                type: 'Feature',
                properties: {},
                id: 'feature-01',
                geometry: {
                    type: 'LineString',
                    coordinates: [[7, 41], [14, 41], [14, 46], [7, 46]]
                }
            };
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }]
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(1);
                    const [polyline] = styledFeatures;
                    expect(Math.round(polyline.primitive.minimumHeights[0][0])).toBe(10);
                    expect(Math.round(polyline.primitive.maximumHeights[0][0])).toBe(30);
                    done();
                }).catch(done);
        });
        it('should write style function with extruded fill symbolizer (relative height reference and relative extrusion)', (done) => {
            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Line',
                                symbolizerId: 'symbolizer-01',
                                msExtrusionColor: '#ff0000',
                                msExtrusionOpacity: 0.5,
                                msHeight: 10,
                                msExtrudedHeight: 20,
                                msHeightReference: 'relative',
                                msExtrusionRelativeToGeometry: true
                            }
                        ]
                    }
                ]
            };
            const feature = {
                type: 'Feature',
                properties: {},
                id: 'feature-01',
                geometry: {
                    type: 'LineString',
                    coordinates: [[7, 41], [14, 41], [14, 46], [7, 46]]
                }
            };
            const sampleTerrainTest = () => Promise.resolve(feature.geometry.coordinates.map(([lng, lat]) => {
                return new Cesium.Cartographic(lng, lat, 100);
            }));
            const mockMap = {terrainProvider: {ready: true}};
            parser.writeStyle(style)
                .then((styleFunc) => styleFunc({
                    features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }],
                    sampleTerrain: sampleTerrainTest,
                    map: mockMap
                }))
                .then((styledFeatures) => {
                    expect(styledFeatures.length).toBe(1);
                    const [polyline] = styledFeatures;
                    expect(Math.round(polyline.primitive.minimumHeights[0][0])).toBe(110);
                    expect(Math.round(polyline.primitive.maximumHeights[0][0])).toBe(130);
                    done();
                }).catch(done);
        });
    });
    it('should not draw the marker when using radius property without argument', (done) => {
        const style = {
            name: '',
            rules: [
                {
                    filter: undefined,
                    name: '',
                    symbolizers: [
                        {
                            kind: 'Mark',
                            wellKnownName: 'Circle',
                            color: '#ff0000',
                            fillOpacity: 0.5,
                            strokeColor: '#00ff00',
                            strokeOpacity: 0.25,
                            strokeWidth: 3,
                            radius: {
                                name: 'property',
                                args: []
                            },
                            rotate: 90,
                            msBringToFront: true,
                            symbolizerId: 'symbolizer-01'
                        }
                    ]
                }
            ]
        };
        const feature = {
            type: 'Feature',
            id: 'feature-01',
            properties: {
                radius: 2
            },
            geometry: {
                type: 'Point',
                coordinates: [7, 41]
            }
        };
        parser.writeStyle(style)
            .then((styleFunc) => styleFunc({
                features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }]
            }))
            .then((styledFeatures) => {
                expect(styledFeatures.length).toBe(0);
                done();
            }).catch(done);
    });
    it('should not draw the icon when using size property without argument', (done) => {
        const style = {
            name: '',
            rules: [
                {
                    filter: undefined,
                    name: '',
                    symbolizers: [
                        {
                            kind: 'Icon',
                            /* png 1px x 1px */
                            image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=',
                            opacity: 0.5,
                            size: {
                                name: 'property',
                                args: []
                            },
                            rotate: 90,
                            msBringToFront: true,
                            anchor: 'bottom-left',
                            symbolizerId: 'symbolizer-01'
                        }
                    ]
                }
            ]
        };
        const feature = {
            type: 'Feature',
            id: 'feature-01',
            properties: {
                radius: 2
            },
            geometry: {
                type: 'Point',
                coordinates: [7, 41]
            }
        };
        parser.writeStyle(style)
            .then((styleFunc) => styleFunc({
                features: [{ ...feature, positions: GeoJSONStyledFeatures.featureToCartesianPositions(feature) }]
            }))
            .then((styledFeatures) => {
                expect(styledFeatures.length).toBe(0);
                done();
            }).catch(done);
    });
});
