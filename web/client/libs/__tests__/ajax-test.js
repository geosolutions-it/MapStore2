/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var axios = require('../ajax');

describe('Tests ajax library', () => {
    it('uses proxy for requests not on the same origin', (done) => {
        axios.get('http://fakeexternaldomain.mapstore2').then(() => {
            done();
        }).catch(ex => {
            expect(ex.config).toExist();
            expect(ex.config.url).toExist();
            expect(ex.config.url).toContain('proxy/?url=');
            done();
        });
    });

    it('does not use proxy for requests on the same origin', (done) => {
        axios.get('base/web/client/test-resources/testConfig.json').then((response) => {
            expect(response.config).toExist();
            expect(response.config.url).toExist();
            expect(response.config.url).toBe('base/web/client/test-resources/testConfig.json');
            done();
        }).catch(ex => {
            done(ex);
        });
    });

    it('uses a custom proxy for requests on the same origin with varius query params', (done) => {
        axios.get('http://fakeexternaldomain.mapstore2', {
            proxyUrl: '/proxy/?url=',
            params: {
                param1: 'param1',
                param2: '',
                param3: undefined,
                param4: null,
                param5: [],
                param6: [1, 2, "3", ''],
                param7: {},
                param8: {
                    a: 'a'
                },
                param9: new Date()
            }})
            .then(() => {
                done();
            })
            .catch((ex) => {
                expect(ex.config).toExist();
                expect(ex.config.url).toExist();
                expect(ex.config.url).toContain('proxy/?url=');
                done();
            });
    });

    it('uses a custom proxy for requests on the same origin with string query param', (done) => {
        axios.get('http://fakeexternaldomain.mapstore2', {
                proxyUrl: '/proxy/?url=',
                params: "params"
            })
            .then(() => {
                done();
            })
            .catch((ex) => {
                expect(ex.config).toExist();
                expect(ex.config.url).toExist();
                expect(ex.config.url).toContain('proxy/?url=');
                done();
            });
    });

    it('does not use proxy for requests to CORS enabled urls', (done) => {
        axios.get('http://cors.mapstore2', {
            timeout: 500,
            proxyUrl: {
                url: '/proxy/?url=',
                useCORS: ['http://cors.mapstore2']
            }
        }).then(() => {
            done();
        }).catch((ex) => {
            expect(ex.config).toExist();
            expect(ex.config.url).toExist();
            expect(ex.config.url).toBe('http://cors.mapstore2');
            done();
        });
    });

    it('does use proxy for requests on not CORS enabled urls', (done) => {
        axios.get('http://notcors.mapstore2', {
            proxyUrl: {
                url: '/proxy/?url=',
                useCORS: ['http://cors.mapstore2']
            }
        }).then(() => {
            done();
        }).catch((ex) => {
            expect(ex.config).toExist();
            expect(ex.config.url).toExist();
            expect(ex.config.url).toContain('proxy/?url=');
            done();
        });
    });
});
