/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import getDefaultConfig from '../DefaultConfiguration';

describe('DefaultConfiguration', () => {
    it('should return default configuration with base plugins when no overrides provided', () => {
        const config = getDefaultConfig();

        expect(config.desktop).toBeTruthy();
        expect(Array.isArray(config.desktop)).toBe(true);
        expect(config.desktop.length).toBeGreaterThan(0);
    });

    it('should include FeatureEditor when added via overridePluginsConfig', () => {
        const config = getDefaultConfig(['FeatureEditor']);

        const pluginNames = config.desktop.map(p => typeof p === 'string' ? p : p.name);
        expect(pluginNames).toContain('FeatureEditor');
    });

    it('should not include FeatureEditor by default', () => {
        const config = getDefaultConfig();

        const pluginNames = config.desktop.map(p => typeof p === 'string' ? p : p.name);
        expect(pluginNames).toNotContain('FeatureEditor');
    });

    it('should add multiple plugins from overridePluginsConfig', () => {
        const config = getDefaultConfig(['FeatureEditor', 'SomeOtherPlugin']);

        const pluginNames = config.desktop.map(p => typeof p === 'string' ? p : p.name);
        expect(pluginNames).toContain('FeatureEditor');
        expect(pluginNames).toContain('SomeOtherPlugin');
    });

    it('should prevent duplicates when override plugin already exists in base config', () => {
        const config = getDefaultConfig(['Map', 'TOC', 'FeatureEditor']);

        const pluginNames = config.desktop.map(p => typeof p === 'string' ? p : p.name);
        const mapCount = pluginNames.filter(name => name === 'Map').length;
        const tocCount = pluginNames.filter(name => name === 'TOC').length;
        const featureEditorCount = pluginNames.filter(name => name === 'FeatureEditor').length;

        expect(mapCount).toBe(1);
        expect(tocCount).toBe(1);
        expect(featureEditorCount).toBe(1);
    });

    it('should handle plugin objects in overridePluginsConfig', () => {
        const overridePlugin = {
            name: 'CustomPlugin',
            cfg: {
                someConfig: 'value'
            }
        };
        const config = getDefaultConfig([overridePlugin]);

        const pluginNames = config.desktop.map(p => typeof p === 'string' ? p : p.name);
        expect(pluginNames).toContain('CustomPlugin');

        // Check that the plugin object is preserved
        const customPlugin = config.desktop.find(p => {
            const name = typeof p === 'string' ? p : p.name;
            return name === 'CustomPlugin';
        });
        expect(customPlugin).toEqual(overridePlugin);
    });

    it('should prevent duplicates when override plugin object matches existing string plugin', () => {
        const overridePlugin = {
            name: 'Map',
            cfg: {
                customConfig: 'value'
            }
        };
        const config = getDefaultConfig([overridePlugin]);

        const pluginNames = config.desktop.map(p => typeof p === 'string' ? p : p.name);
        const mapCount = pluginNames.filter(name => name === 'Map').length;

        expect(mapCount).toBe(1);
        // Should keep the first occurrence (base plugin), not the override
        const mapPlugin = config.desktop.find(p => {
            const name = typeof p === 'string' ? p : p.name;
            return name === 'Map';
        });
        // Base Map plugin is an object, so it should be preserved
        expect(typeof mapPlugin).toBe('object');
    });

    it('should handle empty array overridePluginsConfig', () => {
        const config = getDefaultConfig([]);

        expect(config.desktop).toBeTruthy();
        expect(Array.isArray(config.desktop)).toBe(true);
        expect(config.desktop.length).toBeGreaterThan(0);
    });

    it('should handle undefined overridePluginsConfig', () => {
        const config = getDefaultConfig(undefined);

        expect(config.desktop).toBeTruthy();
        expect(Array.isArray(config.desktop)).toBe(true);
    });
});

