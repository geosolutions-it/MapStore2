/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import OLStyleParser, {createGetImagesSrc} from '../OLStyleParser';

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
                .then(stylePromise => stylePromise())
                .then((parsed) => {
                    expect(parsed()[0].fill_.color_).toBe('rgba(255, 0, 0, 0.5)');
                    done();
                }).catch(done);
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
                .then(stylePromise => stylePromise())
                .then((parsed) => {
                    expect(parsed()[0].image_.scale_).toBe(32);
                    done();
                }).catch(done);
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
                                outlineWidth: 2,
                                outlineDasharray: [10, 10]
                            }
                        ]
                    }
                ]
            };
            parser.writeStyle(style)
                .then(stylePromise => stylePromise())
                .then((parsed) => {
                    const olStyle = parsed();
                    const fill = olStyle[0].getFill();
                    expect(fill.getColor()).toBe('rgba(255, 0, 0, 0.5)');
                    const stroke = olStyle[0].getStroke();
                    expect(stroke.getColor()).toBe('rgba(0, 255, 0, 0.25)');
                    expect(stroke.getWidth()).toBe(2);
                    expect(stroke.getLineDash()).toEqual([10, 10]);
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
                .then(stylePromise => stylePromise())
                .then((parsed) => {
                    const olStyle = parsed();
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
                .then(stylePromise => stylePromise())
                .then((parsed) => {
                    const olStyle = parsed();
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
                .then(stylePromise => stylePromise())
                .then((parsed) => {
                    const olStyle = parsed();
                    const image = olStyle[0].getImage();
                    expect(image.getSrc()).toBeTruthy();
                    expect(image.getScale()).toBe(1);
                    expect(Math.round(image.getRotation() * 180 / Math.PI)).toBe(90);
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
                                rotate: 90,
                                anchor: 'top-left'
                            }
                        ]
                    }
                ]
            };

            parser.writeStyle(style)
                .then(stylePromise => stylePromise())
                .then((parsed) => {
                    const olStyle = parsed();
                    const image = olStyle[0].getImage();
                    expect(image.getSrc()).toBe('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=');
                    expect(image.getOpacity()).toBe(0.5);
                    expect(image.getScale()).toBe(32);
                    expect(image.anchor_).toEqual([0, 0]);
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
                                rotate: 90,
                                anchor: 'top-left'
                            }
                        ]
                    }
                ]
            };

            parser.writeStyle(style)
                .then(stylePromise => stylePromise())
                .then((parsed) => {
                    const olStyle = parsed({ getProperties: () => ({ text: 'Hello' }) });
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
                    expect(text.getTextBaseline()).toBe('top');
                    expect(text.getTextAlign()).toBe('left');
                    done();
                })
                .catch(done);
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
                                outlineDasharray: [10, 10]
                            }
                        ]
                    }
                ]
            };
            parser.writeStyle(style)
                .then(stylePromise => stylePromise())
                .then((parsed) => {
                    const olStyle = parsed();
                    const fill = olStyle[0].getFill();
                    expect(fill.getColor()).toBe('rgba(255, 0, 0, 0.5)');
                    const stroke = olStyle[0].getStroke();
                    expect(stroke.getColor()).toBe('rgba(0, 255, 0, 0.25)');
                    expect(stroke.getWidth()).toBe(2);
                    expect(stroke.getLineDash()).toEqual([10, 10]);
                    expect(olStyle[0].getGeometry()).toBeTruthy();
                    done();
                })
                .catch(done);
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
                .then((parsed) => {
                    const olStyle = parsed({ getProperties: () => ({
                        color: '#ff0000',
                        opacity: 0.5,
                        size: 2
                    }) });
                    const fill = olStyle[0].getFill();
                    expect(fill.getColor()).toBe('rgba(255, 0, 0, 0.5)');
                    const stroke = olStyle[0].getStroke();
                    expect(stroke.getColor()).toBe('rgba(0, 255, 0, 0.25)');
                    expect(stroke.getWidth()).toBe(2);
                    done();
                }).catch(done);
        });
    });
    // this function uses canvas and cache to speed up rendering
    describe('createGetImagesSrc', () => {
        it('should create a function that returns an image src', () => {

            const image = document.createElement('canvas');
            // add data to the canvas
            image.width = 10;
            image.height = 10;
            const ctx = image.getContext('2d');
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(0, 0, 10, 10);

            const getImageSrc = createGetImagesSrc([image]);
            const src = getImageSrc(image, 'imageID');
            expect(src).toBe(image.toDataURL()); // check returns the same src
            expect(getImageSrc(image, 'imageID')).toBe(src); // check cache
            const image2 = document.createElement('canvas');
            // add data to the canvas
            image2.width = 10;
            image2.height = 10;
            const ctx2 = image2.getContext('2d');
            ctx2.fillStyle = '#00ff00';
            ctx2.fillRect(0, 0, 10, 10);
            expect(getImageSrc(image2, 'imageID2')).toBe(image2.toDataURL()); // check different id
            expect(getImageSrc(image2, 'imageID2')).toNotBe(src); // check different id
        });
    });

});
