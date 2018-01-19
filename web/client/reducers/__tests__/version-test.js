/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var version = require('../version');


describe('Test the version reducer', () => {
    it('changes the current version', () => {
        var state = version({}, {type: 'CHANGE_VERSION', version: 'myVersion'});
        expect(state.current).toBe('myVersion');
    });

    it('test error version load', () => {
        var state = version({}, {type: 'LOAD_VERSION_ERROR', error: 'error'});
        expect(state.current).toBe('no-version');
    });
});
