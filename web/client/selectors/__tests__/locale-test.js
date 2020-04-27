/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {currentLocaleSelector, currentMessagesSelector, currentLocaleLanguageSelector} = require('../locale');

const state = {
    locale: {
        current: 'en-US',
        messages: {
            "details": {
                "title": "Details"
            }
        }
    }
};

describe('Test locale selectors', () => {
    it('test currentLocaleSelectors', () => {
        const currentLocale = currentLocaleSelector(state);
        expect(currentLocale).toExist();
        expect(currentLocale).toBe(state.locale.current);
    });
    it('test currentMessagesSelector', () => {
        const currentMessages = currentMessagesSelector(state);
        expect(currentMessages).toExist();
        expect(currentMessages).toEqual(state.locale.messages);
    });
    it('test currentMessagesSelector empty', () => {
        const currentMessages = currentMessagesSelector({});
        expect(currentMessages).toExist();
        expect(currentMessages).toEqual({});
    });
    it('test currentLocaleLanguageSelector', () => {
        const currentLocaleLanguage = currentLocaleLanguageSelector(state);
        expect(currentLocaleLanguage).toBe('en');
    });
});
