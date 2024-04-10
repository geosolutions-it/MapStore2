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
                                outlineWidth: 2,
                                outlineDasharray: [10, 10]
                            }
                        ]
                    }
                ]
            };
            parser.writeStyle(style)
                .then(stylePromise => stylePromise())
                .then(({
                    style: leafletStyleFunc
                }) => {
                    const feature = {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[[7, 41], [14, 41], [14, 46], [7, 46], [7, 41]]]
                        }
                    };
                    expect(leafletStyleFunc(feature)).toEqual({
                        fill: false,
                        stroke: false
                    });
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
                                width: 2
                            }
                        ]
                    }
                ]
            };
            parser.writeStyle(style)
                .then(stylePromise => stylePromise())
                .then(({
                    style: leafletStyleFunc
                }) => {
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
                                dasharray: [4, 4]
                            }
                        ]
                    }
                ]
            };
            parser.writeStyle(style)
                .then(stylePromise => stylePromise())
                .then(({
                    style: leafletStyleFunc
                }) => {
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
                                rotate: 90
                            }
                        ]
                    }
                ]
            };

            parser.writeStyle(style)
                .then(stylePromise => stylePromise())
                .then(({
                    pointToLayer
                }) => {
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
                                anchor: 'top-right'
                            }
                        ]
                    }
                ]
            };

            parser.writeStyle(style)
                .then(stylePromise => stylePromise())
                .then(({
                    pointToLayer
                }) => {
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
                    expect(icon.options.iconAnchor).toEqual([32, 0]);
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
                                anchor: 'bottom'
                            }
                        ]
                    }
                ]
            };

            parser.writeStyle(style)
                .then(stylePromise => stylePromise())
                .then(({
                    pointToLayer
                }) => {
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
                    expect(div.children[0].style.transform).toBe('translate(calc(-50% + 16px), calc(-100% + 16px)) rotateZ(90deg)');
                    expect(div.children[0].style.webkitTextStrokeWidth).toBe('2px');
                    expect(div.children[0].style.webkitTextStrokeColor).toBe('rgb(255, 255, 255)');
                    expect(div.children[0].style.position).toBe('absolute');
                    expect(div.children[0].innerText.trim()).toBe('Hello World!');
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
                                kind: 'Circle',
                                color: '#ff0000',
                                opacity: 0.5,
                                outlineColor: '#00ff00',
                                outlineWidth: 2,
                                radius: 1000000,
                                geodesic: true,
                                outlineOpacity: 0.25,
                                outlineDasharray: [10, 10]
                            }
                        ]
                    }
                ]
            };

            parser.writeStyle(style)
                .then(stylePromise => stylePromise())
                .then(({
                    pointToLayer
                }) => {
                    const feature = {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'Point',
                            coordinates: [7, 41]
                        }
                    };
                    const geoJSONPolygonCircle = pointToLayer(feature, [7, 41]);
                    expect(geoJSONPolygonCircle.getLayers()[0].options.color).toBe('#00ff00');
                    expect(geoJSONPolygonCircle.getLayers()[0].options.weight).toBe(2);
                    expect(geoJSONPolygonCircle.getLayers()[0].options.opacity).toBe(0.25);
                    expect(geoJSONPolygonCircle.getLayers()[0].options.dashArray).toBe('10 10');
                    expect(geoJSONPolygonCircle.getLayers()[0].options.fillColor).toBe('#ff0000');
                    expect(geoJSONPolygonCircle.getLayers()[0].options.fillOpacity).toBe(0.5);
                    expect(geoJSONPolygonCircle.getLayers()[0].feature.geometry.type).toBe('Polygon');
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
                                outlineDasharray: [10, 10]
                            }
                        ]
                    }
                ]
            };
            parser.writeStyle(style)
                .then(stylePromise => stylePromise())
                .then(({
                    style: leafletStyleFunc
                }) => {
                    const feature = {
                        type: 'Feature',
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
                    expect(leafletStyleFunc(feature)).toEqual({
                        fill: false,
                        stroke: false
                    });
                    done();
                }).catch(done);
        });
    });
});
