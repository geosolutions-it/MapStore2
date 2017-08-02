/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {currentLocaleSelector} = require('../locale');

const state = {
    locale: {
        current: 'en-US'
    }
};

describe('Test locale selectors', () => {
    it('test currentLocaleSelectors', () => {
        const currentLocale = currentLocaleSelector(state);
        expect(currentLocale).toExist();
        expect(currentLocale).toBe(state.locale.current);
    });
});
