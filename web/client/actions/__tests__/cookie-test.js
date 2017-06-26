/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var {
    SET_COOKIE_VISIBILITY, setCookieVisibility,
    SET_MORE_DETAILS_VISIBILITY, setMoreDetailsVisibility
} = require('../cookie');


describe('Test correctness of the cookies actions', () => {

    it('setCookieVisibility', () => {
        let status = true;
        var retval = setCookieVisibility(status);
        expect(retval).toExist();
        expect(retval.type).toBe(SET_COOKIE_VISIBILITY);
        expect(retval.status).toBeTruthy();
    });

    it('setMoreDetailsVisibility', () => {
        let status = true;
        var retval = setMoreDetailsVisibility(status);
        expect(retval).toExist();
        expect(retval.type).toBe(SET_MORE_DETAILS_VISIBILITY);
        expect(retval.status).toBeTruthy();
    });


});
