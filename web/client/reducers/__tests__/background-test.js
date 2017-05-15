/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const background = require('../background');
const {setLayerBackground, setStartBackground} = require('../../actions/background');

describe('Test the background selector reducer', () => {
    it('check to store last 2d map type', () => {
        const state = background(undefined, setLayerBackground("currentLayer", {}));
        expect(state.currentLayer).toEqual({});
        const state2 = background(state, setStartBackground(1));
        expect(state2.start).toBe(1);
    });
});
