/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var {
    CHANGE_VERSION,
    changeVersion,
    loadVersion
} = require('../version');

describe('Test correctness of the version actions', () => {

    it('change version', () => {
        const action = changeVersion('version');
        expect(action.type).toBe(CHANGE_VERSION);
        expect(action.version).toBe('version');
    });

    it('load version', (done) => {
        loadVersion('base/web/client/test-resources/testVersion.txt')((a) => {
            try {
                expect(a).toExist();
                expect(a.type).toBe(CHANGE_VERSION);
                expect(a.version.indexOf('myVersion')).toBe(0);
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
});
