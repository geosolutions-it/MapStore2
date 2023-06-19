/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import LeafletStyleParser from '../LeafletStyleParser';

const parser = new LeafletStyleParser();

describe('LeafletStyleParser', () => {
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
                                outlineWidth: 2
                            }
                        ]
                    }
                ]
            };
            parser.writeStyle(style)
                .then((styleFunc) => {
                    try {
                        const {
                            style: leafletStyleFunc
                        } = styleFunc();
                        const feature = {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'Polygon',
                                coordinates: [[[7, 41], [14, 41], [14, 46], [7, 46], [7, 41]]]
                            }
                        };
                        expect(leafletStyleFunc(feature)).toEqual({
                            fill: true,
                            stroke: true,
                            fillColor: '#ff0000',
                            fillOpacity: 0.5,
                            color: '#00ff00',
                            opacity: 0.25,
                            weight: 2
                        });
                    } catch (e) {
                        done(e);
                    }
                    done();
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
                                width: 2
                            }
                        ]
                    }
                ]
            };
            parser.writeStyle(style)
                .then((styleFunc) => {
                    try {
                        const {
                            style: leafletStyleFunc
                        } = styleFunc();
                        const feature = {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'LineString',
                                coordinates: [[7, 41], [14, 41], [14, 46], [7, 46]]
                            }
                        };
                        expect(leafletStyleFunc(feature)).toEqual({
                            stroke: true,
                            fill: false,
                            color: '#ff0000',
                            opacity: 0.5,
                            weight: 2
                        });
                    } catch (e) {
                        done(e);
                    }
                    done();
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
                    try {
                        const {
                            style: leafletStyleFunc
                        } = styleFunc();
                        const feature = {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'LineString',
                                coordinates: [[7, 41], [14, 41], [14, 46], [7, 46]]
                            }
                        };
                        expect(leafletStyleFunc(feature)).toEqual({
                            stroke: true,
                            fill: false,
                            color: '#ff0000',
                            opacity: 0.5,
                            weight: 2,
                            dashArray: '4 4'
                        });
                    } catch (e) {
                        done(e);
                    }
                    done();
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
                                rotate: 90
                            }
                        ]
                    }
                ]
            };

            parser.writeStyle(style)
                .then((styleFunc) => {
                    try {
                        const {
                            pointToLayer
                        } = styleFunc();

                        const feature = {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'Point',
                                coordinates: [7, 41]
                            }
                        };
                        const icon = pointToLayer(feature, [7, 41]).options.icon;
                        expect(icon.options.iconUrl.indexOf('data:image/png;base64')).toBe(0);
                        expect(icon.options.iconSize).toEqual([32, 32]);
                        expect(icon.options.iconAnchor).toEqual([16, 16]);

                    } catch (e) {
                        done(e);
                    }
                    done();
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
                                rotate: 90
                            }
                        ]
                    }
                ]
            };

            parser.writeStyle(style)
                .then((styleFunc) => {
                    try {
                        const {
                            pointToLayer
                        } = styleFunc();

                        const feature = {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'Point',
                                coordinates: [7, 41]
                            }
                        };
                        const icon = pointToLayer(feature, [7, 41]).options.icon;
                        expect(icon.options.iconUrl).toBe('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=');
                        expect(icon.options.iconSize).toEqual([32, 32]);
                        expect(icon.options.iconAnchor).toEqual([16, 16]);
                    } catch (e) {
                        done(e);
                    }
                    done();
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
                    try {
                        const {
                            pointToLayer
                        } = styleFunc();

                        const feature = {
                            type: 'Feature',
                            properties: {
                                text: 'Hello'
                            },
                            geometry: {
                                type: 'Point',
                                coordinates: [7, 41]
                            }
                        };
                        const icon = pointToLayer(feature, [7, 41]).options.icon;
                        const div = document.createElement('div');
                        div.innerHTML = icon.options.html;
                        expect(div.children[0].style.color).toBe('rgb(0, 0, 0)');
                        expect(div.children[0].style.fontFamily).toBe('Arial');
                        expect(div.children[0].style.fontStyle).toBe('italic');
                        expect(div.children[0].style.fontWeight).toBe('bold');
                        expect(div.children[0].style.fontSize).toBe('32px');
                        expect(div.children[0].style.transform).toBe('translate(16px, 16px) rotateZ(90deg)');
                        expect(div.children[0].style.webkitTextStrokeWidth).toBe('2px');
                        expect(div.children[0].style.webkitTextStrokeColor).toBe('rgb(255, 255, 255)');
                        expect(div.children[0].style.position).toBe('absolute');
                        expect(div.children[0].innerText.trim()).toBe('Hello World!');
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });
    });
});
