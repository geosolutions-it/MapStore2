/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
var I18NActions = require('../../actions/I18NActions');

describe('This test for I18NStore', () => {
    var I18NStore;
    beforeEach((done) => {
        I18NStore = require('../I18NStore');
        setTimeout(done);
    });

    afterEach((done) => {
        var name = require.resolve('../I18NStore');
        delete require.cache[name];
        setTimeout(done);
    });

    it('checks _getDefaultLang()', () => {
        expect(I18NStore._get_default_language()).toEqual("en-US");
        expect(I18NStore._get_default_language("it-IT")).toEqual("it-IT");
        expect(I18NStore._get_default_language("something")).toEqual("en-US");
    });

    it('checks getCurrentLocale()', () => {
        const mockStoreData = {
            data: {
                locale: "foo"
            }
        };
        I18NStore._set_mocked_data(mockStoreData);

        expect(I18NStore.getCurrentLocale()).toBe(mockStoreData.data.locale);
    });

    it('checks default locale', () => {
        var locale;
        if (navigator) {
            locale = navigator.language || navigator.browserLanguage;
            if (locale && (locale === "it-IT" || locale === "en-US")) {
                expect(I18NStore.getCurrentLocale()).toBe(locale);
            }
        }
        expect(I18NStore.getCurrentLocale()).toBe("en-US");
    });

    it('checks getSupportedLocales()', () => {
        const mockStoreData = {
            locales: {
                "l0": "00",
                "l1": "01"
            }
        };
        I18NStore._set_mocked_data(mockStoreData);

        const output = I18NStore.getSupportedLocales();
        for (let p in mockStoreData.locales) {
            if (mockStoreData.locales.hasOwnProperty(p)) {
                expect(output[p]).toBe(mockStoreData.locales[p]);
            }
        }
        for (let p in output) {
            if (output.hasOwnProperty(p)) {
                expect(mockStoreData.locales[p]).toBe(output[p]);
            }
        }
    });

    it('checks getMsgById(id)', () => {
        const mockStoreData = {
            data: {
                messages: {
                    "id0": "id0",
                    "id1": "id1",
                    "id2": "id2"
                }
            }
        };
        I18NStore._set_mocked_data(mockStoreData);

        for (let id in mockStoreData.data.messages) {
            if (mockStoreData.data.messages.hasOwnProperty(id)) {
                expect(I18NStore.getMsgById(id)).toBe(id);
            }
        }
    });

    it('checks register(event, handler)', () => {
        const mockEvent = "anEvent";
        const testHandlers = { h() {} };
        const spy = expect.spyOn(testHandlers, "h");

        I18NStore.register(mockEvent, testHandlers.h);
        I18NStore.emit(mockEvent);

        expect(spy.calls.length).toBe(1);
    });

    it('checks trigger(event)', () => {
        const mockEvent = "anEvent";
        const testHandlers = { h() {} };
        const spy = expect.spyOn(testHandlers, "h");

        I18NStore.register(mockEvent, testHandlers.h);
        I18NStore.trigger(mockEvent);

        expect(spy.calls.length).toBe(1);
    });

    it('unregister(event, handler)', () => {
        const mockEvent = "anEvent";
        const testHandlers = { h() {} };
        const spy = expect.spyOn(testHandlers, "h");

        I18NStore.register(mockEvent, testHandlers.h);
        I18NStore.trigger(mockEvent);

        expect(spy.calls.length).toBe(1);

        I18NStore.unregister(mockEvent, testHandlers.h);
        I18NStore.trigger(mockEvent);

        expect(spy.calls.length).toBe(1);
    });

    it('checks the correctness of I18NActions.CHANGE_LANG menagement', () => {
        const currentLocale = I18NStore.getCurrentLocale();
        const locales = I18NStore.getSupportedLocales();
        var newLocale;

        for (let l in locales) {
            if (locales.hasOwnProperty(l)) {
                if (locales[l] !== currentLocale) {
                    newLocale = locales[l];
                }
            }
        }
        I18NStore._emulate_dispatcher({
            locale: newLocale,
            type: I18NActions.CHANGE_LANG
        });

        expect(I18NStore.getCurrentLocale()).toBe(newLocale);
    });
});
