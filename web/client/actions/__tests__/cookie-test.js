/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    SET_COOKIE_VISIBILITY,
    setCookieVisibility,
    ADD_PRIVACY_ACCESS,
    REMOVE_PRIVACY_ACCESS,
    addPrivacyAccess,
    removePrivacyAccess
} from '../cookie';


describe('Test correctness of the cookies actions', () => {

    it('setCookieVisibility', () => {
        let status = true;
        var retval = setCookieVisibility(status);
        expect(retval).toExist();
        expect(retval.type).toBe(SET_COOKIE_VISIBILITY);
        expect(retval.status).toBeTruthy();
    });
    it('addPrivacyAccess', () => {
        expect(addPrivacyAccess('footer')).toEqual({type: ADD_PRIVACY_ACCESS, id: 'footer'});
    });
    it('removePrivacyAccess', () => {
        expect(removePrivacyAccess('footer')).toEqual({type: REMOVE_PRIVACY_ACCESS, id: 'footer'});
    });


});
