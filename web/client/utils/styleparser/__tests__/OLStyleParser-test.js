/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import OLStyleParser from '../OLStyleParser';
import { getImageIdFromSymbolizer } from '../../VectorStyleUtils';

const parser = new OLStyleParser({
    getImageIdFromSymbolizer,
    drawIcons: () => Promise.resolve([
        { id: 'path/to/image', image: new Image(), width: 256, height: 256 }
    ])
});

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
                        expect(parsed.fill_.color_).toBe('rgba(255, 0, 0, 0.5)');
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
                                image: 'path/to/image',
                                size: 32
                            }
                        ]
                    }
                ]
            };
            parser.writeStyle(style)
                .then((parsed) => {
                    try {
                        expect(parsed.image_.scale_).toBe(32 / 256);
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });
    });
});
