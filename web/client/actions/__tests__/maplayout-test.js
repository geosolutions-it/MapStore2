/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {UPDATE_MAP_LAYOUT, updateMapLayout} = require('../maplayout');

describe('Test map layout actions', () => {
    it('updateMapLayout', () => {
        const retval = updateMapLayout({left: 300});
        expect(retval).toExist();
        expect(retval.type).toEqual(UPDATE_MAP_LAYOUT);
        expect(retval.layout).toEqual({left: 300});
    });
});
