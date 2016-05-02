/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var {TOGGLE_FULLSCREEN, toggleFullScreen} = require('../fullScreen');

describe('Test correctness of the fullScreen actions', () => {

    it('test fullscreen true', () => {
        const testVal = true;
        const retval = toggleFullScreen(testVal);
        expect(retval.type).toBe(TOGGLE_FULLSCREEN);
        expect(retval.state).toExist();
        expect(retval.state).toBe(testVal);
    });

    it('test fullscreen false', () => {
        const testVal = false;
        const retval = toggleFullScreen(testVal);
        expect(retval.type).toBe(TOGGLE_FULLSCREEN);
        expect(retval.state).toExist();
        expect(retval.state).toBe(testVal);
    });
});
