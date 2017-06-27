/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

const cookie = require('../cookie');
const {
    SET_COOKIE_VISIBILITY, SET_MORE_DETAILS_VISIBILITY
} = require('../../actions/cookie');

describe('Test the cookie reducer', () => {
    it('cookie visibility', () => {
        const state = cookie(undefined, {
            type: SET_COOKIE_VISIBILITY,
            status: true
        });
        expect(state.showCookiePanel).toBeTruthy();
    });

    it('cookie seeMore section', () => {
        const state = cookie(undefined, {
            type: SET_MORE_DETAILS_VISIBILITY,
            status: true
        });
        expect(state.seeMore).toBeTruthy();
    });

});
