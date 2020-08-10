/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import {findIndex, find, flatten, omit} from 'lodash';

import { createStateMocker } from './reducersTestUtils';
import ConfigUtils from '../../utils/ConfigUtils';

import contextcreator from '../contextcreator';
import {
    enabledPluginsFilterTextSelector,
    newContextSelector,
    mapConfigSelector,
    resourceSelector,
    pluginsSelector,
    templatesSelector,
    editedPluginSelector,
    editedCfgSelector,
    editedTemplateSelector
} from '../../selectors/contextcreator';
import {
    setFilterText,
    setResource,
    setSelectedPlugins,
    setEditedPlugin,
    setEditedCfg,
    updateEditedCfg,
    changePluginsKey,
    setCreationStep,
    clearContextCreator,
    changeAttribute,
    enableUploadPlugin,
    uploadPluginError,
    pluginUploaded,
    pluginUploading,
    uninstallPluginError,
    pluginUninstalled,
    pluginUninstalling,
    showBackToPageConfirmation,
    addPluginToUpload,
    removePluginToUpload,
    setSelectedTemplates,
    setEditedTemplate,
    setTemplates,
    changeTemplatesKey
} from '../../actions/contextcreator';

const testContextResource = {
    data: {
        windowTitle: 'title',
        mapConfig: {},
        templates: [{id: 2}],
        plugins: {
            desktop: [{
                name: 'Catalog',
                cfg: {
                    parameter: true,
                    anotherParameter: "someInterestingValue"
                },
                override: {
                    parameter: "value"
                }
            }]
        },
        userPlugins: [{
            name: 'ZoomIn',
            active: true,
            cfg: {}
        }]
    },
    canDelete: true,
    canEdit: true,
    creation: "2019-10-21T16:00:29.888+02:00",
    description: "test context",
    id: 11516,
    lastUpdate: "2019-10-22T15:55:41.123+02:00",
    name: "test context"
};

const defaultPlugins = [{
    name: 'Catalog',
    title: 'Catalog',
    defaultConfig: {
        parameter: false
    },
    children: ['CatalogChildPlugin']
}, {
    name: 'ZoomIn',
    title: 'ZoomIn'
}, {
    name: 'ZoomOut',
    defaultConfig: {
        parameter: 'value'
    }
}, {
    name: 'CatalogChildPlugin',
    title: 'ChildPlugin'
}, {
    name: 'Identify',
    defaultOverride: {
        parameter: 'value2'
    }
}];

const pluginsConfig = {plugins: defaultPlugins};

const localPlugins = {
    desktop: [{
        name: 'ZoomOut',
        override: {
            parameter: 'value'
        }
    }, {
        name: 'Identify',
        override: {
            parameter: 'value'
        }
    }]
};

const allTemplates = [{
    id: 1,
    thumbnail: 'data'
}, {
    id: 2
}];

const findPlugins = (plugins = [], predicate = () => {}) =>
    [...plugins.filter(plugin => predicate(plugin)).map(plugin => omit(plugin, 'children')),
        ...flatten(plugins.filter(plugin => plugin.children !== undefined).map(plugin => findPlugins(plugin.children, predicate)))];

describe('contextcreator reducer', () => {
    const stateMocker = createStateMocker({contextcreator});
    let oldPlugins;
    beforeEach(() => {
        oldPlugins = ConfigUtils.getConfigProp('plugins');
        ConfigUtils.setConfigProp('plugins', localPlugins);
    });
    afterEach(() => {
        ConfigUtils.setConfigProp('plugins', oldPlugins);
    });
    it('setCreationStep', () => {
        const state = contextcreator(undefined, setCreationStep('step'));
        expect(state).toExist();
        expect(state.stepId).toBe('step');
    });
    it('clearContextCreator', () => {
        const state = contextcreator(undefined, clearContextCreator());
        expect(state).toEqual({});
    });
    it('changeAttribute', () => {
        const state = contextcreator(undefined, changeAttribute('key', 1));
        expect(state).toExist();
        expect(state.newContext).toExist();
        expect(state.newContext.key).toBe(1);
    });
    it('setFilterText', () => {
        const state = stateMocker(setFilterText('enabledPlugins', 'filtertext'));
        expect(enabledPluginsFilterTextSelector(state)).toBe('filtertext');
    });
    it('setResource', () => {
        const state = stateMocker(setResource(testContextResource, pluginsConfig, allTemplates));
        const {data, ...resource} = testContextResource;
        const newContext = newContextSelector(state);
        const plugins = pluginsSelector(state);
        const templates = templatesSelector(state);
        expect(newContext).toExist();
        expect(newContext.windowTitle).toBe(data.windowTitle);
        expect(newContext.plugins).toNotExist();
        expect(newContext.userPlugins).toNotExist();
        expect(templates).toExist();
        expect(templates.length).toBe(2);
        expect(templates[0].id).toBe(1);
        expect(templates[0].enabled).toBe(false);
        expect(templates[0].selected).toBe(false);
        expect(templates[1].id).toBe(2);
        expect(templates[1].enabled).toBe(true);
        expect(templates[1].selected).toBe(false);
        expect(mapConfigSelector(state)).toEqual(data.mapConfig);
        expect(resourceSelector(state)).toEqual(resource);
        expect(plugins).toExist();
        expect(plugins.length).toBe(4);
        expect(plugins[0].name).toBe(defaultPlugins[0].name);
        expect(plugins[0].title).toBe(defaultPlugins[0].title);
        expect(plugins[0].enabled).toBe(false);
        expect(plugins[0].isUserPlugin).toBe(false);
        expect(plugins[0].active).toBe(false);
        expect(plugins[0].pluginConfig).toExist();
        expect(plugins[0].pluginConfig.name).toBe(defaultPlugins[0].name);
        expect(plugins[0].pluginConfig.cfg).toEqual(data.plugins.desktop[0].cfg);
        expect(plugins[0].pluginConfig.override).toEqual(data.plugins.desktop[0].override);
        expect(plugins[0].children.length).toBe(1);
        expect(plugins[0].children[0].name).toBe(defaultPlugins[3].name);
        expect(plugins[0].children[0].title).toBe(defaultPlugins[3].title);
        expect(plugins[0].children[0].pluginConfig).toExist();
        expect(plugins[0].children[0].pluginConfig.name).toBe(defaultPlugins[3].name);
        expect(plugins[0].children[0].pluginConfig.cfg).toNotExist();
        expect(plugins[1].name).toBe(defaultPlugins[1].name);
        expect(plugins[1].title).toBe(defaultPlugins[1].title);
        expect(plugins[1].enabled).toBe(false);
        expect(plugins[1].isUserPlugin).toBe(true);
        expect(plugins[1].active).toBe(true);
        expect(plugins[1].pluginConfig).toExist();
        expect(plugins[1].pluginConfig.name).toBe(defaultPlugins[1].name);
        expect(plugins[1].pluginConfig.cfg).toEqual(data.userPlugins[0].cfg);
        expect(plugins[1].pluginConfig.override).toNotExist();
        expect(plugins[2].name).toBe(defaultPlugins[2].name);
        expect(plugins[2].title).toBe(defaultPlugins[2].title);
        expect(plugins[2].enabled).toBe(false);
        expect(plugins[2].isUserPlugin).toBe(false);
        expect(plugins[2].active).toBe(false);
        expect(plugins[2].pluginConfig).toExist();
        expect(plugins[2].pluginConfig.name).toEqual(defaultPlugins[2].name);
        expect(plugins[2].pluginConfig.cfg).toEqual(defaultPlugins[2].defaultConfig);
        expect(plugins[2].pluginConfig.override).toEqual(localPlugins.desktop[0].override);
        expect(plugins[3].name).toBe(defaultPlugins[4].name);
        expect(plugins[3].title).toBe(defaultPlugins[4].title);
        expect(plugins[3].enabled).toBe(false);
        expect(plugins[3].isUserPlugin).toBe(false);
        expect(plugins[3].active).toBe(false);
        expect(plugins[3].pluginConfig).toExist();
        expect(plugins[3].pluginConfig.name).toEqual(defaultPlugins[4].name);
        expect(plugins[3].pluginConfig.cfg).toNotExist();
        expect(plugins[3].pluginConfig.override).toEqual(defaultPlugins[4].defaultOverride);
    });
    it('setResource with context with templates inside MapTemplates config', () => {
        const contextResource = {
            data: {
                windowTitle: 'title',
                mapConfig: {},
                plugins: {
                    desktop: [{
                        name: 'Catalog',
                        cfg: {
                            parameter: true,
                            anotherParameter: "someInterestingValue"
                        },
                        override: {
                            parameter: "value"
                        }
                    }, {
                        name: 'MapTemplates',
                        cfg: {
                            allowedTemplates: [{ id: 2 }]
                        }
                    }]
                },
                userPlugins: [{
                    name: 'ZoomIn',
                    active: true,
                    cfg: {}
                }]
            },
            canDelete: true,
            canEdit: true,
            creation: "2019-10-21T16:00:29.888+02:00",
            description: "test context",
            id: 11516,
            lastUpdate: "2019-10-22T15:55:41.123+02:00",
            name: "test context"
        };
        const pluginsConfigWithMapTemplates = {
            plugins: [
                ...pluginsConfig.plugins, {
                    name: 'MapTemplates'
                }
            ]
        };

        const state = stateMocker(setResource(contextResource, pluginsConfigWithMapTemplates, allTemplates));
        const {data, ...resource} = testContextResource;
        const newContext = newContextSelector(state);
        const plugins = pluginsSelector(state);
        const templates = templatesSelector(state);
        expect(newContext).toExist();
        expect(newContext.windowTitle).toBe(data.windowTitle);
        expect(newContext.plugins).toNotExist();
        expect(newContext.userPlugins).toNotExist();
        expect(templates).toExist();
        expect(templates.length).toBe(2);
        expect(templates[0].id).toBe(1);
        expect(templates[0].enabled).toBe(false);
        expect(templates[0].selected).toBe(false);
        expect(templates[1].id).toBe(2);
        expect(templates[1].enabled).toBe(true);
        expect(templates[1].selected).toBe(false);
        expect(mapConfigSelector(state)).toEqual(data.mapConfig);
        expect(resourceSelector(state)).toEqual(resource);
        expect(plugins).toExist();
        expect(plugins.length).toBe(5);
        expect(plugins[0].name).toBe(defaultPlugins[0].name);
        expect(plugins[0].title).toBe(defaultPlugins[0].title);
        expect(plugins[0].enabled).toBe(false);
        expect(plugins[0].isUserPlugin).toBe(false);
        expect(plugins[0].active).toBe(false);
        expect(plugins[0].pluginConfig).toExist();
        expect(plugins[0].pluginConfig.name).toBe(defaultPlugins[0].name);
        expect(plugins[0].pluginConfig.cfg).toEqual(data.plugins.desktop[0].cfg);
        expect(plugins[0].pluginConfig.override).toEqual(data.plugins.desktop[0].override);
        expect(plugins[0].children.length).toBe(1);
        expect(plugins[0].children[0].name).toBe(defaultPlugins[3].name);
        expect(plugins[0].children[0].title).toBe(defaultPlugins[3].title);
        expect(plugins[0].children[0].pluginConfig).toExist();
        expect(plugins[0].children[0].pluginConfig.name).toBe(defaultPlugins[3].name);
        expect(plugins[0].children[0].pluginConfig.cfg).toNotExist();
        expect(plugins[1].name).toBe(defaultPlugins[1].name);
        expect(plugins[1].title).toBe(defaultPlugins[1].title);
        expect(plugins[1].enabled).toBe(false);
        expect(plugins[1].isUserPlugin).toBe(true);
        expect(plugins[1].active).toBe(true);
        expect(plugins[1].pluginConfig).toExist();
        expect(plugins[1].pluginConfig.name).toBe(defaultPlugins[1].name);
        expect(plugins[1].pluginConfig.cfg).toEqual(data.userPlugins[0].cfg);
        expect(plugins[1].pluginConfig.override).toNotExist();
        expect(plugins[2].name).toBe(defaultPlugins[2].name);
        expect(plugins[2].title).toBe(defaultPlugins[2].title);
        expect(plugins[2].enabled).toBe(false);
        expect(plugins[2].isUserPlugin).toBe(false);
        expect(plugins[2].active).toBe(false);
        expect(plugins[2].pluginConfig).toExist();
        expect(plugins[2].pluginConfig.name).toEqual(defaultPlugins[2].name);
        expect(plugins[2].pluginConfig.cfg).toEqual(defaultPlugins[2].defaultConfig);
        expect(plugins[2].pluginConfig.override).toEqual(localPlugins.desktop[0].override);
        expect(plugins[3].name).toBe(defaultPlugins[4].name);
        expect(plugins[3].title).toBe(defaultPlugins[4].title);
        expect(plugins[3].enabled).toBe(false);
        expect(plugins[3].isUserPlugin).toBe(false);
        expect(plugins[3].active).toBe(false);
        expect(plugins[3].pluginConfig).toExist();
        expect(plugins[3].pluginConfig.name).toEqual(defaultPlugins[4].name);
        expect(plugins[3].pluginConfig.cfg).toNotExist();
        expect(plugins[3].pluginConfig.override).toEqual(defaultPlugins[4].defaultOverride);
        expect(plugins[4].name).toBe('MapTemplates');
        expect(plugins[4].enabled).toBe(false);
        expect(plugins[4].isUserPlugin).toBe(false);
        expect(plugins[4].active).toBe(false);
        expect(plugins[4].pluginConfig).toExist();
        expect(plugins[4].pluginConfig.cfg).toExist();
        expect(plugins[4].pluginConfig.cfg.allowedTemplates).toExist();
        expect(plugins[4].pluginConfig.cfg.allowedTemplates.length).toBe(1);
    });
    it('setSelectedPlugins', () => {
        const pluginsToSelect = ['Catalog', 'ZoomIn'];
        const state = stateMocker(setResource(testContextResource, pluginsConfig), setSelectedPlugins(pluginsToSelect));
        const plugins = pluginsSelector(state);
        expect(plugins).toExist();
        const selectedPlugins = findPlugins(plugins, plugin => plugin.selected);
        expect(selectedPlugins.length).toBe(2);
        pluginsToSelect.map(pluginToSelect =>
            expect(findIndex(selectedPlugins, plugin => plugin.name === pluginToSelect)).toBeGreaterThan(-1));
    });
    it('setEditedPlugin', () => {
        const state = stateMocker(setEditedPlugin('editedPlugin'));
        expect(editedPluginSelector(state)).toBe('editedPlugin');
    });
    it('setEditedCfg', () => {
        const state = stateMocker(setResource(testContextResource, pluginsConfig), setEditedCfg('ZoomIn'));
        expect(editedCfgSelector(state)).toBe('{\n  \"cfg\": {},\n  \"override\": {}\n}');
    });
    it('setEditedCfg with MapTemplates with allowedTemplates', () => {
        const contextResource = {
            data: {
                windowTitle: 'title',
                mapConfig: {},
                plugins: {
                    desktop: [{
                        name: 'Catalog',
                        cfg: {
                            parameter: true,
                            anotherParameter: "someInterestingValue"
                        },
                        override: {
                            parameter: "value"
                        }
                    }, {
                        name: 'MapTemplates',
                        cfg: {
                            allowedTemplates: [{ id: 2 }]
                        }
                    }]
                },
                userPlugins: [{
                    name: 'ZoomIn',
                    active: true,
                    cfg: {}
                }]
            },
            canDelete: true,
            canEdit: true,
            creation: "2019-10-21T16:00:29.888+02:00",
            description: "test context",
            id: 11516,
            lastUpdate: "2019-10-22T15:55:41.123+02:00",
            name: "test context"
        };
        const pluginsConfigWithMapTemplates = {
            plugins: [
                ...pluginsConfig.plugins, {
                    name: 'MapTemplates'
                }
            ]
        };

        const state = stateMocker(setResource(contextResource, pluginsConfigWithMapTemplates), setEditedCfg('MapTemplates'));
        const allowedTemplates = findPlugins(pluginsSelector(state), ({name}) => name === 'MapTemplates')[0]?.pluginConfig?.cfg?.allowedTemplates;

        expect(allowedTemplates).toExist();
        expect(allowedTemplates.length).toBe(1);
        expect(editedCfgSelector(state)).toBe('{\n  \"cfg\": {},\n  \"override\": {}\n}');
    });
    it('changePluginsKey', () => {
        const pluginsToChange = ['CatalogChildPlugin', 'ZoomIn'];
        const state = stateMocker(setResource(testContextResource, pluginsConfig), changePluginsKey(pluginsToChange, 'enabled', true));
        const plugins = pluginsSelector(state);
        expect(plugins).toExist();
        const enabledPlugins = findPlugins(plugins, plugin => plugin.enabled);
        expect(enabledPlugins.length).toBe(2);
        [...pluginsToChange].map(pluginToChange =>
            expect(findIndex(enabledPlugins, plugin => plugin.name === pluginToChange)).toBeGreaterThan(-1));
    });
    it('updateEditedCfg', () => {
        const state = stateMocker(updateEditedCfg('cfgtext'));
        expect(editedCfgSelector(state)).toBe('cfgtext');
    });
    it('updateEditedCfg', () => {
        const state = stateMocker(updateEditedCfg('cfgtext'));
        expect(editedCfgSelector(state)).toBe('cfgtext');
    });
    it('setSelectedTemplates', () => {
        const state = stateMocker(setResource(testContextResource, pluginsConfig, allTemplates), setSelectedTemplates([2]));
        const templates = templatesSelector(state);
        expect(templates).toExist();
        expect(templates.length).toBe(2);
        expect(find(templates, {id: 2})?.selected).toBe(true);
    });
    it('setEditedTemplate', () => {
        const state = stateMocker(setResource(testContextResource, pluginsConfig, allTemplates), setEditedTemplate(1));
        expect(editedTemplateSelector(state)?.id).toBe(1);
    });
    it('setTemplates', () => {
        const state = stateMocker(setTemplates([{id: 101}, {id: 102}]));
        const templates = templatesSelector(state);
        expect(templates).toExist();
        expect(templates.length).toBe(2);
        expect(templates[0].id).toBe(101);
        expect(templates[1].id).toBe(102);
    });
    it('changeTemplatesKey', () => {
        const state = stateMocker(setResource(testContextResource, pluginsConfig, allTemplates), changeTemplatesKey([1, 2], 'enabled', true));
        const templates = templatesSelector(state);
        expect(templates).toExist();
        expect(templates.length).toBe(2);
        expect(templates[0].enabled).toBe(true);
        expect(templates[1].enabled).toBe(true);
    });
    it('enableUploadPlugin', () => {
        const state = contextcreator(undefined, enableUploadPlugin(true));
        expect(state).toExist();
        expect(state.uploadPluginEnabled).toBe(true);
        expect(state.uploadingPlugin.length).toBe(0);
    });
    it('uploadingPlugin', () => {
        const state = contextcreator(undefined, pluginUploading(true, ['myplugin']));
        expect(state).toExist();
        expect(state.uploadingPlugin.length).toBe(1);
        expect(state.uploadingPlugin[0].name).toBe("myplugin");
        expect(state.uploadingPlugin[0].uploading).toBe(true);
    });
    it('uploadPluginError', () => {
        const state = contextcreator(undefined, uploadPluginError([{name: 'myplugin'}], "myerror"));
        expect(state).toExist();
        expect(state.uploadResult.result).toBe("error");
        expect(state.uploadResult.files.length).toBe(1);
        expect(state.uploadResult.files[0].name).toBe("myplugin");
        expect(state.uploadResult.error).toBe("myerror");
    });
    it('disableUploadPlugin', () => {
        const state = contextcreator({ uploadingPlugin: [{}] }, enableUploadPlugin(false));
        expect(state).toExist();
        expect(state.uploadPluginEnabled).toBe(false);
        expect(state.uploadingPlugin.length).toBe(0);
    });
    it('pluginUploaded', () => {
        const state = contextcreator(undefined, pluginUploaded([{ name: 'myplugin' }]));
        expect(state).toExist();
        expect(state.plugins.length).toBe(1);
        expect(state.uploadResult).toExist();
        expect(state.uploadResult.result).toBe("ok");
    });
    it('pluginUploaded no duplicates', () => {
        const state = contextcreator({plugins: [{name: "myplugin"}]}, pluginUploaded([{ name: 'myplugin', error: "myerror" }]));
        expect(state).toExist();
        expect(state.plugins.length).toBe(1);
    });

    it('uninstallingPlugin', () => {
        const state = contextcreator(undefined, pluginUninstalling(true, 'myplugin'));
        expect(state).toExist();
        expect(state.uninstallingPlugin.name).toBe("myplugin");
        expect(state.uninstallingPlugin.uninstalling).toBe(true);
    });
    it('uninstallPluginError', () => {
        const state = contextcreator(undefined, uninstallPluginError('myplugin', "myerror"));
        expect(state).toExist();
        expect(state.uninstallingPlugin.name).toBe("myplugin");
        expect(state.uninstallingPlugin.uninstalling).toBe(false);
        expect(state.uninstallingPlugin.error).toBe("myerror");
    });
    it('pluginUninstalled', () => {
        const state = contextcreator({plugins: [{name: "My"}]}, pluginUninstalled('My'));
        expect(state).toExist();
        expect(state.plugins.length).toBe(0);
    });
    it('addPluginToUpload', () => {
        const state = contextcreator({pluginsToUpload: []}, addPluginToUpload([{name: 'My'}]));
        expect(state).toExist();
        expect(state.pluginsToUpload.length).toBe(1);
    });
    it('removePluginToUpload', () => {
        const state = contextcreator({pluginsToUpload: [{}]}, removePluginToUpload(0));
        expect(state).toExist();
        expect(state.pluginsToUpload.length).toBe(0);
    });

    it('showBackToPageConfirmation', () => {
        const state = contextcreator(undefined, showBackToPageConfirmation(true));
        expect(state).toExist();
        expect(state.showBackToPageConfirmation).toBe(true);
    });
});
