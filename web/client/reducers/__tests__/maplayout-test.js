/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');

const {UPDATE_MAP_LAYOUT} = require('../../actions/maplayout');
const mapLayout = require('../maplayout');

describe('Test the map layout reducer', () => {
    it('change layout bounds/style', () => {
        let layout = {left: 300};
        const action = {
            type: UPDATE_MAP_LAYOUT,
            layout
        };
        let state = mapLayout({}, action);
        expect(state.layout).toEqual(layout);
    });

    it('change layout boundingMapRect', () => {
        let layout = {left: 300, boundingMapRect: {left: 300}};
        const action = {
            type: UPDATE_MAP_LAYOUT,
            layout
        };
        let state = mapLayout({}, action);
        expect(state.layout).toEqual({left: 300});
        expect(state.boundingMapRect).toEqual({left: 300});
    });
});
