/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import PrintStyleParser from '../PrintStyleParser';

const parser = new PrintStyleParser();

describe('PrintStyleParser', () => {
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
        it('should write a style function with fill symbolizer', () => {
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
                                outlineWidth: 2
                            }
                        ]
                    }
                ]
            };
            const layer = {
                features: [
                    {
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [[[0, 0], [0, 1], [1, 1], [0, 0]]]
                        }
                    }
                ]
            };
            const printFeaturesWithStyle = parser.writeStyle(style, true)({ layer });
            expect(printFeaturesWithStyle.length).toBe(1);
            expect(printFeaturesWithStyle[0].properties.ms_style).toEqual({
                strokeColor: '#00ff00',
                strokeOpacity: 0.25,
                strokeWidth: 2,
                fillColor: '#ff0000',
                fillOpacity: 0.5
            });
        });

        it('should write a style function with line symbolizer', () => {
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
                                width: 2
                            }
                        ]
                    }
                ]
            };
            const layer = {
                features: [
                    {
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                            "type": "LineString",
                            "coordinates": [[0, 0], [0, 1]]
                        }
                    }
                ]
            };
            const printFeaturesWithStyle = parser.writeStyle(style, true)({ layer });
            expect(printFeaturesWithStyle.length).toBe(1);
            expect(printFeaturesWithStyle[0].properties.ms_style).toEqual({
                strokeColor: '#ff0000',
                strokeOpacity: 0.5,
                strokeWidth: 2
            });
        });
        it('should write a style function with line symbolizer with dasharray', () => {
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
            const layer = {
                features: [
                    {
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                            "type": "LineString",
                            "coordinates": [[0, 0], [0, 1]]
                        }
                    }
                ]
            };
            const printFeaturesWithStyle = parser.writeStyle(style, true)({ layer });
            expect(printFeaturesWithStyle.length).toBe(1);
            expect(printFeaturesWithStyle[0].properties.ms_style).toEqual({
                strokeColor: '#ff0000',
                strokeOpacity: 0.5,
                strokeWidth: 2,
                strokeDashstyle: "4 4"
            });
        });
        it('should write a style function with mark symbolizer', () => {

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
                                rotate: 90
                            }
                        ]
                    }
                ]
            };

            const layer = {
                features: [
                    {
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                            "type": "Point",
                            "coordinates": [0, 0]
                        }
                    }
                ]
            };
            const printFeaturesWithStyle = parser.writeStyle(style, true)({ layer });
            expect(printFeaturesWithStyle.length).toBe(1);
            const { externalGraphic, ...msStyle } = printFeaturesWithStyle[0].properties.ms_style;
            expect(externalGraphic.indexOf('data:image/png;base64')).toBe(0);
            expect(msStyle).toEqual({
                graphicWidth: 32,
                graphicHeight: 32,
                graphicXOffset: -16,
                graphicYOffset: -16,
                rotation: 90,
                graphicOpacity: 1
            });
        });
        it('should write a style function with icon symbolizer', () => {

            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Icon',
                                // png 1px x 1px
                                image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=',
                                opacity: 0.5,
                                size: 32,
                                rotate: 90
                            }
                        ]
                    }
                ]
            };

            const layer = {
                features: [
                    {
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                            "type": "Point",
                            "coordinates": [0, 0]
                        }
                    }
                ]
            };
            const printFeaturesWithStyle = parser.writeStyle(style, true)({ layer });
            expect(printFeaturesWithStyle.length).toBe(1);
            expect(printFeaturesWithStyle[0].properties.ms_style).toEqual({
                graphicWidth: 32,
                graphicHeight: 32,
                // png 1px x 1px
                externalGraphic: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=',
                graphicXOffset: -16,
                graphicYOffset: -16,
                rotation: 90,
                graphicOpacity: 0.5
            });
        });
        it('should write a style function with text symbolizer', () => {

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

            const layer = {
                features: [
                    {
                        "type": "Feature",
                        "properties": {
                            "text": "Hello"
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [0, 0]
                        }
                    }
                ]
            };
            const printFeaturesWithStyle = parser.writeStyle(style, true)({ layer });
            expect(printFeaturesWithStyle.length).toBe(1);
            expect(printFeaturesWithStyle[0].properties.ms_style).toEqual({
                fontSize: 32,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                labelAlign: 'cm',
                labelXOffset: 16,
                labelYOffset: -16,
                rotation: -90,
                fontColor: '#000000',
                fontOpacity: 1,
                label: 'Hello World!',
                fillOpacity: 0,
                pointRadius: 0,
                strokeOpacity: 0,
                strokeWidth: 0
            });
        });
    });
});
