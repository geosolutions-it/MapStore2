/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import { getPluginItems, getMorePrioritizedContainer } from '../../utils/PluginsUtils';
import CookiePlugin from '../Cookie';

const plugins = {CookiePlugin: CookiePlugin.CookiePlugin};
const items = (container, pageContainers) =>
    getPluginItems({}, plugins, ['Cookie', ...pageContainers], container, null, true)
        .map(({ target }) => target);

describe('Cookie plugin', () => {
    it('gives access from the Footer first, then the user menu, then the MapFooter', () => {
        expect(items('Footer', ['Footer', 'Login', 'MapFooter'])).toEqual(['menu']);
        expect(items('Login', ['Footer', 'Login'])).toEqual(['login-footer']);
        expect(items('Login', ['Login', 'MapFooter'])).toEqual(['menu-end', 'login-footer']);
        expect(items('MapFooter', ['Login', 'MapFooter'])).toEqual([]);
        expect(items('MapFooter', ['MapFooter'])).toEqual(['left-footer']);
    });
    it('keeps the plugin root, which renders the privacy panel, on every page', () => {
        ['Footer', 'Login', 'MapFooter'].forEach(container => {
            const { plugin } = getMorePrioritizedContainer({ impl: plugins.CookiePlugin, config: {} }, {}, [container], 0);
            expect(plugin.impl.doNotHide).toBe(true);
        });
    });
});
