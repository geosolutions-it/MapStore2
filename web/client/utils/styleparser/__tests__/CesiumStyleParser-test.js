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
                                msClassificationType: 'terrain',
                                msClampToGround: true
                            }
                        ]
                    }
                ]
            };
            parser.writeStyle(style)
                .then((styleFunc) => {
                    Cesium.GeoJsonDataSource.load({
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[[7, 41], [14, 41], [14, 46], [7, 46], [7, 41]]]
                        }
                    }).then((dataSource) => {
                        const entities = dataSource?.entities?.values;
                        return styleFunc({ entities })
                            .then(() => {
                                expect({ ...entities[0].polygon.material.color.getValue() }).toEqual({ red: 1, green: 0, blue: 0, alpha: 0.5 });
                                expect(entities[0].polygon.classificationType.getValue()).toEqual(Cesium.ClassificationType.TERRAIN);
                                expect(entities[0].polygon.classificationType).toBeTruthy();
                                expect(entities[0].polyline.classificationType).toBeTruthy();
                                expect(entities[0].polyline.width.getValue()).toBe(2);
                                expect({ ...entities[0].polyline.material.color.getValue() }).toEqual({ red: 0, green: 1, blue: 0, alpha: 0.25 });
                                expect(entities[0].polyline.clampToGround.getValue()).toBe(true);
                                done();
                            }).catch(done);
                    });
                });
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
                                msClampToGround: false
                            }
                        ]
                    }
                ]
            };
            parser.writeStyle(style)
                .then((styleFunc) => {
                    Cesium.GeoJsonDataSource.load({
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[[7, 41], [14, 41], [14, 46], [7, 46], [7, 41]]]
                        }
                    }).then((dataSource) => {
                        const entities = dataSource?.entities?.values;
                        return styleFunc({ entities })
                            .then(() => {
                                expect({ ...entities[0].polygon.material.color.getValue() }).toEqual({ red: 1, green: 0, blue: 0, alpha: 0.5 });
                                expect(entities[0].polygon.classificationType).toBeFalsy();
                                expect(entities[0].polyline.classificationType).toBeFalsy();
                                expect(entities[0].polyline.width.getValue()).toBe(2);
                                expect({ ...entities[0].polyline.material.color.getValue() }).toEqual({ red: 0, green: 1, blue: 0, alpha: 0.25 });
                                expect(entities[0].polyline.clampToGround.getValue()).toBe(false);
                                done();
                            }).catch(done);
                    });
                });
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
                                msClampToGround: true
                            }
                        ]
                    }
                ]
            };
            parser.writeStyle(style)
                .then((styleFunc) => {
                    Cesium.GeoJsonDataSource.load({
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: [[7, 41], [14, 41], [14, 46], [7, 46]]
                        }
                    }).then((dataSource) => {
                        const entities = dataSource?.entities?.values;
                        return styleFunc({ entities })
                            .then(() => {
                                expect({ ...entities[0].polyline.material.color.getValue() }).toEqual({ red: 1, green: 0, blue: 0, alpha: 0.5 });
                                expect(entities[0].polyline.width.getValue()).toBe(2);
                                expect(entities[0].polyline.clampToGround.getValue()).toBe(true);
                                done();
                            }).catch(done);
                    });
                });
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
                                dasharray: [4, 4]
                            }
                        ]
                    }
                ]
            };
            parser.writeStyle(style)
                .then((styleFunc) => {
                    Cesium.GeoJsonDataSource.load({
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: [[7, 41], [14, 41], [14, 46], [7, 46]]
                        }
                    }).then((dataSource) => {
                        const entities = dataSource?.entities?.values;
                        return styleFunc({ entities })
                            .then(() => {
                                expect({ ...entities[0].polyline.material.color.getValue() }).toEqual({ red: 1, green: 0, blue: 0, alpha: 0.5 });
                                expect(entities[0].polyline.material.dashLength.getValue()).toBe(8);
                                expect(entities[0].polyline.material.dashPattern.getValue()).toBe(65280);
                                done();
                            }).catch(done);
                    });
                });
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
                                msBringToFront: true
                            }
                        ]
                    }
                ]
            };

            parser.writeStyle(style)
                .then((styleFunc) => {
                    Cesium.GeoJsonDataSource.load({
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'Point',
                            coordinates: [7, 41]
                        }
                    }).then((dataSource) => {
                        const entities = dataSource?.entities?.values;
                        return styleFunc({ entities })
                            .then(() => {
                                expect(entities[0].billboard.image.getValue().tagName).toBe('CANVAS');
                                expect(entities[0].billboard.scale.getValue()).toBe(1);
                                expect(entities[0].billboard.rotation.getValue()).toBe(-Math.PI / 2);
                                expect(entities[0].billboard.disableDepthTestDistance.getValue()).toBe(Number.POSITIVE_INFINITY);
                                expect(entities[0].billboard.heightReference.getValue()).toBe(Cesium.HeightReference.NONE);
                                done();
                            }).catch(done);
                    });
                });
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
                                msBringToFront: true
                            }
                        ]
                    }
                ]
            };

            parser.writeStyle(style)
                .then((styleFunc) => {
                    Cesium.GeoJsonDataSource.load({
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'Point',
                            coordinates: [7, 41]
                        }
                    }).then((dataSource) => {
                        const entities = dataSource?.entities?.values;
                        return styleFunc({ entities })
                            .then(() => {
                                expect(entities[0].billboard.image.getValue().src).toBe('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=');
                                expect({ ...entities[0].billboard.color.getValue() }).toEqual({ red: 1, green: 1, blue: 1, alpha: 0.5 });
                                expect(entities[0].billboard.scale.getValue()).toBe(32);
                                expect(entities[0].billboard.rotation.getValue()).toBe(-Math.PI / 2);
                                expect(entities[0].billboard.disableDepthTestDistance.getValue()).toBe(Number.POSITIVE_INFINITY);
                                expect(entities[0].billboard.heightReference.getValue()).toBe(Cesium.HeightReference.NONE);
                                done();
                            }).catch(done);
                    });
                });
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
                                height: 10
                            }
                        ]
                    }
                ]
            };

            parser.writeStyle(style)
                .then((styleFunc) => {
                    Cesium.GeoJsonDataSource.load({
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'Point',
                            coordinates: [7, 41]
                        }
                    }).then((dataSource) => {
                        const entities = dataSource?.entities?.values;
                        return styleFunc({ entities })
                            .then(() => {
                                expect(entities[0].model.uri.getValue()._url).toBe('/path/to/file.glb');
                                expect({ ...entities[0].model.color.getValue() }).toEqual({ red: 1, green: 1, blue: 1, alpha: 0.5 });
                                expect(entities[0].model.scale.getValue()).toBe(1);
                                expect(entities[0].model.heightReference.getValue()).toBe(Cesium.HeightReference.RELATIVE_TO_GROUND);
                                done();
                            })
                            .catch(done);
                    });
                });
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
                                rotate: 90
                            }
                        ]
                    }
                ]
            };

            parser.writeStyle(style)
                .then((styleFunc) => {
                    Cesium.GeoJsonDataSource.load({
                        type: 'Feature',
                        properties: {
                            text: 'Hello'
                        },
                        geometry: {
                            type: 'Point',
                            coordinates: [7, 41]
                        }
                    }).then((dataSource) => {
                        const entities = dataSource?.entities?.values;
                        return styleFunc({ entities })
                            .then(() => {
                                expect(entities[0].label.text.getValue()).toBe('Hello World!');
                                expect(entities[0].label.font.getValue()).toBe('italic bold 32px Arial');
                                expect({ ...entities[0].label.pixelOffset.getValue() }).toEqual({ x: 16, y: 16 });
                                expect({ ...entities[0].label.fillColor.getValue() }).toEqual({ red: 0, green: 0, blue: 0, alpha: 1 });
                                expect({ ...entities[0].label.outlineColor.getValue() }).toEqual({ red: 1, green: 1, blue: 1, alpha: 1 });
                                expect(entities[0].label.outlineWidth.getValue()).toBe(2);
                                expect(entities[0].label.heightReference.getValue()).toBe(Cesium.HeightReference.NONE);
                                done();
                            }).catch(done);
                    });
                });
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
                                ...leaderLineOptions
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
                                ...leaderLineOptions
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
                                ...leaderLineOptions
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
                                ...leaderLineOptions
                            }
                        ]
                    }
                ]
            };

            parser.writeStyle(style)
                .then((styleFunc) => {
                    Cesium.GeoJsonDataSource.load({
                        type: 'FeatureCollection',
                        features: [1, 2, 3, 4].map(id => ({
                            type: 'Feature',
                            properties: {
                                text: 'Hello',
                                id
                            },
                            geometry: {
                                type: 'Point',
                                coordinates: [7, 41, 500]
                            }
                        }))
                    }).then((dataSource) => {
                        const entities = dataSource?.entities?.values;
                        return styleFunc({ entities })
                            .then((styledEntities) => {
                                expect(styledEntities.length).toBe(4);
                                const [
                                    markKind,
                                    iconKind,
                                    textKind,
                                    modelKind
                                ] = styledEntities;
                                expect(markKind.billboard).toBeTruthy();
                                expect(iconKind.billboard).toBeTruthy();
                                expect(textKind.label).toBeTruthy();
                                expect(modelKind.model).toBeTruthy();

                                expect(markKind.polyline).toBeTruthy();
                                expect(iconKind.polyline).toBeTruthy();
                                expect(textKind.polyline).toBeTruthy();
                                expect(modelKind.polyline).toBeTruthy();

                                styledEntities.forEach(entity => {
                                    expect({ ...entity.polyline.material.color.getValue() }).toEqual({ red: 1, green: 0, blue: 0, alpha: 0.5 });
                                    expect(entity.polyline.width.getValue()).toBe(2);
                                });

                                expect(textKind.billboard).toBeTruthy();
                                expect({ ...textKind.billboard.color.getValue() }).toEqual({ red: 1, green: 0, blue: 0, alpha: 0.5 });
                                expect({ ...textKind.billboard.pixelOffset.getValue() }).toEqual({ x: 8, y: 8 });
                                const leaderLineCanvas = textKind.billboard.image.getValue();
                                expect(leaderLineCanvas.width).toBe(16);
                                expect(leaderLineCanvas.height).toBe(16);
                                done();
                            })
                            .catch(done);
                    }).catch(done);
                });
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

            const sampleTerrainTest = () => Promise.resolve([new Cesium.Cartographic(9, 45, 1000)]);
            parser.writeStyle(style).then((styleFunc) => {
                return Cesium.GeoJsonDataSource.load({type: "FeatureCollection", features: [{type: "Feature", properties: {}, geometry: {type: "Point", coordinates: [9, 45]}}]})
                    .then((dataSource) => {
                        const entities = dataSource.entities.values;
                        const mockMap = {terrainProvider: {ready: true}};
                        return styleFunc({entities, map: mockMap, sampleTerrain: sampleTerrainTest }).then((styledEntities) => {
                            expect(styledEntities.length).toBe(1);
                            expect(styledEntities[0].billboard).toBeTruthy();
                            expect(styledEntities[0].polyline).toBeTruthy();
                            const cartographicPosition = Cesium.Cartographic.fromCartesian(styledEntities[0].position._value);
                            const leaderLineCartographicPositionA = Cesium.Cartographic.fromCartesian(styledEntities[0].polyline.positions._value[0]);
                            const leaderLineCartographicPositionB = Cesium.Cartographic.fromCartesian(styledEntities[0].polyline.positions._value[1]);
                            expect(Math.round(cartographicPosition.height)).toBe(5000);
                            expect(Math.round(leaderLineCartographicPositionA.height)).toBe(1000);
                            expect(Math.round(leaderLineCartographicPositionB.height)).toBe(6000);
                            done();
                        });
                    });
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
            const sampleTerrainTest = () => Promise.resolve([new Cesium.Cartographic(9, 45, 1000)]);
            parser.writeStyle(style).then((styleFunc) => {
                return Cesium.GeoJsonDataSource.load({type: "FeatureCollection", features: [{type: "Feature", properties: {}, geometry: {type: "Point", coordinates: [9, 45]}}]})
                    .then((dataSource) => {
                        const entities = dataSource.entities.values;
                        const mockMap = {terrainProvider: {ready: true}};
                        return styleFunc({entities, map: mockMap, sampleTerrain: sampleTerrainTest }).then((styledEntities) => {
                            expect(styledEntities.length).toBe(1);
                            expect(styledEntities[0].billboard).toBeTruthy();
                            expect(styledEntities[0].polyline).toBeTruthy();
                            const cartographicPosition = Cesium.Cartographic.fromCartesian(styledEntities[0].position._value);
                            const leaderLineCartographicPositionA = Cesium.Cartographic.fromCartesian(styledEntities[0].polyline.positions._value[0]);
                            const leaderLineCartographicPositionB = Cesium.Cartographic.fromCartesian(styledEntities[0].polyline.positions._value[1]);
                            expect(Math.round(cartographicPosition.height)).toBe(5000);
                            expect(Math.round(leaderLineCartographicPositionA.height)).toBe(1000);
                            expect(Math.round(leaderLineCartographicPositionB.height)).toBe(5000);
                            done();
                        });
                    });
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
            const sampleTerrainTest = () => Promise.resolve([new Cesium.Cartographic(9, 45, 1000)]);
            parser.writeStyle(style).then((styleFunc) => {
                return Cesium.GeoJsonDataSource.load({type: "FeatureCollection", features: [{type: "Feature", properties: {}, geometry: {type: "Point", coordinates: [9, 45]}}]})
                    .then((dataSource) => {
                        const entities = dataSource.entities.values;
                        const mockMap = {terrainProvider: {ready: true}};
                        return styleFunc({entities, map: mockMap, sampleTerrain: sampleTerrainTest }).then((styledEntities) => {
                            expect(styledEntities.length).toBe(1);
                            expect(styledEntities[0].billboard).toBeTruthy();
                            expect(styledEntities[0].polyline).toBeTruthy();
                            const cartographicPosition = Cesium.Cartographic.fromCartesian(styledEntities[0].position._value);
                            const leaderLineCartographicPositionA = Cesium.Cartographic.fromCartesian(styledEntities[0].polyline.positions._value[0]);
                            const leaderLineCartographicPositionB = Cesium.Cartographic.fromCartesian(styledEntities[0].polyline.positions._value[1]);
                            expect(Math.round(cartographicPosition.height)).toBe(5000);
                            expect(Math.round(leaderLineCartographicPositionA.height)).toBe(1000);
                            expect(Math.round(leaderLineCartographicPositionB.height)).toBe(1000);
                            done();
                        });
                    });
            }).catch(done);
        });
    });
});
