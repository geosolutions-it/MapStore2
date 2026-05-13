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
                desktop: [{ name: 'Map' }, { name: 'DeleteMap' }, { name: 'MapFooter' }]
            }
        });
        expect(newContext).toEqual({
            plugins: {
                desktop: [{ name: 'Map', cfg: { containerPosition: 'background' } }, { name: 'DeleteResource' }, { name: 'MapFooter', cfg: { containerPosition: 'footer' }}]
            }
        });
    });
    it('migrateContextConfiguration adds containerPosition bottom to FeatureEditor and Timeline', () => {
        const newContext = migrateContextConfiguration({
            plugins: {
                desktop: [{ name: 'FeatureEditor' }, { name: 'Timeline' }]
            }
        });
        expect(newContext).toEqual({
            plugins: {
                desktop: [
                    { name: 'FeatureEditor', cfg: { containerPosition: 'bottom' } },
                    { name: 'Timeline', cfg: { containerPosition: 'bottom' } }
                ]
            }
        });
    });
    it('migrateContextConfiguration does not override existing containerPosition for FeatureEditor and Timeline', () => {
        const newContext = migrateContextConfiguration({
            plugins: {
                desktop: [
                    { name: 'FeatureEditor', cfg: { containerPosition: 'bottom' } },
                    { name: 'Timeline', cfg: { containerPosition: 'bottom' } }
                ]
            }
        });
        expect(newContext).toEqual({
            plugins: {
                desktop: [
                    { name: 'FeatureEditor', cfg: { containerPosition: 'bottom' } },
                    { name: 'Timeline', cfg: { containerPosition: 'bottom' } }
                ]
            }
        });
    });
    it('migrateContextConfiguration preserves existing cfg properties when migrating', () => {
        const newContext = migrateContextConfiguration({
            plugins: {
                desktop: [{ name: 'FeatureEditor', cfg: { someOption: true } }]
            }
        });
        expect(newContext).toEqual({
            plugins: {
                desktop: [{ name: 'FeatureEditor', cfg: { someOption: true, containerPosition: 'bottom' } }]
            }
        });
    });
});
