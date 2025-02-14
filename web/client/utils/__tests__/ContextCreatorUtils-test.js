/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    makePlugins,
    flattenPluginTree,
    migrateContextConfiguration
} from '../ContextCreatorUtils';

describe('Test the ContextCreatorUtils', () => {
    it('makePlugins', () => {
        const plugins = makePlugins([{ pluginConfig: { name: 'Map' } }, { active: true, pluginConfig: { name: 'Identify' }, isUserPlugin: true }]);
        expect(plugins).toEqual([ { name: 'Map' }, { name: 'Identify', active: true }]);
    });
    it('flattenPluginTree', () => {
        const plugins = flattenPluginTree([{ name: 'Map', enabled: true, children: [ { name: 'MapSupport' } ] }]);
        expect(plugins).toEqual([ { name: 'Map', enabled: true }, { name: 'MapSupport' } ]);
    });
    it('migrateContextConfiguration', () => {
        const newContext = migrateContextConfiguration({
            plugins: {
                desktop: [{ name: 'Map' }, { name: 'DeleteMap' }]
            }
        });
        expect(newContext).toEqual({
            plugins: {
                desktop: [{ name: 'Map' }, { name: 'DeleteResource' }]
            }
        });
    });
});
