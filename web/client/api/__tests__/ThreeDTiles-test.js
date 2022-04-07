/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { getCapabilities } from '../ThreeDTiles';
import axios from '../../libs/ajax';
import expect from 'expect';
import MockAdapter from "axios-mock-adapter";
let mockAxios;

describe('Test ThreeDTiles API', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });
    it('should extract bbox from boundingVolume region', (done) => {
        mockAxios.onGet().reply(200, {
            "root": {
                "boundingVolume": {
                    "region": [
                        -1.3197004795898053,
                        0.6988582109,
                        -1.3196595204101946,
                        0.6988897891,
                        0,
                        20
                    ]
                }
            }
        });
        getCapabilities('/tileset.json').then(({ bbox }) => {
            try {
                expect(bbox).toBeTruthy();
                expect(bbox.crs).toBe('EPSG:4326');
                expect(Math.floor(bbox.bounds.minx)).toBe(-76);
                expect(Math.floor(bbox.bounds.miny)).toBe(40);
                expect(Math.ceil(bbox.bounds.maxx)).toBe(-75);
                expect(Math.ceil(bbox.bounds.maxy)).toBe(41);
            } catch (e) {
                done(e);
            }
            done();
        });
    });
    it('should extract bbox from boundingVolume sphere', (done) => {
        mockAxios.onGet().reply(200, {
            "root": {
                "boundingVolume": {
                    "sphere": [
                        0.2524109,
                        9.536743E-7,
                        4.5,
                        5
                    ]
                }
            }
        });
        getCapabilities('/tileset.json').then(({ bbox }) => {
            try {
                expect(bbox).toBeTruthy();
                expect(bbox.crs).toBe('EPSG:4326');
                expect(Math.floor(bbox.bounds.minx)).toBe(0);
                expect(Math.floor(bbox.bounds.miny)).toBe(86);
                expect(Math.ceil(bbox.bounds.maxx)).toBe(1);
                expect(Math.ceil(bbox.bounds.maxy)).toBe(87);
            } catch (e) {
                done(e);
            }
            done();
        });
    });
    it('should not extract bbox from boundingVolume sphere with center [0, 0, 0]', (done) => {
        mockAxios.onGet().reply(200, {
            "root": {
                "boundingVolume": {
                    "sphere": [
                        0,
                        0,
                        0,
                        5
                    ]
                }
            }
        });
        getCapabilities('/tileset.json').then(({ bbox }) => {
            try {
                expect(bbox).toBeFalsy();
            } catch (e) {
                done(e);
            }
            done();
        });
    });
    it('should extract bbox from boundingVolume sphere and transform', (done) => {
        mockAxios.onGet().reply(200, {
            "root": {
                "transform": [
                    0.968635634376879,
                    0.24848542777253735,
                    0,
                    0,
                    -0.15986460794399626,
                    0.6231776137472074,
                    0.7655670897127491,
                    0,
                    0.190232265775849,
                    -0.7415555636019701,
                    0.6433560687121489,
                    0,
                    1215012.8828876738,
                    -4736313.051199594,
                    4081605.22126042,
                    1
                ],
                "boundingVolume": {
                    "sphere": [
                        0,
                        0,
                        0,
                        5
                    ]
                }
            }
        });
        getCapabilities('/tileset.json').then(({ bbox }) => {
            try {
                expect(bbox).toBeTruthy();
                expect(bbox.crs).toBe('EPSG:4326');
                expect(Math.floor(bbox.bounds.minx)).toBe(-76);
                expect(Math.floor(bbox.bounds.miny)).toBe(40);
                expect(Math.ceil(bbox.bounds.maxx)).toBe(-75);
                expect(Math.ceil(bbox.bounds.maxy)).toBe(41);
            } catch (e) {
                done(e);
            }
            done();
        });
    });
    it('should extract bbox from boundingVolume box', (done) => {
        mockAxios.onGet().reply(200, {
            "root": {
                "boundingVolume": {
                    "box": [
                        0.2524109,
                        9.536743E-7,
                        4.5,
                        16.257824,
                        0.0,
                        0.0,
                        0.0,
                        -19.717258,
                        0.0,
                        0.0,
                        0.0,
                        4.5
                    ]
                }
            }
        });
        getCapabilities('/tileset.json').then(({ bbox }) => {
            try {
                expect(bbox).toBeTruthy();
                expect(bbox.crs).toBe('EPSG:4326');
                expect(Math.floor(bbox.bounds.minx)).toBe(-1);
                expect(Math.floor(bbox.bounds.miny)).toBe(86);
                expect(Math.ceil(bbox.bounds.maxx)).toBe(1);
                expect(Math.ceil(bbox.bounds.maxy)).toBe(87);
            } catch (e) {
                done(e);
            }
            done();
        });
    });
    it('should not extract bbox from boundingVolume box with center [0, 0, 0]', (done) => {
        mockAxios.onGet().reply(200, {
            "root": {
                "boundingVolume": {
                    "box": [
                        0,
                        0,
                        0,
                        7.0955,
                        0,
                        0,
                        0,
                        3.1405,
                        0,
                        0,
                        0,
                        5.0375
                    ]
                }
            }
        });
        getCapabilities('/tileset.json').then(({ bbox }) => {
            try {
                expect(bbox).toBeFalsy();
            } catch (e) {
                done(e);
            }
            done();
        });
    });
    it('should extract bbox from boundingVolume box and transform', (done) => {
        mockAxios.onGet().reply(200, {
            "root": {
                "transform": [
                    96.86356343768793,
                    24.848542777253734,
                    0,
                    0,
                    -15.986465724980844,
                    62.317780594908875,
                    76.5566922962899,
                    0,
                    19.02322243409411,
                    -74.15554020821229,
                    64.3356267137516,
                    0,
                    1215107.7612304366,
                    -4736682.902037748,
                    4081926.095098698,
                    1
                ],
                "boundingVolume": {
                    "box": [
                        0,
                        0,
                        0,
                        7.0955,
                        0,
                        0,
                        0,
                        3.1405,
                        0,
                        0,
                        0,
                        5.0375
                    ]
                }
            }
        });
        getCapabilities('/tileset.json').then(({ bbox }) => {
            try {
                expect(bbox).toBeTruthy();
                expect(bbox.crs).toBe('EPSG:4326');
                expect(Math.floor(bbox.bounds.minx)).toBe(-76);
                expect(Math.floor(bbox.bounds.miny)).toBe(40);
                expect(Math.ceil(bbox.bounds.maxx)).toBe(-75);
                expect(Math.ceil(bbox.bounds.maxy)).toBe(41);
            } catch (e) {
                done(e);
            }
            done();
        });
    });
    it('should extract format from content uri', (done) => {
        mockAxios.onGet().reply(200, {
            "root": {
                "content": {
                    "uri": "model.b3dm"
                }
            }
        });
        getCapabilities('/tileset.json').then(({ format }) => {
            try {
                expect(format).toBe('b3dm');
            } catch (e) {
                done(e);
            }
            done();
        });
    });
});
