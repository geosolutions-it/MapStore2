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
});
