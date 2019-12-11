/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {get, pick, omit, isObject, head} from 'lodash';

import ConfigUtils from '../utils/ConfigUtils';

import {SET_CREATION_STEP, MAP_VIEWER_LOADED, SHOW_MAP_VIEWER_RELOAD_CONFIRM, SET_RESOURCE, CLEAR_CONTEXT_CREATOR,
    SET_FILTER_TEXT, SET_SELECTED_PLUGINS, SET_EDITED_PLUGIN, CHANGE_PLUGINS_KEY, SET_PLUGINS, CHANGE_ATTRIBUTE, LOADING,
    SET_EDITED_CFG, UPDATE_EDITED_CFG} from "../actions/contextcreator";
import {set} from '../utils/ImmutableUtils';

const defaultPlugins = [
    {
        name: 'TOC',
        label: 'List of layers',
        children: [
            {
                name: 'TOCItemSettings',
                label: 'Layer settings'
            },
            {
                name: 'FeaturesGrid',
                label: 'Attribute Table'
            }
        ]
    },
    {
        name: 'MapTemplates',
        label: 'Map Templates',
        enableMapTemplates: true
    },
    {
        name: 'Catalog',
        label: 'Catalog'
    },
    {
        name: 'Scale',
        label: 'Scale'
    },
    {
        name: 'ZoomIn',
        label: 'Zoom In'
    },
    {
        name: 'ZoomOut',
        label: 'Zoom Out'
    }
];

const changePlugins = (plugins, pluginNames, key, value) =>
    plugins && plugins.map(plugin => ({
        ...(pluginNames.reduce((result, pluginName) => result || pluginName === plugin.name, false) ?
            set(key, value, plugin) :
            plugin),
        children: changePlugins(plugin.children, pluginNames, key, value)
    }));

const getPluginName = plugin => isObject(plugin) ? plugin.name : plugin;
const findPlugin = (plugins, pluginName) =>
    plugins && plugins.reduce((result, plugin) =>
        result || pluginName === getPluginName(plugin) && plugin || findPlugin(plugin.children, pluginName), null);

const makePluginTree = config => {
    const plugins = get(config, 'desktop');

    if (!plugins) {
        return defaultPlugins;
    }

    const makeNode = (plugin) => ({
        ...(isObject(plugin) ? pick(plugin, 'name', 'label') : {name: plugin}),
        enabled: false,
        active: false,
        isUserPlugin: false,
        pluginConfig: isObject(plugin) ? omit(plugin, 'parentPlugin') : {name: plugin},
        children: plugins.filter(p => get(p, 'parentPlugin') === getPluginName(plugin)).map(makeNode)
    });

    return makeNode({}).children;
};

export default (state = {}, action) => {
    switch (action.type) {
    case SET_CREATION_STEP: {
        return set('stepId', action.stepId, state);
    }
    case MAP_VIEWER_LOADED: {
        return set('mapViewerLoaded', action.status, state);
    }
    case SHOW_MAP_VIEWER_RELOAD_CONFIRM: {
        return set('showReloadConfirm', action.show, state);
    }
    case SET_RESOURCE: {
        const {data = {plugins: {desktop: []}}, ...resource} = action.resource || {};
        const {plugins = {desktop: []}, userPlugins = [], ...otherData} = data;
        const contextPlugins = get(plugins, 'desktop', []);

        const allPlugins = makePluginTree(ConfigUtils.getConfigProp('plugins'));
        const convertPlugins = curPlugins => curPlugins.map(plugin => {
            const getPlugin = pluginArray => head(pluginArray.filter(p => getPluginName(p) === plugin.name));
            const enabledPlugin = getPlugin(contextPlugins);
            const userPlugin = getPlugin(userPlugins);
            const targetPlugin = enabledPlugin || userPlugin;

            if (!targetPlugin) {
                return plugin;
            }

            return {
                ...plugin,
                pluginConfig: {
                    ...get(plugin, 'pluginConfig', {}),
                    cfg: get(targetPlugin, 'cfg')
                },
                enabled: true,
                isUserPlugin: !!userPlugin,
                active: targetPlugin.active || false,
                children: convertPlugins(plugin.children)
            };
        });
        return set('newContext', otherData, set('plugins', convertPlugins(allPlugins), set('resource', resource, state)));
    }
    case CLEAR_CONTEXT_CREATOR: {
        return {};
    }
    case SET_FILTER_TEXT: {
        return set(`filterText.${action.propName}`, action.text, state);
    }
    case SET_SELECTED_PLUGINS: {
        const selectedPlugins = action.ids || [];
        return set('plugins', get(state, 'plugins', []).map(plugin => ({
            ...plugin,
            selected: selectedPlugins.reduce((result, selectedPluginName) => result || selectedPluginName === plugin.name, false)
        })), state);
    }
    case SET_EDITED_PLUGIN: {
        return set('editedPlugin', action.pluginName, state);
    }
    case CHANGE_PLUGINS_KEY: {
        return set('plugins', changePlugins(get(state, 'plugins', []), action.ids || [], action.key, action.value), state);
    }
    case SET_PLUGINS: {
        return set('plugins', action.plugins, state);
    }
    case SET_EDITED_CFG: {
        return action.pluginName ?
            set('editedCfg', JSON.stringify(get(findPlugin(get(state, 'plugins', []), action.pluginName), 'pluginConfig.cfg', {}), null, 2), state) :
            state;
    }
    case UPDATE_EDITED_CFG: {
        return set('editedCfg', action.cfg, state);
    }
    case CHANGE_ATTRIBUTE: {
        return action.key === 'name' ?
            set('resource.name', action.value, state) :
            set(`newContext.${action.key}`, action.value, state);
    }
    case LOADING: {
        // anyway sets loading to true
        return set(action.name === "loading" ? "loading" : `loadFlags.${action.name}`, action.value, set(
            "loading", action.value, state
        ));
    }
    default:
        return state;
    }
};
