/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var url = require('url');
var LocaleUtils = require('../LocaleUtils');

describe('LocaleUtils', () => {
    it('getLocale', () => {
        var expectedLocal = navigator ? navigator.language || navigator.browserLanguage : "en";
        expect(LocaleUtils.getLocale({})).toBe(expectedLocal);

        expect(LocaleUtils.getLocale({locale: 'it'})).toBe('it-IT');
        expect(LocaleUtils.getLocale({locale: 'en'})).toBe('en-US');

        expect(LocaleUtils.getLocale({locale: 'fake'})).toBe('en-US');
    });

    it('getUserLocale', () => {
        var expectedLocal = LocaleUtils.getLocale(url.parse(window.location.href, true).query);
        expect(LocaleUtils.getUserLocale()).toBe(expectedLocal);
    });

    it('getSupportedLocales', () => {
        expect(LocaleUtils.getSupportedLocales()).toExist();
    });
});
