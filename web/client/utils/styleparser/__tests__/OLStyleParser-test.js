/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import OLStyleParser from '../OLStyleParser';

const parser = new OLStyleParser();

describe('OLStyleParser', () => {
    describe('writeStyle', () => {
        it('should apply correctly the fill opacity', (done) => {
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
                                fillOpacity: 0.5
                            }
                        ]
                    }
                ]
            };
            parser.writeStyle(style)
                .then((parsed) => {
                    try {
                        expect(parsed()()[0].fill_.color_).toBe('rgba(255, 0, 0, 0.5)');
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });
        it('should apply correctly the fill opacity', (done) => {
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
                                size: 32
                            }
                        ]
                    }
                ]
            };
            parser.writeStyle(style)
                .then((parsed) => {
                    try {
                        expect(parsed()()[0].image_.scale_).toBe(32);
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });
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
                .then((parsed) => {
                    const olStyle = parsed()();
                    const fill = olStyle[0].getFill();
                    expect(fill.getColor()).toBe('rgba(255, 0, 0, 0.5)');
                    const stroke = olStyle[0].getStroke();
                    expect(stroke.getColor()).toBe('rgba(0, 255, 0, 0.25)');
                    expect(stroke.getWidth()).toBe(2);
                    done();
                })
                .catch(done);
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
                .then((parsed) => {
                    const olStyle = parsed()();
                    const stroke = olStyle[0].getStroke();
                    expect(stroke.getColor()).toBe('rgba(255, 0, 0, 0.5)');
                    expect(stroke.getWidth()).toBe(2);
                    done();
                })
                .catch(done);
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
                .then((parsed) => {
                    const olStyle = parsed()();
                    const stroke = olStyle[0].getStroke();
                    expect(stroke.getColor()).toBe('rgba(255, 0, 0, 0.5)');
                    expect(stroke.getWidth()).toBe(2);
                    expect(stroke.getLineDash()).toEqual([ 4, 4 ]);
                    done();
                })
                .catch(done);
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
                .then((parsed) => {
                    const olStyle = parsed()();
                    const image = olStyle[0].getImage();
                    const imageFill = image.getFill();
                    expect(imageFill.getColor()).toBe('rgba(255, 0, 0, 0.5)');
                    const imageStroke = image.getStroke();
                    expect(imageStroke.getColor()).toBe('rgba(0, 255, 0, 0.25)');
                    expect(imageStroke.getWidth()).toBe(3);
                    expect(image.getRadius()).toBe(16);
                    done();
                })
                .catch(done);
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

            parser.writeStyle(style)
                .then((parsed) => {
                    const olStyle = parsed()();
                    const image = olStyle[0].getImage();
                    expect(image.getSrc()).toBe('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=');
                    expect(image.getOpacity()).toBe(0.5);
                    expect(image.getScale()).toBe(32);
                    expect(Math.round(image.getRotation() * 180 / Math.PI)).toBe(90);
                    done();
                })
                .catch(done);
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
                .then((parsed) => {
                    const olStyle = parsed()({ getProperties: () => ({ text: 'Hello' }) });
                    const text = olStyle[0].getText();
                    expect(text.getText()).toBe('Hello World!');
                    expect(text.getOffsetX()).toBe(16);
                    expect(text.getOffsetY()).toBe(16);
                    expect(text.getFont()).toBe('bold italic 32px Arial');
                    expect(Math.round(text.getRotation() * 180 / Math.PI)).toBe(90);
                    const textFill = text.getFill();
                    expect(textFill.getColor()).toBe('#000000');
                    const textStroke = text.getStroke();
                    expect(textStroke.getColor()).toBe('#ffffff');
                    expect(textStroke.getWidth()).toBe(2);
                    done();
                })
                .catch(done);
        });
    });
});
