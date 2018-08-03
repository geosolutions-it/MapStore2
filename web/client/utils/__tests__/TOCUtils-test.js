/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const TOCUtils = require('../TOCUtils');

describe('TOCUtils', () => {
    it('test createFromSearch for General Fragment with value not allowed', () => {
        const val = TOCUtils.createFromSearch();
        expect(val).toBe(null);
    });

    it('test createFromSearch for General Fragment with valid value', () => {
        const val = TOCUtils.createFromSearch();
        expect(val).toBe(null);
    });
});
