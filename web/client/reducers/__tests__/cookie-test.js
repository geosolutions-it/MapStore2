/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import cookie from '../cookie';
import { SET_COOKIE_VISIBILITY, addPrivacyAccess, removePrivacyAccess } from '../../actions/cookie';

describe('Test the cookie reducer', () => {
    it('cookie visibility', () => {
        const state = cookie(undefined, {
            type: SET_COOKIE_VISIBILITY,
            status: true
        });
        expect(state.showCookiePanel).toBeTruthy();
    });
    it('records each container that shows an access to the privacy settings once', () => {
        let state = cookie({showCookiePanel: true}, addPrivacyAccess('footer'));
        expect(state).toEqual({showCookiePanel: true, privacyAccesses: ['footer']});
        state = cookie(state, addPrivacyAccess('mapFooter'));
        const sameState = cookie(state, addPrivacyAccess('footer'));
        expect(sameState).toBe(state);
        expect(state.privacyAccesses).toEqual(['footer', 'mapFooter']);
    });
    it('forgets a container that no longer shows its access', () => {
        const state = cookie({privacyAccesses: ['footer', 'mapFooter']}, removePrivacyAccess('footer'));
        expect(state).toEqual({privacyAccesses: ['mapFooter']});
        expect(cookie(undefined, removePrivacyAccess('footer'))).toEqual({privacyAccesses: []});
    });

});
