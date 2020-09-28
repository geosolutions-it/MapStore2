/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {get, omit, isObject, head, find, pick} from 'lodash';

import ConfigUtils from '../utils/ConfigUtils';

import {INIT, SET_CREATION_STEP, SET_WAS_TUTORIAL_SHOWN, SET_TUTORIAL_STEP, MAP_VIEWER_LOADED, SHOW_MAP_VIEWER_RELOAD_CONFIRM, SET_RESOURCE,
    UPDATE_TEMPLATE, IS_VALID_CONTEXT_NAME, CONTEXT_NAME_CHECKED, CLEAR_CONTEXT_CREATOR, SET_FILTER_TEXT, SET_SELECTED_PLUGINS,
    SET_SELECTED_TEMPLATES, SET_PARSED_TEMPLATE, SET_FILE_DROP_STATUS, SET_EDITED_TEMPLATE, SET_TEMPLATES, SET_EDITED_PLUGIN,
    CHANGE_PLUGINS_KEY, CHANGE_TEMPLATES_KEY, CHANGE_ATTRIBUTE, LOADING, SHOW_DIALOG, SET_EDITED_CFG, UPDATE_EDITED_CFG,
    SET_VALIDATION_STATUS, SET_PARSED_CFG, SET_CFG_ERROR, ENABLE_UPLOAD_PLUGIN, UPLOADING_PLUGIN, UPLOAD_PLUGIN_ERROR, ADD_PLUGIN_TO_UPLOAD,
    REMOVE_PLUGIN_TO_UPLOAD, PLUGIN_UPLOADED, UNINSTALLING_PLUGIN, UNINSTALL_PLUGIN_ERROR, PLUGIN_UNINSTALLED,
    BACK_TO_PAGE_SHOW_CONFIRMATION} from "../actions/contextcreator";
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
        label: 'Map Templates'
    },
    {
        name: 'MetadataExplorer',
        label: 'MetadataExplorer'
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

const makeNode = (plugin, parent = null, plugins = [], localPlugins = []) => ({
    name: plugin.name,
    title: plugin.title,
    description: plugin.description,
    glyph: plugin.glyph,
    parent,
    mandatory: !!plugin.mandatory,

    // true if plugin is forced to be mandatory so that it cannot be disabled (if some plugin that has this plugin as a dependency is enabled)
    forcedMandatory: false,

    enabledDependentPlugins: [], // names of plugins that are enabled and have this plugin as a dependency
    hidden: !!plugin.hidden,
    dependencies: plugin.dependencies || [],
    enabled: false,
    active: false,
    denyUserSelection: plugin.denyUserSelection || false,
    isUserPlugin: false,
    isExtension: plugin.extension ?? false,
    pluginConfig: {
        override: plugin.defaultOverride,
        ...omit(head(localPlugins.filter(localPlugin => localPlugin.name === plugin.name)) || {},
            'cfg', ...(plugin.defaultOverride ? ['override'] : [])),
        name: plugin.name,
        cfg: plugin.defaultConfig
    },
    autoEnableChildren: plugin.autoEnableChildren || [],
    children: get(plugin, 'children', [])
        .map(childPluginName => head(plugins.filter(p => p.name === childPluginName)))
        .filter(childPlugin => childPlugin !== undefined)
        .map(childPlugin => makeNode(childPlugin, plugin.name, plugins, localPlugins))
});

const makePluginTree = (plugins, localPluginsConfig) => {
    const localPlugins = get(localPluginsConfig, 'desktop', []).map(plugin => isObject(plugin) ? plugin : {name: plugin});

    if (!plugins) {
        return defaultPlugins;
    }

    const rootPlugins = plugins.reduce((curRootPlugins, plugin) =>
        get(plugin, 'children', []).reduce((newRootPlugins, childPlugin) =>
            newRootPlugins.filter(rootPlugin => rootPlugin.name !== childPlugin), curRootPlugins), plugins);
    return rootPlugins.map(rootPlugin => makeNode(rootPlugin, null, plugins, localPlugins));
};

export default (state = {}, action) => {
    switch (action.type) {
    case INIT: {
        return {
            ...state,
            ...(action.initState || {})
        };
    }
    case SET_CREATION_STEP: {
        return set('stepId', action.stepId, state);
    }
    case SET_WAS_TUTORIAL_SHOWN: {
        return set(`wasTutorialShown[${action.stepId}]`, true, state);
    }
    case SET_TUTORIAL_STEP: {
        return set('tutorialStep', action.stepId, state);
    }
    case MAP_VIEWER_LOADED: {
        return set('mapViewerLoaded', action.status, state);
    }
    case SHOW_MAP_VIEWER_RELOAD_CONFIRM: {
        return set('showReloadConfirm', action.show, state);
    }
    case ENABLE_UPLOAD_PLUGIN: {
        return {
            ...state,
            uploadPluginEnabled: action.enable,
            uploadingPlugin: [],
            pluginsToUpload: [],
            uploadResult: null
        };
    }
    case ADD_PLUGIN_TO_UPLOAD: {
        return {
            ...state,
            uploadResult: null,
            pluginsToUpload: [...(state.pluginsToUpload || []), ...action.files]
        };
    }
    case REMOVE_PLUGIN_TO_UPLOAD: {
        return {
            ...state,
            pluginsToUpload: state.pluginsToUpload.filter((p, idx) => idx !== action.index)
        };
    }
    case UPLOADING_PLUGIN: {
        const uploadingPlugin = action.plugins.map(p => ({name: p, uploading: action.status}));
        const notUpdated = plugin => uploadingPlugin.filter(p => p.name === plugin.name).length === 0;
        return set('uploadingPlugin', [ ...(state.uploadingPlugin || []).filter(notUpdated), ...uploadingPlugin ], state);
    }
    case UPLOAD_PLUGIN_ERROR: {
        return set('uploadResult', {
            result: "error",
            files: action.files,
            error: action.error
        }, state);
    }
    case PLUGIN_UPLOADED: {
        const plugins = action.plugins.map(makeNode);
        const notDuplicate = plugin => plugins.filter(p => p.name === plugin.name).length === 0;
        return {
            ...state,
            pluginsToUpload: [],
            uploadResult: {
                result: "ok"
            },
            plugins: [...(state.plugins || []).filter(notDuplicate), ...plugins]
        };
    }
    case UNINSTALLING_PLUGIN: {
        if (action.status) {
            return set('uninstallingPlugin', {name: action.plugin, uninstalling: true}, state);
        }
        return set('uninstallingPlugin', undefined, state);
    }
    case UNINSTALL_PLUGIN_ERROR: {
        return set('uninstallingPlugin', {name: action.plugin, uninstalling: false, error: action.error}, state);
    }
    case PLUGIN_UNINSTALLED: {
        return {
            ...state,
            plugins: state.plugins.filter(p => p.name !== action.plugin)
        };
    }
    case SET_RESOURCE: {
        const {data = {plugins: {desktop: []}}, ...resource} = action.resource || {};
        const {plugins = {desktop: []}, userPlugins = [], templates = [], ...otherData} = data;
        const contextPlugins = get(plugins, 'desktop', []);

        const allPlugins = makePluginTree(get(action.pluginsConfig, 'plugins'), ConfigUtils.getConfigProp('plugins'));

        let pluginsToEnable = [];
        const convertPlugins = curPlugins => curPlugins.map(plugin => {
            const getPlugin = pluginArray => head(pluginArray.filter(p => getPluginName(p) === plugin.name));
            const enabledPlugin = getPlugin(contextPlugins);
            const userPlugin = getPlugin(userPlugins);
            const targetPlugin = enabledPlugin || userPlugin;

            if (!targetPlugin) {
                return plugin;
            }

            pluginsToEnable.push(targetPlugin.name);

            return {
                ...plugin,
                pluginConfig: {
                    ...get(plugin, 'pluginConfig', {}),
                    cfg: get(targetPlugin, 'cfg'),
                    override: get(targetPlugin, 'override')
                },
                isUserPlugin: !!userPlugin,
                active: targetPlugin.active || false,
                children: convertPlugins(plugin.children)
            };
        });

        const contextCreatorPlugins = convertPlugins(allPlugins);
        const pluginTemplates = findPlugin(contextCreatorPlugins, 'MapTemplates')?.pluginConfig?.cfg?.allowedTemplates;

        return set('initialEnabledPlugins', pluginsToEnable,
            set('templates', (action.allTemplates || []).map(template => ({
                ...template,
                ...(template.thumbnail ? {thumbnail: decodeURIComponent(template.thumbnail)} : {}),
                attributes: {
                    ...(template.thumbnail ? {thumbnail: decodeURIComponent(template.thumbnail)} : {}),
                    ...(template.format ? {format: template.format} : {})
                },
                enabled: (pluginTemplates || templates || []).reduce((result, cur) => result || cur.id === template.id, false),
                selected: false
            })),
            set('newContext', otherData, set('plugins', contextCreatorPlugins, set('resource', resource, state)))));
    }
    case UPDATE_TEMPLATE: {
        const newResource = action.resource || {};
        const templates = get(state, 'templates', []);
        const oldResource = find(templates, template => template.id === newResource.id);
        return action.resource ? set('templates',
            [...templates.filter(template => template.id !== newResource.id), {...newResource, ...pick(oldResource, 'enabled', 'selected')}],
            state) : state;
    }
    case IS_VALID_CONTEXT_NAME: {
        return set('isValidContextName', action.valid, state);
    }
    case CONTEXT_NAME_CHECKED: {
        return set('contextNameChecked', action.checked, state);
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
    case SET_SELECTED_TEMPLATES: {
        const selectedTemplates = action.ids || [];
        return set('templates', get(state, 'templates', []).map(template => ({
            ...template,
            selected: selectedTemplates.reduce((result, selectedTemplateId) => result || selectedTemplateId === template.id, false)
        })), state);
    }
    case SET_PARSED_TEMPLATE: {
        return set('parsedTemplate', {fileName: action.fileName, data: action.data, format: action.format}, state);
    }
    case SET_FILE_DROP_STATUS: {
        return set('fileDropStatus', action.status, state);
    }
    case SET_EDITED_TEMPLATE: {
        return set('editedTemplate', find(get(state, 'templates', []), template => template.id === action.id), state);
    }
    case SET_TEMPLATES: {
        return set('templates', action.templates, state);
    }
    case SET_EDITED_PLUGIN: {
        return set('editedPlugin', action.pluginName, state);
    }
    case CHANGE_PLUGINS_KEY: {
        return set('plugins', changePlugins(get(state, 'plugins', []), action.ids || [], action.key, action.value), state);
    }
    case CHANGE_TEMPLATES_KEY: {
        return set('templates',
            get(state, 'templates', []).map(
                template => ({
                    ...template,
                    [action.key]: (action.ids || []).reduce((result, cur) => result || cur === template.id, false) ?
                        action.value :
                        template[action.key]
                })
            ), state);
    }
    case SET_EDITED_CFG: {
        const plugin = findPlugin(get(state, 'plugins', []), action.pluginName);
        return action.pluginName ?
            set('editedCfg', JSON.stringify({
                cfg: omit(get(plugin, 'pluginConfig.cfg', {}), ...(action.pluginName === 'MapTemplates' ? ['allowedTemplates'] : [])),
                override: get(plugin, 'pluginConfig.override', {})
            }, null, 2), state) :
            state;
    }
    case UPDATE_EDITED_CFG: {
        return set('editedCfg', action.cfg, state);
    }
    case SET_VALIDATION_STATUS: {
        return set('validationStatus', action.status, state);
    }
    case SET_PARSED_CFG: {
        return set('parsedCfg', action.parsedCfg, state);
    }
    case SET_CFG_ERROR: {
        return set('cfgError', action.error, state);
    }
    case CHANGE_ATTRIBUTE: {
        return action.key === 'name' ?
            set('resource.name', action.value, state) :
            set(`newContext.${action.key}`, action.value, state);
    }
    case SHOW_DIALOG: {
        return set(`showDialog.${action.dialogName}`, action.show, set(`showDialog.${action.dialogName}Payload`, action.payload, state));
    }
    case LOADING: {
        // anyway sets loading to true
        return set(action.name === "loading" ? "loading" : `loadFlags.${action.name}`, action.value, set(
            "loading", action.value, state
        ));
    }
    case BACK_TO_PAGE_SHOW_CONFIRMATION: {
        return set('showBackToPageConfirmation', action.show, state);
    }
    default:
        return state;
    }
};
