/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { omit, flatten } from 'lodash';

/**
 * @param {array} plugins array of plugins configuration
 * @returns an array of plugins with additional active property
 */
export const makePlugins = (plugins = []) =>
    plugins.map(plugin => ({...plugin.pluginConfig, ...(plugin.isUserPlugin ? {active: plugin.active} : {})}));
/**
 * @param {array} plugins array of plugins configuration
 * @returns flatten the plugin tree in case of nested children
 */
export const flattenPluginTree = (plugins = []) =>
    flatten(plugins.map(plugin => [omit(plugin, 'children')].concat(plugin.enabled ? flattenPluginTree(plugin.children) : [])));
const CHANGED_PLUGINS_NAMES = {
    'DeleteMap': 'DeleteResource',
    'MetadataExplorer': 'Catalog'
};
/**
 * Overrides of the configuration of the plugins saved with a previous version of MapStore.
 * The key is the name of the plugin, the value is merged in its saved `cfg`.
 */
const PLUGINS_CFG_OVERRIDES = {
    // migration for MapFooter to add containerPosition: 'footer' if not present
    'MapFooter': { containerPosition: 'footer' },
    // migration for FeatureEditor and Timeline to add containerPosition: 'bottom' if not present
    'FeatureEditor': { containerPosition: 'bottom' },
    'Timeline': { containerPosition: 'bottom' },
    // migrate for Map to add containerPosition: 'background' if not present
    'Map': { containerPosition: 'background' }
};
/**
 * @param {object} plugin plugin configuration
 * @returns the plugin configuration with the current name and the overrides of `cfg` defined for it
 */
const migratePluginConfiguration = (plugin) => {
    if (CHANGED_PLUGINS_NAMES[plugin.name]) {
        return {
            ...plugin,
            name: CHANGED_PLUGINS_NAMES[plugin.name]
        };
    }
    const overrides = PLUGINS_CFG_OVERRIDES[plugin.name];
    if (overrides) {
        return {
            ...plugin,
            cfg: {
                ...plugin.cfg,
                ...overrides
            }
        };
    }
    return plugin;
};
/**
 * @param {object} context context configuration
 * @returns update context configuration based on plugins updates or changes (eg. rename of plugins).
 * It applies to the plugins enabled by default and to the ones the user can activate (`userPlugins`).
 */
export const migrateContextConfiguration = (context) => {
    return {
        ...context,
        ...(context?.plugins && {
            plugins: Object.fromEntries(Object.keys(context.plugins)
                .map((key) => [key, context.plugins[key].map(migratePluginConfiguration)]))
        }),
        ...(context?.userPlugins && {
            userPlugins: context.userPlugins.map(migratePluginConfiguration)
        })
    };
};
