/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
    classificationVector,
    classificationRaster,
    updateStyleService,
    clearCache
} from '../StyleEditor';
import axios from '../../libs/ajax';
import expect from 'expect';
import MockAdapter from "axios-mock-adapter";

let mockAxios;

import CLASSIFY_VECTOR_RESPONSE from './classifyVectorResponse.json';
import CLASSIFY_RASTER_RESPONSE from './classifyRaterResponse.json';

describe('StyleEditor API', () => {
    const DEFAULT_CONFIG = { intervalsForUnique: 10 };
    describe('classificationVector', () => {
        beforeEach(done => {
            mockAxios = new MockAdapter(axios);
            setTimeout(done);
        });
        afterEach(done => {
            mockAxios.restore();
            setTimeout(done);
        });
        it('should send a classification request', (done) => {

            mockAxios.onGet().reply(200, CLASSIFY_VECTOR_RESPONSE.SAMPLE1);

            const values = {
                attribute: 'ATTRIBUTE'
            };
            const properties = {
                ruleId: 'rule0',
                intervals: 5,
                method: 'equalInterval',
                reverse: false,
                ramp: 'spectral',
                type: 'classificationVector',
                ...DEFAULT_CONFIG
            };
            const rules = [
                {
                    color: '#dddddd',
                    fillOpacity: 1,
                    kind: 'Classification',
                    outlineColor: '#777777',
                    outlineWidth: 1,
                    symbolizerKind: 'Fill',
                    ...properties
                }
            ];
            const layer = {
                url: '/geoserver/wms'
            };
            classificationVector({
                values,
                properties,
                rules,
                layer
            }).then((newRules) => {
                try {
                    expect(newRules[0].classification).toEqual(
                        [
                            {
                                title: ' >= 168839.0 AND <2211312.4',
                                color: '#9e0142',
                                type: 'Polygon',
                                min: 168839,
                                max: 2211312.4
                            },
                            {
                                title: ' >= 2211312.4 AND <4253785.8',
                                color: '#f98e52',
                                type: 'Polygon',
                                min: 2211312.4,
                                max: 4253785.8
                            },
                            {
                                title: ' >= 4253785.8 AND <6296259.2',
                                color: '#ffffbf',
                                type: 'Polygon',
                                min: 4253785.8,
                                max: 6296259.2
                            },
                            {
                                title: ' >= 6296259.2 AND <8338732.6',
                                color: '#89d0a5',
                                type: 'Polygon',
                                min: 6296259.2,
                                max: 8338732.6
                            },
                            {
                                title: ' >= 8338732.6 AND <=1.0381206E7',
                                color: '#5e4fa2',
                                type: 'Polygon',
                                min: 8338732.6,
                                max: 10381206
                            }
                        ]
                    );
                } catch (e) {
                    done(e);
                }
                done();
            });
        });
        it('should update the rule and return errorId if service is not available', (done) => {

            mockAxios.onGet().reply(404);

            const values = {
                attribute: 'NEW_ATTRIBUTE'
            };
            const properties = {
                ruleId: 'rule0',
                intervals: 5,
                method: 'equalInterval',
                reverse: false,
                ramp: 'spectral',
                attribute: 'ATTRIBUTE',
                type: 'classificationVector',
                ...DEFAULT_CONFIG
            };
            const rules = [
                {
                    color: '#dddddd',
                    fillOpacity: 1,
                    kind: 'Classification',
                    outlineColor: '#777777',
                    outlineWidth: 1,
                    symbolizerKind: 'Fill',
                    ...properties
                }
            ];
            const layer = {
                url: '/geoserver/wms'
            };
            classificationVector({
                values,
                properties,
                rules,
                layer
            }).then((newRules) => {
                try {
                    expect(newRules[0].attribute).toBe('NEW_ATTRIBUTE');
                    expect(newRules[0].errorId).toBe('styleeditor.classificationError');
                } catch (e) {
                    done(e);
                }
                done();
            });
        });
        it('should avoid request if parameters does not change', (done) => {

            const values = {
                color: '#FF0000'
            };
            const properties = {
                ruleId: 'rule0',
                intervals: 5,
                method: 'equalInterval',
                reverse: false,
                ramp: 'spectral',
                attribute: 'ATTRIBUTE',
                type: 'classificationVector'
            };
            const rules = [
                {
                    color: '#dddddd',
                    fillOpacity: 1,
                    kind: 'Classification',
                    outlineColor: '#777777',
                    outlineWidth: 1,
                    symbolizerKind: 'Fill',
                    ...properties
                }
            ];
            const layer = {
                url: '/geoserver/wms'
            };
            classificationVector({
                values,
                properties,
                rules,
                layer
            }).then((newRules) => {
                try {
                    expect(newRules[0].color).toBe('#FF0000');
                } catch (e) {
                    done(e);
                }
                done();
            });
        });
        it('should avoid request when method is customInterval', (done) => {
            const values = {
                attribute: 'NEW_ATTRIBUTE'
            };
            const properties = {
                ruleId: 'rule0',
                intervals: 5,
                method: 'customInterval',
                reverse: false,
                ramp: 'spectral',
                attribute: 'ATTRIBUTE',
                type: 'classificationVector'
            };
            const rules = [
                {
                    color: '#dddddd',
                    fillOpacity: 1,
                    kind: 'Classification',
                    outlineColor: '#777777',
                    outlineWidth: 1,
                    symbolizerKind: 'Fill',
                    ...properties
                }
            ];
            const layer = {
                url: '/geoserver/wms'
            };
            classificationVector({
                values,
                properties,
                rules,
                layer
            }).then((newRules) => {
                try {
                    expect(newRules[0].attribute).toBe('NEW_ATTRIBUTE');
                } catch (e) {
                    done(e);
                }
                done();
            });
        });
        it('should avoid request when new values contain custom ramp', (done) => {
            const values = {
                ramp: 'custom',
                classification: [
                    {
                        title: ' >= 168839.0 AND <2211312.4',
                        color: '#FF0000',
                        type: 'Polygon',
                        min: 168839,
                        max: 2211312.4
                    },
                    {
                        title: ' >= 2211312.4 AND <4253785.8',
                        color: '#F98E52',
                        type: 'Polygon',
                        min: 2211312.4,
                        max: 4253785.8
                    }
                ]
            };
            const properties = {
                ruleId: 'rule0',
                intervals: 2,
                method: 'equalInterval',
                reverse: false,
                ramp: 'spectral',
                attribute: 'ATTRIBUTE',
                type: 'classificationVector',
                classification: [
                    {
                        title: ' >= 168839.0 AND <2211312.4',
                        color: '#9E0142',
                        type: 'Polygon',
                        min: 168839,
                        max: 2211312.4
                    },
                    {
                        title: ' >= 2211312.4 AND <4253785.8',
                        color: '#F98E52',
                        type: 'Polygon',
                        min: 2211312.4,
                        max: 4253785.8
                    }
                ]
            };
            const rules = [
                {
                    color: '#dddddd',
                    fillOpacity: 1,
                    kind: 'Classification',
                    outlineColor: '#777777',
                    outlineWidth: 1,
                    symbolizerKind: 'Fill',
                    ...properties
                }
            ];
            const layer = {
                url: '/geoserver/wms'
            };
            classificationVector({
                values,
                properties,
                rules,
                layer
            }).then((newRules) => {
                try {
                    expect(newRules[0].ramp).toBe('custom');
                    expect(newRules[0].classification[0].color).toBe('#FF0000');
                } catch (e) {
                    done(e);
                }
                done();
            });
        });
        it('should avoid request while changing ramp with method set to customInterval', (done) => {
            const values = {
                ramp: 'greys'
            };
            const properties = {
                ruleId: 'rule0',
                intervals: 2,
                method: 'customInterval',
                reverse: false,
                ramp: 'spectral',
                attribute: 'ATTRIBUTE',
                type: 'classificationVector',
                classification: [
                    {
                        title: ' >= 168839.0 AND <2211312.4',
                        color: '#9E0142',
                        type: 'Polygon',
                        min: 168839,
                        max: 2211312.4
                    },
                    {
                        title: ' >= 2211312.4 AND <4253785.8',
                        color: '#F98E52',
                        type: 'Polygon',
                        min: 2211312.4,
                        max: 4253785.8
                    }
                ]
            };
            const rules = [
                {
                    color: '#dddddd',
                    fillOpacity: 1,
                    kind: 'Classification',
                    outlineColor: '#777777',
                    outlineWidth: 1,
                    symbolizerKind: 'Fill',
                    ...properties
                }
            ];
            const layer = {
                url: '/geoserver/wms'
            };
            classificationVector({
                values,
                properties,
                rules,
                layer
            }).then((newRules) => {
                try {
                    expect(newRules[0].ramp).toBe('greys');
                    expect(newRules[0].classification[0].color).toBe('#ffffff');
                    expect(newRules[0].classification[1].color).toBe('#000000');
                } catch (e) {
                    done(e);
                }
                done();
            });
        });
        it('should send a classification request for unique Interval', (done) => {

            mockAxios.onGet().reply(200, CLASSIFY_VECTOR_RESPONSE.SAMPLE2);

            const values = {
                attribute: 'ATTRIBUTE'
            };
            const properties = {
                ruleId: 'rule0',
                intervals: 5,
                method: 'uniqueInterval',
                reverse: false,
                ramp: 'spectral',
                type: 'classificationVector',
                ...DEFAULT_CONFIG
            };
            const rules = [
                {
                    color: '#dddddd',
                    fillOpacity: 1,
                    kind: 'Classification',
                    outlineColor: '#777777',
                    outlineWidth: 1,
                    symbolizerKind: 'Fill',
                    ...properties
                }
            ];
            const layer = {
                url: '/geoserver/wms'
            };
            classificationVector({
                values,
                properties,
                rules,
                layer
            }).then((newRules) => {
                try {
                    expect(newRules[0].classification).toEqual(
                        [
                            {
                                title: 168839.0,
                                color: '#9e0142',
                                type: 'Polygon',
                                unique: 168839
                            },
                            {
                                title: 2211312.4,
                                color: '#f98e52',
                                type: 'Polygon',
                                unique: 2211312.4
                            },
                            {
                                title: 4253785.8,
                                color: '#ffffbf',
                                type: 'Polygon',
                                unique: 4253785.8
                            },
                            {
                                title: 6296259.2,
                                color: '#89d0a5',
                                type: 'Polygon',
                                unique: 6296259.2
                            },
                            {
                                title: 8338732.6,
                                color: '#5e4fa2',
                                type: 'Polygon',
                                unique: 8338732.6
                            }
                        ]
                    );
                } catch (e) {
                    done(e);
                }
                done();
            });
        });
        it('should update the rule and return errorId if service is not available for unique Interval', (done) => {
            mockAxios.onGet().reply(400, {});
            const values = {
                attribute: 'NEW_ATTRIBUTE'
            };
            const param = { intervalsForUnique: 4 };
            const properties = {
                ruleId: 'rule0',
                intervals: 5,
                method: 'uniqueInterval',
                reverse: false,
                ramp: 'spectral',
                attribute: 'ATTRIBUTE',
                type: 'classificationVector',
                classification: [1, 2, 3, 4, 5],
                ...param
            };
            const rules = [
                {
                    color: '#dddddd',
                    fillOpacity: 1,
                    kind: 'Classification',
                    outlineColor: '#777777',
                    outlineWidth: 1,
                    symbolizerKind: 'Fill',
                    ...properties
                }
            ];
            const layer = {
                url: '/geoserver/wms'
            };
            classificationVector({
                values,
                properties,
                rules,
                layer
            }).then((newRules) => {
                try {
                    expect(newRules[0].attribute).toBe('NEW_ATTRIBUTE');
                    expect(newRules[0].errorId).toBe('styleeditor.classificationUniqueIntervalError');
                    expect(newRules[0].msgParams).toEqual(param);
                } catch (e) {
                    done(e);
                }
                done();
            });
        });
        it('should send a classification request and generate color when params contains custom ramp', (done) => {

            mockAxios.onGet().reply(200, CLASSIFY_VECTOR_RESPONSE.SAMPLE1);

            const values = {
                attribute: 'ATTRIBUTE'
            };
            const properties = {
                ruleId: 'rule0',
                intervals: 5,
                method: 'equalInterval',
                reverse: false,
                ramp: 'custom',
                type: 'classificationVector',
                classification: [
                    {
                        title: ' >= 168839.0 AND <2211312.4',
                        color: '#9E0142',
                        type: 'Polygon',
                        min: 168839,
                        max: 2211312.4
                    },
                    {
                        title: ' >= 2211312.4 AND <4253785.8',
                        color: '#F98E52',
                        type: 'Polygon',
                        min: 2211312.4,
                        max: 4253785.8
                    }
                ],
                ...DEFAULT_CONFIG
            };
            const rules = [
                {
                    color: '#dddddd',
                    fillOpacity: 1,
                    kind: 'Classification',
                    outlineColor: '#777777',
                    outlineWidth: 1,
                    symbolizerKind: 'Fill',
                    ...properties
                }
            ];
            const layer = {
                url: '/geoserver/wms'
            };
            classificationVector({
                values,
                properties,
                rules,
                layer
            }).then((newRules) => {
                try {
                    expect(newRules[0].classification).toEqual(
                        [
                            {
                                title: ' >= 168839.0 AND <2211312.4',
                                color: '#9e0142',
                                type: 'Polygon',
                                min: 168839,
                                max: 2211312.4
                            },
                            {
                                title: ' >= 2211312.4 AND <4253785.8',
                                color: '#b52446',
                                type: 'Polygon',
                                min: 2211312.4,
                                max: 4253785.8
                            },
                            {
                                title: ' >= 4253785.8 AND <6296259.2',
                                color: '#cc484a',
                                type: 'Polygon',
                                min: 4253785.8,
                                max: 6296259.2
                            },
                            {
                                title: ' >= 6296259.2 AND <8338732.6',
                                color: '#e26b4e',
                                type: 'Polygon',
                                min: 6296259.2,
                                max: 8338732.6
                            },
                            {
                                title: ' >= 8338732.6 AND <=1.0381206E7',
                                color: '#f98e52',
                                type: 'Polygon',
                                min: 8338732.6,
                                max: 10381206
                            }
                        ]
                    );
                } catch (e) {
                    done(e);
                }
                done();
            });
        });
    });
    describe('classificationRaster', () => {
        beforeEach(done => {
            mockAxios = new MockAdapter(axios);
            setTimeout(done);
        });

        afterEach(done => {
            mockAxios.restore();
            setTimeout(done);
        });
        it('should send a classification request', (done) => {
            mockAxios.onGet().reply(200, CLASSIFY_RASTER_RESPONSE);
            const values = {
                ramp: 'spectral'
            };
            const properties = {
                ruleId: 'rule0',
                intervals: 5,
                method: 'equalInterval',
                reverse: false,
                continuous: true,
                type: 'classificationRaster',
                ...DEFAULT_CONFIG
            };
            const rules = [
                {
                    kind: 'Raster',
                    opacity: 1,
                    symbolizerKind: 'Raster',
                    ...properties
                }
            ];
            const layer = {
                url: '/geoserver/wms'
            };
            classificationRaster({
                values,
                properties,
                rules,
                layer
            }).then((newRules) => {
                try {
                    expect(newRules[0].classification).toEqual(
                        [
                            {
                                color: '#9e0142',
                                opacity: 1,
                                label: '0',
                                quantity: 0
                            },
                            {
                                color: '#f98e52',
                                opacity: 1,
                                label: '1789.75',
                                quantity: 1789.75
                            },
                            {
                                color: '#ffffbf',
                                opacity: 1,
                                label: '3579.5',
                                quantity: 3579.5
                            },
                            {
                                color: '#89d0a5',
                                opacity: 1,
                                label: '5369.25',
                                quantity: 5369.25
                            },
                            {
                                color: '#5e4fa2',
                                opacity: 1,
                                label: '7159',
                                quantity: 7159
                            }
                        ]
                    );
                } catch (e) {
                    done(e);
                }
                done();
            });
        });
        it('should update the rule and return errorId if service is not available', (done) => {
            mockAxios.onGet().reply(404);
            const values = {
                ramp: 'greys'
            };
            const properties = {
                ruleId: 'rule0',
                intervals: 5,
                method: 'equalInterval',
                reverse: false,
                continuous: true,
                ramp: 'spectral',
                type: 'classificationRaster',
                ...DEFAULT_CONFIG
            };
            const rules = [
                {
                    kind: 'Raster',
                    opacity: 1,
                    symbolizerKind: 'Raster',
                    ...properties
                }
            ];
            const layer = {
                url: '/geoserver/wms'
            };
            classificationRaster({
                values,
                properties,
                rules,
                layer
            }).then((newRules) => {
                try {
                    expect(newRules[0].errorId).toBe('styleeditor.classificationRasterError');
                    expect(newRules[0].ramp).toBe('greys');
                } catch (e) {
                    done(e);
                }
                done();
            });
        });
        it('should update the rule and return errorId if classification is not supported for raster of float type', (done) => {
            mockAxios.onGet().reply(404, 'Cannot perform unique value classification over raster of float type');
            const values = {
                ramp: 'greys'
            };
            const properties = {
                ruleId: 'rule0',
                intervals: 5,
                method: 'uniqueInterval',
                reverse: false,
                continuous: true,
                ramp: 'spectral',
                type: 'classificationRaster',
                ...DEFAULT_CONFIG
            };
            const rules = [
                {
                    kind: 'Raster',
                    opacity: 1,
                    symbolizerKind: 'Raster',
                    ...properties
                }
            ];
            const layer = {
                url: '/geoserver/wms'
            };
            classificationRaster({
                values,
                properties,
                rules,
                layer
            }).then((newRules) => {
                try {
                    expect(newRules[0].errorId).toBe('styleeditor.classificationRasterUniqueIntervalError');
                    expect(newRules[0].ramp).toBe('greys');
                } catch (e) {
                    done(e);
                }
                done();
            });
        });
        it('should update the rule and return errorId if requested intervals for unique classification is less ', (done) => {
            mockAxios.onGet().reply(404, 'Error');
            const values = {
                ramp: 'greys'
            };
            const properties = {
                ruleId: 'rule0',
                intervals: 5,
                method: 'uniqueInterval',
                reverse: false,
                continuous: true,
                ramp: 'spectral',
                type: 'classificationRaster',
                ...DEFAULT_CONFIG
            };
            const rules = [
                {
                    kind: 'Raster',
                    opacity: 1,
                    symbolizerKind: 'Raster',
                    ...properties
                }
            ];
            const layer = {
                url: '/geoserver/wms'
            };
            classificationRaster({
                values,
                properties,
                rules,
                layer
            }).then((newRules) => {
                try {
                    expect(newRules[0].errorId).toBe('styleeditor.classificationUniqueIntervalError');
                    expect(newRules[0].ramp).toBe('greys');
                } catch (e) {
                    done(e);
                }
                done();
            });
        });
        it('should avoid request if parameters does not change', (done) => {
            const values = {
                opacity: 0.5
            };
            const properties = {
                ruleId: 'rule0',
                intervals: 5,
                method: 'equalInterval',
                reverse: false,
                continuous: true,
                ramp: 'spectral',
                type: 'classificationRaster'
            };
            const rules = [
                {
                    kind: 'Raster',
                    opacity: 1,
                    symbolizerKind: 'Raster',
                    ...properties
                }
            ];
            const layer = {
                url: '/geoserver/wms'
            };
            classificationRaster({
                values,
                properties,
                rules,
                layer
            }).then((newRules) => {
                try {
                    expect(newRules[0].opacity).toBe(0.5);
                } catch (e) {
                    done(e);
                }
                done();
            });
        });
        it('should avoid request when method is customInterval', (done) => {
            const values = {
                contrastEnhancement: { enhancementType: "normalize" }
            };
            const properties = {
                ruleId: 'rule0',
                intervals: 5,
                method: 'customInterval',
                reverse: false,
                ramp: 'spectral',
                continuous: true,
                type: 'classificationRaster'
            };
            const rules = [
                {
                    color: '#dddddd',
                    fillOpacity: 1,
                    kind: 'Classification',
                    outlineColor: '#777777',
                    outlineWidth: 1,
                    symbolizerKind: 'Fill',
                    ...properties
                }
            ];
            const layer = {
                url: '/geoserver/wms'
            };
            classificationRaster({
                values,
                properties,
                rules,
                layer
            }).then((newRules) => {
                try {
                    expect(newRules[0].contrastEnhancement).toEqual({ enhancementType: "normalize" });
                } catch (e) {
                    done(e);
                }
                done();
            });
        });
        it('should avoid request when new values contain custom ramp', (done) => {
            const values = {
                ramp: 'custom',
                classification: [
                    {
                        color: '#9e0142',
                        opacity: 1,
                        label: '0',
                        quantity: 0
                    },
                    {
                        color: '#f98e52',
                        opacity: 1,
                        label: '1789.75',
                        quantity: 1789.75
                    }
                ]
            };
            const properties = {
                ruleId: 'rule0',
                intervals: 2,
                method: 'equalInterval',
                reverse: false,
                ramp: 'spectral',
                type: 'classificationRaster',
                classification: [
                    {
                        color: '#9e0142',
                        opacity: 1,
                        label: '0',
                        quantity: 0
                    },
                    {
                        color: '#f98e52',
                        opacity: 1,
                        label: '1789.75',
                        quantity: 1789.75
                    }
                ]
            };
            const rules = [
                {
                    color: '#dddddd',
                    kind: 'Raster',
                    symbolizerKind: 'Raster',
                    ...properties
                }
            ];
            const layer = {
                url: '/geoserver/wms'
            };
            classificationRaster({
                values,
                properties,
                rules,
                layer
            }).then((newRules) => {
                try {
                    expect(newRules[0].ramp).toBe('custom');
                    expect(newRules[0].classification[0].color).toBe('#9e0142');
                } catch (e) {
                    done(e);
                }
                done();
            });
        });
        it('should avoid request while changing ramp with method set to customInterval', (done) => {
            const values = {
                ramp: 'greys'
            };
            const properties = {
                ruleId: 'rule0',
                intervals: 2,
                method: 'customInterval',
                reverse: false,
                ramp: 'spectral',
                continuous: true,
                type: 'classificationRaster',
                classification: [
                    {
                        color: '#9e0142',
                        opacity: 1,
                        label: '0',
                        quantity: 0
                    },
                    {
                        color: '#f98e52',
                        opacity: 1,
                        label: '1789.75',
                        quantity: 1789.75
                    }
                ]
            };
            const rules = [
                {
                    color: '#dddddd',
                    kind: 'Raster',
                    symbolizerKind: 'Raster',
                    ...properties
                }
            ];
            const layer = {
                url: '/geoserver/wms'
            };
            classificationRaster({
                values,
                properties,
                rules,
                layer
            }).then((newRules) => {
                try {
                    expect(newRules[0].ramp).toBe('greys');
                    expect(newRules[0].classification[0].color).toBe('#ffffff');
                    expect(newRules[0].classification[1].color).toBe('#000000');
                } catch (e) {
                    done(e);
                }
                done();
            });
        });
        it('should send a classification request for unique Interval', (done) => {

            mockAxios.onGet().reply(200, CLASSIFY_RASTER_RESPONSE);

            const values = {
                intervals: 6
            };
            const properties = {
                ruleId: 'rule0',
                intervals: 5,
                method: 'uniqueInterval',
                continuous: true,
                reverse: false,
                ramp: 'spectral',
                type: 'classificationRaster',
                ...DEFAULT_CONFIG
            };
            const rules = [
                {
                    kind: 'Raster',
                    symbolizerKind: 'Raster',
                    ...properties
                }
            ];
            const layer = {
                url: '/geoserver/wms'
            };
            classificationRaster({
                values,
                properties,
                rules,
                layer
            }).then((newRules) => {
                try {
                    expect(newRules[0].classification).toEqual(
                        [
                            {
                                color: '#9e0142',
                                opacity: 1,
                                label: '0',
                                quantity: 0
                            },
                            {
                                color: '#f98e52',
                                opacity: 1,
                                label: '1789.75',
                                quantity: 1789.75
                            },
                            {
                                color: '#ffffbf',
                                opacity: 1,
                                label: '3579.5',
                                quantity: 3579.5
                            },
                            {
                                color: '#89d0a5',
                                opacity: 1,
                                label: '5369.25',
                                quantity: 5369.25
                            },
                            {
                                color: '#5e4fa2',
                                opacity: 1,
                                label: '7159',
                                quantity: 7159
                            }
                        ]
                    );
                } catch (e) {
                    done(e);
                }
                done();
            });
        });
    });
    describe('updateStyleService', () => {
        beforeEach(done => {
            mockAxios = new MockAdapter(axios);
            setTimeout(done);
        });

        afterEach(done => {
            clearCache();
            mockAxios.restore();
            setTimeout(done);
        });
        it('should update static services with request to classification endpoint', (done) => {
            mockAxios.onGet(/sldservice/).reply(200, {
                capabilities: {
                    vector: {
                        classifications: [
                            'quantile',
                            'jenks',
                            'equalArea',
                            'equalInterval',
                            'uniqueInterval',
                            'standardDeviation'
                        ]
                    },
                    raster: {
                        classifications: [
                            'quantile',
                            'jenks',
                            'equalArea',
                            'equalInterval',
                            'uniqueInterval'
                        ]
                    }
                }
            });
            const styleService = {
                baseUrl: 'http://localhost:8080/geoserver/',
                version: '2.18-SNAPSHOT',
                formats: [ 'css', 'sld' ],
                availableUrls: [],
                fonts: ['Arial'],
                iStatic: true
            };
            updateStyleService({ styleService })
                .then((updatedStyleService) => {
                    try {
                        expect(updatedStyleService.classificationMethods.vector)
                            .toEqual([ 'quantile', 'jenks', 'equalInterval', 'uniqueInterval', 'standardDeviation' ]);
                        expect(updatedStyleService.classificationMethods.raster)
                            .toEqual([ 'quantile', 'jenks', 'equalInterval', 'uniqueInterval' ]);
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });
        it('should use default classification methods if sldservice request fails', (done) => {
            mockAxios.onGet(/sldservice/).reply(404);
            const styleService = {
                baseUrl: 'http://localhost:8080/geoserver/',
                version: '2.18-SNAPSHOT',
                formats: [ 'css', 'sld' ],
                availableUrls: [],
                fonts: ['Arial'],
                iStatic: true
            };
            updateStyleService({ styleService })
                .then((updatedStyleService) => {
                    try {
                        expect(updatedStyleService.classificationMethods.vector)
                            .toEqual([ 'equalInterval', 'quantile', 'jenks' ]);
                        expect(updatedStyleService.classificationMethods.raster)
                            .toEqual([ 'equalInterval', 'quantile', 'jenks' ]);
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });
    });
});
