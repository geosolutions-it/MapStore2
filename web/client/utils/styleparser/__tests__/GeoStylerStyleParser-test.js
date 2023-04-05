/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import GeoStylerStyleParser from '../GeoStylerStyleParser';

const parser = new GeoStylerStyleParser();

describe('GeoStylerStyleParser', () => {
    describe('readStyle', () => {
        it('should return same style', (done) => {
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
                                fillOpacity: 1
                            }
                        ]
                    }
                ]
            };
            parser.readStyle(style)
                .then((parsed) => {
                    try {
                        expect(parsed).toEqual(style);
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });
    });
    describe('writeStyle', () => {
        it('should return same style', (done) => {
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
                                fillOpacity: 1
                            }
                        ]
                    }
                ]
            };
            parser.writeStyle(style)
                .then((parsed) => {
                    try {
                        expect(parsed).toEqual(style);
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });
    });
});
