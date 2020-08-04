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
    it('getStyleTabPlugin gets thematic plugin if present and the layer is wfs', () => {
        const DEFAULT_TEST_PARAMS = {
            ...BASE_STYLE_TEST_DATA,
            element: {
                search: {
                    type: "wfs",
                    url: "something"
                }
            },
            items: [{
                target: 'style',
                name: 'ThematicLayer',
                selector: (props) => {
                    return props?.element?.search;
                }
            }]
        };
        const toolbar = getStyleTabPlugin(DEFAULT_TEST_PARAMS).toolbar;
        expect(toolbar).toBeTruthy();
        expect(toolbar.length).toBe(2);
    });
    it('getStyleTabPlugin exclude thematic plugin if layer is not', () => {
        const DEFAULT_TEST_PARAMS = {
            ...BASE_STYLE_TEST_DATA,
            element: {
                type: "asd"
            },
            items: [{
                target: 'style',
                name: 'ThematicLayer',
                selector: (props) => {
                    return props?.element?.search;
                }
            }]
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
