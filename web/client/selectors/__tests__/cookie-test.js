/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import { hasPrivacyAccessSelector } from '../cookie';

describe('cookie selectors', () => {
    it('hasPrivacyAccessSelector', () => {
        expect(hasPrivacyAccessSelector({})).toBe(false);
        expect(hasPrivacyAccessSelector({cookie: {privacyAccesses: []}})).toBe(false);
        expect(hasPrivacyAccessSelector({cookie: {privacyAccesses: ['userMenu']}})).toBe(true);
    });
});
