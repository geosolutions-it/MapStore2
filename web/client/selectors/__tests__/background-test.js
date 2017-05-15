/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {backgroundSelSelector} = require('../background');

describe('Test background selector', () => {
    it('test backgroundSelSelector', () => {
        const background = backgroundSelSelector({background: {start: 0, tempLayer: {}, currentLayer: {}}});

        expect(background).toExist();
        expect(background).toEqual({start: 0, tempLayer: {}, currentLayer: {}});

        const backgroundNull = backgroundSelSelector({});
        expect(backgroundNull).toExist();
        expect(backgroundNull).toEqual({});
    });
});
