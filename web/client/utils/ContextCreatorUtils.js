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
