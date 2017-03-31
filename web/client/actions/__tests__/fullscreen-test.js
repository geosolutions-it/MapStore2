/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {
    TOGGLE_FULLSCREEN,
    toggleFullscreen
} = require('../fullscreen');

describe('Test correctness of the fullscreen actions', () => {
    it('toggleFullscreen', () => {
        const testControl = 'test';
        var retval = toggleFullscreen(true, testControl);

        expect(retval).toExist();
        expect(retval.type).toBe(TOGGLE_FULLSCREEN);
        expect(retval.enable).toBe(true);
        expect(retval.elementSelector).toBe(testControl);
    });
});
