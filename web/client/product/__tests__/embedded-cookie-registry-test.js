/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import apiPlugins from '../apiPlugins';
import geostoryPlugins from '../pluginsGeostoryEmbedded';
import dashboardPlugins from '../pluginsDashboardEmbedded';

describe('Cookie plugin availability in embedded registries', () => {
    it('provides the configured plugin in map embeds', () => {
        expect(apiPlugins.plugins.CookiePlugin).toExist();
    });
    it('provides the plugin for geostory and dashboard embeds', () => {
        expect(geostoryPlugins.plugins.CookiePlugin).toExist();
        expect(dashboardPlugins.plugins.CookiePlugin).toExist();
    });
});
