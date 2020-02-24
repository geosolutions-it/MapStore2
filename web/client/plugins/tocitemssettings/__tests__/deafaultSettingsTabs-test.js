/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import defaultSettingsTabs, { getStyleTabPlugin } from '../defaultSettingsTabs';

const BASE_STYLE_TEST_DATA = {
    settings: {},
    items: [],
    loadedPlugins: {}
};


describe('TOCItemsSettings - getStyleTabPlugin', () => {
    it('getStyleTabPlugin', () => {
        const DEFAULT_TEST_PARAMS = {
            ...BASE_STYLE_TEST_DATA
        };
        expect(getStyleTabPlugin(DEFAULT_TEST_PARAMS)).toEqual({});
    });
    it('defaultSettingsTabs', () => {
        {
            const items = defaultSettingsTabs(BASE_STYLE_TEST_DATA);
            expect(items.length).toBe(1);
            expect(items[0].id).toBe('general');
        }
        {
            const items = defaultSettingsTabs(BASE_STYLE_TEST_DATA);
            expect(items.length).toBe(1);
        }
    });
});
