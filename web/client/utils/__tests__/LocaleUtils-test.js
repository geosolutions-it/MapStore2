/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const url = require('url');
const LocaleUtils = require('../LocaleUtils');

describe('LocaleUtils', () => {
    it('normalizeLocaleCode', () => {
        expect(LocaleUtils.normalizeLocaleCode()).toBe(undefined);
        expect(LocaleUtils.normalizeLocaleCode(null)).toBe(undefined);
        expect(LocaleUtils.normalizeLocaleCode('')).toBe(undefined);
        expect(LocaleUtils.normalizeLocaleCode('it-IT')).toBe('it');
        expect(LocaleUtils.normalizeLocaleCode('IT')).toBe('it');
    });

    it('getLocale', () => {
        let supportedLocales = {
            "it": {
                code: "it-IT",
                description: "Italiano"
            },
            "en": {
                code: "en-US",
                description: "English"
            },
            "fr": {
                code: "fr-FR",
                description: "Français"
            },
            "de": {
                code: "de-DE",
                description: "Deutsch"
            },
            "es": {
                code: "es-ES",
                description: "Español"
            }
        };
        LocaleUtils.setSupportedLocales(supportedLocales);
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

    it('getErrorMessage', () => {
        expect(LocaleUtils.getErrorMessage({status: 409}, 'geostore', 'mapsError')).toEqual({
            title: 'map.mapError.errorTitle',
            message: 'map.mapError.error409'
        });
        expect(LocaleUtils.getErrorMessage({status: 0}, 'geostore', 'mapsError')).toEqual({
            title: 'map.mapError.errorTitle',
            message: 'map.mapError.errorDefault'
        });
        expect(LocaleUtils.getErrorMessage()).toEqual({
            title: 'errorTitleDefault',
            message: 'errorDefault'
        });
    });
    it('getLocalizedProp', () => {
        expect(LocaleUtils.getLocalizedProp()).toBe('');
        const stringProp = 'title';
        expect(LocaleUtils.getLocalizedProp(undefined, stringProp)).toBe('title');
        const localizedObjectProp = {'it-IT': 'titolo', 'default': 'title'};
        expect(LocaleUtils.getLocalizedProp('it-IT', localizedObjectProp)).toBe('titolo');
        expect(LocaleUtils.getLocalizedProp('fr-FR', localizedObjectProp)).toBe('title');
    });
    it('getDateFormat', () => {
        // test default dateFormat value
        expect(LocaleUtils.getDateFormat()).toBe("YYYY/MM/DD");
        // test dateFormat for the locales actually defined
        expect(LocaleUtils.getDateFormat("en-US")).toBe("MM/DD/YYYY");
        expect(LocaleUtils.getDateFormat("it-IT")).toBe("DD/MM/YYYY");
        expect(LocaleUtils.getDateFormat("nl-NL")).toBe("DD/MM/YYYY");
        expect(LocaleUtils.getDateFormat("zh-ZH")).toBe("YYYY/MM/DD");
        expect(LocaleUtils.getDateFormat("hr-HR")).toBe("DD/MM/YYYY");
        expect(LocaleUtils.getDateFormat("pt-PT")).toBe("DD/MM/YYYY");
    });
    it('test the defaults for DATE_FORMATS', () => {
        expect(Object.keys(LocaleUtils.DATE_FORMATS).length).toBe(9);
        expect(Object.keys(LocaleUtils.DATE_FORMATS)).toEqual(["default", "en-US", "it-IT", "nl-NL", "zh-ZH", "hr-HR", "pt-PT", "vi-VN", "fi-FI"]);
    });
});
