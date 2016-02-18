/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
var fullScreen = require('../fullScreen');


describe('Test the locale reducer', () => {
    it('Change MousePosition State', () => {
        let testAction = {
            type: 'CHANGE_MOUSE_POSITION_STATE',
            fullscreen: true
        };
        let state = fullScreen( {}, testAction);
        expect(state.fullscreen).toExist();
        expect(state.fullscreen).toBe(false);
    });

});
