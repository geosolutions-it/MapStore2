/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { testEpic } from './epicTestUtils';
import {
    resetConfigOnPluginKeyChange,
    editPluginEpic,
    enablePluginsEpic,
    disablePluginsEpic,
    uploadPluginEpic,
    uninstallPluginEpic,
    saveTemplateEpic,
    saveContextResource,
    checkIfContextExists,
    editTemplateEpic
} from '../contextcreator';
import {
    editPlugin,
    enablePlugins,
    disablePlugins,
    changePluginsKey,
    changeAttribute,
    uploadPlugin,
    uninstallPlugin,
    saveTemplate,
    saveNewContext,
    editTemplate,
    SET_EDITED_PLUGIN,
    SET_EDITED_CFG,
    SET_CFG_ERROR,
    CHANGE_PLUGINS_KEY,
    ENABLE_MANDATORY_PLUGINS,
    PLUGIN_UPLOADED,
    UPLOADING_PLUGIN,
    UNINSTALLING_PLUGIN,
    PLUGIN_UNINSTALLED,
    LOADING,
    LOAD_TEMPLATE,
    SHOW_DIALOG,
    IS_VALID_CONTEXT_NAME,
    CONTEXT_NAME_CHECKED,
    LOAD_EXTENSIONS,
    CONTEXT_SAVED,
    SET_EDITED_TEMPLATE,
    SET_PARSED_TEMPLATE,
    SET_FILE_DROP_STATUS
} from '../../actions/contextcreator';
import {
    SHOW_NOTIFICATION
} from '../../actions/notifications';

import axios from "../../libs/ajax";
import MockAdapter from "axios-mock-adapter";

describe('contextcreator epics', () => {
    let mockAxios;
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });
    afterEach(() => {
        mockAxios.restore();
    });
    it('resetConfigOnPluginKeyChange', (done) => {
        const startActions = [changePluginsKey(['plugin', 'editedPlugin'], 'enabled', false)];
        testEpic(resetConfigOnPluginKeyChange, 2, startActions, actions => {
            expect(actions.length).toBe(2);
            expect(actions[0].type).toBe(SET_CFG_ERROR);
            expect(actions[0].error).toNotExist();
            expect(actions[1].type).toBe(SET_EDITED_PLUGIN);
            expect(actions[1].pluginName).toNotExist();
        }, {
            contextcreator: {
                editedPlugin: 'editedPlugin',
                plugins: [{
                    name: 'plugin',
                    enabled: true,
                    children: []
                }, {
                    name: 'editedPlugin',
                    enabled: true,
                    children: []
                }]
            }
        }, done);
    });
    it('editPluginEpic', (done) => {
        const pluginName = 'pluginName';
        const startActions = [editPlugin(pluginName)];
        testEpic(editPluginEpic, 2, startActions, actions => {
            expect(actions.length).toBe(2);
            expect(actions[0].type).toBe(SET_EDITED_PLUGIN);
            expect(actions[0].pluginName).toBe(pluginName);
            expect(actions[1].type).toBe(SET_EDITED_CFG);
            expect(actions[1].pluginName).toBe(pluginName);
        }, {
            contextcreator: {
                editedPlugin: "editedPlugin",
                validationStatus: true
            }
        }, done);
    });
    it('enablePluginsEpic', (done) => {
        const pluginsToEnable = ['ZoomIn', 'ZoomOut'];
        const startActions = [enablePlugins(pluginsToEnable)];
        testEpic(enablePluginsEpic, 3, startActions, actions => {
            expect(actions.length).toBe(3);
            expect(actions[0].type).toBe(CHANGE_PLUGINS_KEY);
            expect(actions[0].ids).toEqual(pluginsToEnable);
            expect(actions[0].key).toBe('enabled');
            expect(actions[0].value).toBe(true);
            expect(actions[1].type).toBe(CHANGE_PLUGINS_KEY);
            expect(actions[1].ids).toEqual(pluginsToEnable);
            expect(actions[1].key).toBe('isUserPlugin');
            expect(actions[1].value).toBe(false);
            expect(actions[2].type).toBe(CHANGE_PLUGINS_KEY);
            expect(actions[2].ids).toExist();
            expect(actions[2].ids.length).toBe(0);
            expect(actions[2].key).toBe('forcedMandatory');
            expect(actions[2].value).toBe(true);
        }, {
            contextcreator: {
                plugins: [{
                    name: 'MetadataExplorer',
                    title: 'Catalog',
                    dependencies: [],
                    children: [],
                    autoEnableChildren: [],
                    enabled: false,
                    isUserPlugin: false,
                    active: false
                }, {
                    name: 'ZoomIn',
                    dependencies: [],
                    children: [],
                    autoEnableChildren: [],
                    enabled: false,
                    isUserPlugin: false,
                    active: false
                }, {
                    name: 'ZoomOut',
                    dependencies: [],
                    children: [],
                    autoEnableChildren: [],
                    enabled: false,
                    isUserPlugin: false,
                    active: false
                }]
            }
        }, done);
    });
    it('enablePluginsEpic with dependencies', (done) => {
        const pluginsToEnable = ['Widgets', 'WidgetsBuilder'];
        const startActions = [enablePlugins(pluginsToEnable)];
        testEpic(enablePluginsEpic, 4, startActions, actions => {
            expect(actions.length).toBe(4);
            expect(actions[0].type).toBe(CHANGE_PLUGINS_KEY);
            expect(actions[0].ids.sort()).toEqual(['Widgets', 'WidgetsBuilder', 'WidgetsTray']);
            expect(actions[0].key).toBe('enabled');
            expect(actions[0].value).toBe(true);
            expect(actions[1].type).toBe(CHANGE_PLUGINS_KEY);
            expect(actions[1].ids.sort()).toEqual(['Widgets', 'WidgetsBuilder', 'WidgetsTray']);
            expect(actions[1].key).toBe('isUserPlugin');
            expect(actions[1].value).toBe(false);
            expect(actions[2].type).toBe(CHANGE_PLUGINS_KEY);
            expect(actions[2].ids).toEqual(['WidgetsTray']);
            expect(actions[2].key).toBe('forcedMandatory');
            expect(actions[2].value).toBe(true);
            expect(actions[3].type).toBe(CHANGE_PLUGINS_KEY);
            expect(actions[3].ids).toEqual(['WidgetsTray']);
            expect(actions[3].key).toBe('enabledDependentPlugins');
            expect(actions[3].value).toEqual(['WidgetsBuilder']);
        }, {
            contextcreator: {
                plugins: [{
                    name: 'Widgets',
                    dependencies: [],
                    enabled: false,
                    isUserPlugin: false,
                    active: false,
                    autoEnableChildren: [],
                    children: [{
                        name: 'WidgetsBuilder',
                        dependencies: ['WidgetsTray'],
                        parent: 'Widgets',
                        enabled: false,
                        isUserPlugin: false,
                        active: false,
                        autoEnableChildren: [],
                        children: []
                    }, {
                        name: 'WidgetsTray',
                        dependencies: [],
                        enabledDependentPlugins: [],
                        parent: 'Widgets',
                        enabled: false,
                        isUserPlugin: false,
                        active: false,
                        autoEnableChildren: [],
                        children: []
                    }]
                }, {
                    name: 'ZoomIn',
                    dependencies: [],
                    enabled: true,
                    isUserPlugin: true,
                    active: false,
                    autoEnableChildren: [],
                    children: []
                }, {
                    name: 'ZoomOut',
                    dependencies: [],
                    enabled: false,
                    isUserPlugin: false,
                    active: false,
                    autoEnableChildren: [],
                    children: []
                }]
            }
        }, done);
    });
    it('enablePluginsEpic with transitive dependencies', (done) => {
        const pluginsToEnable = ['Widgets', 'WidgetsBuilder'];
        const startActions = [enablePlugins(pluginsToEnable)];
        testEpic(enablePluginsEpic, 7, startActions, actions => {
            expect(actions.length).toBe(7);
            expect(actions[0].type).toBe(CHANGE_PLUGINS_KEY);
            expect(actions[0].ids.sort()).toEqual(['BurgerMenu', 'CheeseburgerMenu', 'OmniBar', 'Widgets', 'WidgetsBuilder', 'WidgetsTray']);
            expect(actions[0].key).toBe('enabled');
            expect(actions[0].value).toBe(true);
            expect(actions[1].type).toBe(CHANGE_PLUGINS_KEY);
            expect(actions[1].ids.sort()).toEqual(['BurgerMenu', 'CheeseburgerMenu', 'OmniBar', 'Widgets', 'WidgetsBuilder', 'WidgetsTray']);
            expect(actions[1].key).toBe('isUserPlugin');
            expect(actions[1].value).toBe(false);
            expect(actions[2].type).toBe(CHANGE_PLUGINS_KEY);
            expect(actions[2].ids.sort()).toEqual(['BurgerMenu', 'CheeseburgerMenu', 'OmniBar', 'WidgetsTray']);
            expect(actions[2].key).toBe('forcedMandatory');
            expect(actions[2].value).toBe(true);

            const enabledDependentPluginsActions = actions.slice(3);
            enabledDependentPluginsActions.sort((x, y) => x.ids[0] < y.ids[0] ? -1 : x.ids[0] > y.ids[0] ? 1 : 0);

            expect(enabledDependentPluginsActions[0].type).toBe(CHANGE_PLUGINS_KEY);
            expect(enabledDependentPluginsActions[0].ids).toEqual(['BurgerMenu']);
            expect(enabledDependentPluginsActions[0].key).toBe('enabledDependentPlugins');
            expect(enabledDependentPluginsActions[0].value).toEqual(['Widgets']);
            expect(enabledDependentPluginsActions[1].type).toBe(CHANGE_PLUGINS_KEY);
            expect(enabledDependentPluginsActions[1].ids).toEqual(['CheeseburgerMenu']);
            expect(enabledDependentPluginsActions[1].key).toBe('enabledDependentPlugins');
            expect(enabledDependentPluginsActions[1].value).toEqual(['BurgerMenu']);
            expect(enabledDependentPluginsActions[2].type).toBe(CHANGE_PLUGINS_KEY);
            expect(enabledDependentPluginsActions[2].ids).toEqual(['OmniBar']);
            expect(enabledDependentPluginsActions[2].key).toBe('enabledDependentPlugins');
            expect(enabledDependentPluginsActions[2].value).toEqual(['BurgerMenu']);
            expect(enabledDependentPluginsActions[3].type).toBe(CHANGE_PLUGINS_KEY);
            expect(enabledDependentPluginsActions[3].ids).toEqual(['WidgetsTray']);
            expect(enabledDependentPluginsActions[3].key).toBe('enabledDependentPlugins');
            expect(enabledDependentPluginsActions[3].value).toEqual(['WidgetsBuilder']);
        }, {
            contextcreator: {
                plugins: [{
                    name: 'Widgets',
                    dependencies: ['BurgerMenu'],
                    enabled: false,
                    isUserPlugin: false,
                    active: false,
                    autoEnableChildren: [],
                    children: [{
                        name: 'WidgetsBuilder',
                        dependencies: ['WidgetsTray'],
                        parent: 'Widgets',
                        enabled: false,
                        isUserPlugin: false,
                        active: false,
                        autoEnableChildren: [],
                        children: []
                    }, {
                        name: 'WidgetsTray',
                        dependencies: [],
                        enabledDependentPlugins: [],
                        parent: 'Widgets',
                        enabled: false,
                        isUserPlugin: false,
                        active: false,
                        autoEnableChildren: [],
                        children: []
                    }]
                }, {
                    name: 'ZoomIn',
                    dependencies: [],
                    enabled: true,
                    isUserPlugin: true,
                    active: false,
                    autoEnableChildren: [],
                    children: []
                }, {
                    name: 'OmniBar',
                    dependencies: [],
                    enabledDependentPlugins: [],
                    enabled: false,
                    isUserPlugin: false,
                    active: false,
                    autoEnableChildren: [],
                    children: []
                }, {
                    name: 'BurgerMenu',
                    dependencies: ['OmniBar', 'CheeseburgerMenu'],
                    enabledDependentPlugins: [],
                    enabled: false,
                    isUserPlugin: false,
                    active: false,
                    autoEnableChildren: [],
                    children: []
                }, {
                    name: 'CheeseburgerMenu',
                    dependencies: [],
                    enabledDependentPlugins: [],
                    enabled: false,
                    isUserPlugin: false,
                    active: false,
                    autoEnableChildren: [],
                    children: []
                }, {
                    name: 'ZoomOut',
                    dependencies: [],
                    enabled: false,
                    isUserPlugin: false,
                    active: false,
                    autoEnableChildren: [],
                    children: []
                }]
            }
        }, done);
    });
    it('disablePluginsEpic', (done) => {
        const pluginsToDisable = ['ZoomIn', 'ZoomOut'];
        const startActions = [disablePlugins(pluginsToDisable)];
        testEpic(disablePluginsEpic, 1, startActions, actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe(CHANGE_PLUGINS_KEY);
            expect(actions[0].ids).toEqual(pluginsToDisable);
            expect(actions[0].key).toBe('enabled');
            expect(actions[0].value).toBe(false);
        }, {
            contextcreator: {
                plugins: [{
                    name: 'MetadataExplorer',
                    title: 'Catalog',
                    dependencies: [],
                    enabledDependentPlugins: [],
                    children: [],
                    enabled: true,
                    isUserPlugin: false,
                    active: false
                }, {
                    name: 'ZoomIn',
                    dependencies: [],
                    enabledDependentPlugins: [],
                    children: [],
                    enabled: true,
                    isUserPlugin: false,
                    active: false
                }, {
                    name: 'ZoomOut',
                    dependencies: [],
                    enabledDependentPlugins: [],
                    children: [],
                    enabled: true,
                    isUserPlugin: false,
                    active: false
                }]
            }
        }, done);
    });
    it('disablePluginsEpic with dependencies', (done) => {
        const pluginsToDisable = ['WidgetsBuilder'];
        const startActions = [disablePlugins(pluginsToDisable)];
        testEpic(disablePluginsEpic, 3, startActions, actions => {
            expect(actions.length).toBe(3);
            expect(actions[0].type).toBe(CHANGE_PLUGINS_KEY);
            expect(actions[0].ids.sort()).toEqual(['WidgetsBuilder', 'WidgetsTray']);
            expect(actions[0].key).toBe('enabled');
            expect(actions[0].value).toBe(false);
            expect(actions[1].type).toBe(CHANGE_PLUGINS_KEY);
            expect(actions[1].ids).toEqual(['WidgetsTray']);
            expect(actions[1].key).toBe('enabledDependentPlugins');
            expect(actions[1].value).toEqual([]);
            expect(actions[2].type).toBe(CHANGE_PLUGINS_KEY);
            expect(actions[2].ids).toEqual(['WidgetsTray']);
            expect(actions[2].key).toBe('forcedMandatory');
            expect(actions[2].value).toBe(false);
        }, {
            contextcreator: {
                plugins: [{
                    name: 'Widgets',
                    dependencies: [],
                    enabledDependentPlugins: [],
                    enabled: true,
                    isUserPlugin: false,
                    active: false,
                    children: [{
                        name: 'WidgetsBuilder',
                        dependencies: ['WidgetsTray'],
                        enabledDependentPlugins: [],
                        children: [],
                        parent: 'Widgets',
                        enabled: true,
                        isUserPlugin: false,
                        active: false
                    }, {
                        name: 'WidgetsTray',
                        dependencies: [],
                        children: [],
                        enabledDependentPlugins: ['WidgetsBuilder'],
                        forcedMandatory: true,
                        parent: 'Widgets',
                        enabled: true,
                        isUserPlugin: false,
                        active: false
                    }]
                }, {
                    name: 'ZoomIn',
                    dependencies: [],
                    enabledDependentPlugins: [],
                    children: [],
                    enabled: true,
                    isUserPlugin: true,
                    active: false
                }, {
                    name: 'ZoomOut',
                    dependencies: [],
                    enabledDependentPlugins: [],
                    children: [],
                    enabled: false,
                    isUserPlugin: false,
                    active: false
                }]
            }
        }, done);
    });
    it('disablePluginsEpic with dependencies when value of the enabledDependentPlugins of one of the dependent children is []', (done) => {
        const pluginsToDisable = ['WidgetsBuilder'];
        const startActions = [disablePlugins(pluginsToDisable)];
        testEpic(disablePluginsEpic, 2, startActions, actions => {
            expect(actions.length).toBe(2);
            expect(actions[0].type).toBe(CHANGE_PLUGINS_KEY);
            expect(actions[0].ids.sort()).toEqual(['WidgetsBuilder', 'WidgetsTray']);
            expect(actions[0].key).toBe('enabled');
            expect(actions[0].value).toBe(false);
            expect(actions[1].type).toBe(CHANGE_PLUGINS_KEY);
            expect(actions[1].ids).toEqual(['WidgetsTray']);
            expect(actions[1].key).toBe('forcedMandatory');
            expect(actions[1].value).toBe(false);
        }, {
            contextcreator: {
                plugins: [{
                    name: 'Widgets',
                    dependencies: [],
                    enabledDependentPlugins: [],
                    enabled: true,
                    isUserPlugin: false,
                    active: false,
                    children: [{
                        name: 'WidgetsBuilder',
                        dependencies: ['WidgetsTray'],
                        enabledDependentPlugins: [],
                        children: [],
                        parent: 'Widgets',
                        enabled: true,
                        isUserPlugin: false,
                        active: false
                    }, {
                        name: 'WidgetsTray',
                        dependencies: [],
                        children: [],
                        enabledDependentPlugins: [],
                        forcedMandatory: true,
                        parent: 'Widgets',
                        enabled: true,
                        isUserPlugin: false,
                        active: false
                    }]
                }, {
                    name: 'ZoomIn',
                    dependencies: [],
                    enabledDependentPlugins: [],
                    children: [],
                    enabled: true,
                    isUserPlugin: true,
                    active: false
                }, {
                    name: 'ZoomOut',
                    dependencies: [],
                    enabledDependentPlugins: [],
                    children: [],
                    enabled: false,
                    isUserPlugin: false,
                    active: false
                }]
            }
        }, done);
    });
    it('disablePluginsEpic with transitive dependencies', (done) => {
        const pluginsToDisable = ['Widgets'];
        const startActions = [disablePlugins(pluginsToDisable)];
        testEpic(disablePluginsEpic, 6, startActions, actions => {
            expect(actions.length).toBe(6);
            expect(actions[0].type).toBe(CHANGE_PLUGINS_KEY);
            expect(actions[0].ids.sort()).toEqual(['BurgerMenu', 'CheeseburgerMenu', 'OmniBar', 'Widgets', 'WidgetsBuilder', 'WidgetsTray']);
            expect(actions[0].key).toBe('enabled');
            expect(actions[0].value).toBe(false);

            const enabledDependentPluginsActions = actions.slice(1, 5);
            enabledDependentPluginsActions.sort((x, y) => x.ids[0] < y.ids[0] ? -1 : x.ids[0] > y.ids[0] ? 1 : 0);

            expect(enabledDependentPluginsActions[0].type).toBe(CHANGE_PLUGINS_KEY);
            expect(enabledDependentPluginsActions[0].ids).toEqual(['BurgerMenu']);
            expect(enabledDependentPluginsActions[0].key).toBe('enabledDependentPlugins');
            expect(enabledDependentPluginsActions[0].value).toEqual([]);
            expect(enabledDependentPluginsActions[1].type).toBe(CHANGE_PLUGINS_KEY);
            expect(enabledDependentPluginsActions[1].ids).toEqual(['CheeseburgerMenu']);
            expect(enabledDependentPluginsActions[1].key).toBe('enabledDependentPlugins');
            expect(enabledDependentPluginsActions[1].value).toEqual([]);
            expect(enabledDependentPluginsActions[2].type).toBe(CHANGE_PLUGINS_KEY);
            expect(enabledDependentPluginsActions[2].ids).toEqual(['OmniBar']);
            expect(enabledDependentPluginsActions[2].key).toBe('enabledDependentPlugins');
            expect(enabledDependentPluginsActions[2].value).toEqual([]);
            expect(enabledDependentPluginsActions[3].type).toBe(CHANGE_PLUGINS_KEY);
            expect(enabledDependentPluginsActions[3].ids).toEqual(['WidgetsTray']);
            expect(enabledDependentPluginsActions[3].key).toBe('enabledDependentPlugins');
            expect(enabledDependentPluginsActions[3].value).toEqual([]);

            expect(actions[5].type).toBe(CHANGE_PLUGINS_KEY);
            expect(actions[5].key).toBe('forcedMandatory');
            expect(actions[5].ids.sort()).toEqual(['BurgerMenu', 'CheeseburgerMenu', 'OmniBar', 'WidgetsTray']);
            expect(actions[5].value).toBe(false);
        }, {
            contextcreator: {
                plugins: [{
                    name: 'Widgets',
                    dependencies: ['BurgerMenu'],
                    enabledDependentPlugins: [],
                    enabled: true,
                    isUserPlugin: false,
                    active: true,
                    autoEnableChildren: [],
                    children: [{
                        name: 'WidgetsBuilder',
                        dependencies: ['WidgetsTray'],
                        enabledDependentPlugins: [],
                        parent: 'Widgets',
                        enabled: true,
                        isUserPlugin: false,
                        active: false,
                        autoEnableChildren: [],
                        children: []
                    }, {
                        name: 'WidgetsTray',
                        dependencies: [],
                        enabledDependentPlugins: ['WidgetsBuilder'],
                        parent: 'Widgets',
                        enabled: true,
                        isUserPlugin: false,
                        active: false,
                        autoEnableChildren: [],
                        children: []
                    }]
                }, {
                    name: 'ZoomIn',
                    dependencies: [],
                    enabledDependentPlugins: [],
                    enabled: true,
                    isUserPlugin: true,
                    active: false,
                    autoEnableChildren: [],
                    children: []
                }, {
                    name: 'OmniBar',
                    dependencies: [],
                    enabledDependentPlugins: ['BurgerMenu'],
                    enabled: true,
                    isUserPlugin: false,
                    active: false,
                    autoEnableChildren: [],
                    children: []
                }, {
                    name: 'BurgerMenu',
                    dependencies: ['OmniBar', 'CheeseburgerMenu'],
                    enabledDependentPlugins: ['Widgets'],
                    enabled: true,
                    isUserPlugin: false,
                    active: false,
                    autoEnableChildren: [],
                    children: []
                }, {
                    name: 'CheeseburgerMenu',
                    dependencies: [],
                    enabledDependentPlugins: ['BurgerMenu'],
                    enabled: true,
                    isUserPlugin: false,
                    active: false,
                    autoEnableChildren: [],
                    children: []
                }, {
                    name: 'ZoomOut',
                    dependencies: [],
                    enabledDependentPlugins: [],
                    enabled: false,
                    isUserPlugin: false,
                    active: false,
                    autoEnableChildren: [],
                    children: []
                }]
            }
        }, done);
    });
    it('disablePluginsEpic disable all', (done) => {
        const pluginsToDisable = ['Widgets', 'ZoomIn'];
        const startActions = [disablePlugins(pluginsToDisable)];
        testEpic(disablePluginsEpic, 4, startActions, actions => {
            expect(actions.length).toBe(4);
            expect(actions[0].type).toBe(CHANGE_PLUGINS_KEY);
            expect(actions[0].ids).toEqual(['Widgets', 'WidgetsBuilder', 'WidgetsTray', 'ZoomIn', 'ZoomOut']);
            expect(actions[0].key).toBe('enabled');
            expect(actions[0].value).toBe(false);
            expect(actions[1].type).toBe(CHANGE_PLUGINS_KEY);
            expect(actions[1].ids).toEqual(['Widgets', 'WidgetsBuilder', 'WidgetsTray', 'ZoomIn', 'ZoomOut']);
            expect(actions[1].key).toBe('enabledDependentPlugins');
            expect(actions[1].value).toEqual([]);
            expect(actions[2].type).toBe(CHANGE_PLUGINS_KEY);
            expect(actions[1].ids).toEqual(['Widgets', 'WidgetsBuilder', 'WidgetsTray', 'ZoomIn', 'ZoomOut']);
            expect(actions[2].key).toBe('forcedMandatory');
            expect(actions[2].value).toBe(false);
            expect(actions[3].type).toBe(ENABLE_MANDATORY_PLUGINS);
        }, {
            contextcreator: {
                plugins: [{
                    name: 'Widgets',
                    dependencies: ["WidgetsBuilder"],
                    enabled: true,
                    isUserPlugin: false,
                    active: false,
                    children: [{
                        name: 'WidgetsBuilder',
                        dependencies: [],
                        enabledDependentPlugins: ['Widgets'],
                        parent: 'Widgets',
                        enabled: true,
                        forcedMandatory: true,
                        isUserPlugin: false,
                        active: false
                    }, {
                        name: 'WidgetsTray',
                        dependencies: [],
                        parent: 'Widgets',
                        enabled: false,
                        isUserPlugin: false,
                        active: false
                    }]
                }, {
                    name: 'ZoomIn',
                    dependencies: [],
                    enabled: true,
                    isUserPlugin: true,
                    active: false
                }, {
                    name: 'ZoomOut',
                    dependencies: [],
                    enabled: false,
                    isUserPlugin: false,
                    active: false
                }]
            }
        }, done);
    });
    it('upload plugin bundle', (done) => {
        mockAxios.onPost().reply(200, { "myplugin": {}});
        const startActions = [uploadPlugin([{name: "myplugin.zip", file: new Blob([""], {type: "text/plain"})}])];
        testEpic(uploadPluginEpic, 3, startActions, actions => {
            expect(actions.length).toBe(3);
            expect(actions[0].type).toBe(UPLOADING_PLUGIN);
            expect(actions[0].status).toBe(true);
            expect(actions[0].plugins.length).toBe(1);
            expect(actions[0].plugins[0]).toBe("myplugin.zip");
            expect(actions[1].type).toBe(PLUGIN_UPLOADED);
            expect(actions[1].plugins.length).toBe(1);
            expect(actions[1].plugins[0].myplugin).toExist();
            expect(actions[2].type).toBe(UPLOADING_PLUGIN);
            expect(actions[2].status).toBe(false);
            expect(actions[2].plugins.length).toBe(1);
            expect(actions[2].plugins[0]).toBe("myplugin.zip");
            done();
        }, {
            contextcreator: {}
        });
    });
    it('uninstall plugin', (done) => {
        mockAxios.onDelete().reply(200, { "myplugin": {}});
        const startActions = [uninstallPlugin("My")];
        testEpic(uninstallPluginEpic, 4, startActions, actions => {
            expect(actions.length).toBe(4);
            expect(actions[0].type).toBe(UNINSTALLING_PLUGIN);
            expect(actions[0].status).toBe(true);
            expect(actions[0].plugin).toBe("My");
            expect(actions[1].type).toBe(PLUGIN_UNINSTALLED);
            expect(actions[1].plugin).toBe("My");
            expect(actions[1].cfg).toExist();
            expect(actions[2].type).toBe(SHOW_DIALOG);
            expect(actions[2].dialogName).toBe("confirmRemovePlugin");
            expect(actions[2].show).toBe(false);
            expect(actions[3].type).toBe(UNINSTALLING_PLUGIN);
            expect(actions[3].status).toBe(false);
            expect(actions[3].plugin).toBe("My");
            done();
        }, {
            contextcreator: {}
        });
    });
    it('saveTemplateEpic', (done) => {
        mockAxios.onPut().reply(200, {});
        const startActions = [saveTemplate({id: 1, metadata: {}})];
        testEpic(saveTemplateEpic, 5, startActions, actions => {
            expect(actions.length).toBe(5);
            expect(actions[0].type).toBe(LOADING);
            expect(actions[0].name).toBe('templateSaving');
            expect(actions[0].value).toBe(true);
            expect(actions[1].type).toBe(LOAD_TEMPLATE);
            expect(actions[1].id).toBe(1);
            expect(actions[2].type).toBe(SHOW_DIALOG);
            expect(actions[2].dialogName).toBe('uploadTemplate');
            expect(actions[2].show).toBe(false);
            expect(actions[3].type).toBe(SHOW_NOTIFICATION);
            expect(actions[4].type).toBe(LOADING);
            expect(actions[4].name).toBe('templateSaving');
        }, {
            contextcreator: {}
        }, done);
    });
    it('saveTemplateEpic with missing category', (done) => {
        let posted = false;
        mockAxios.onPut().reply(() => {
            return posted ? [200, {}] : [404, "Resource Category not found"];
        });
        mockAxios.onPost().reply(() => {
            posted = true;
            return [200, {}];
        });
        const startActions = [saveTemplate({id: 1, metadata: {}})];
        testEpic(saveTemplateEpic, 5, startActions, actions => {
            expect(actions.length).toBe(5);
            expect(actions[0].type).toBe(LOADING);
            expect(actions[0].name).toBe('templateSaving');
            expect(actions[0].value).toBe(true);
            expect(actions[1].type).toBe(LOAD_TEMPLATE);
            expect(actions[1].id).toBe(1);
            expect(actions[2].type).toBe(SHOW_DIALOG);
            expect(actions[2].dialogName).toBe('uploadTemplate');
            expect(actions[2].show).toBe(false);
            expect(actions[3].type).toBe(SHOW_NOTIFICATION);
            expect(actions[4].type).toBe(LOADING);
            expect(actions[4].name).toBe('templateSaving');
            expect(actions[4].value).toBe(false);
        }, {
            contextcreator: {}
        }, done);
    });
    it('checkIfContextExists when it exists', (done) => {
        mockAxios.onPost('/extjs/search/list').reply(200, {
            ExtResourceList: {
                Resource: {
                    id: 10
                },
                ResourceCount: 1
            }
        });
        const startActions = [changeAttribute('name', 'context')];
        testEpic(checkIfContextExists, 5, startActions, actions => {
            expect(actions.length).toBe(5);
            expect(actions[0].type).toBe(LOADING);
            expect(actions[0].name).toBe('contextNameCheck');
            expect(actions[0].value).toBe(true);
            expect(actions[1].type).toBe(SHOW_NOTIFICATION);
            expect(actions[2].type).toBe(IS_VALID_CONTEXT_NAME);
            expect(actions[2].valid).toBe(false);
            expect(actions[3].type).toBe(LOADING);
            expect(actions[3].name).toBe('contextNameCheck');
            expect(actions[3].value).toBe(false);
            expect(actions[4].type).toBe(CONTEXT_NAME_CHECKED);
            expect(actions[4].checked).toBe(true);
        }, {
            contextcreator: {
                resource: {
                    name: 'context'
                }
            }
        }, done);
    });
    it('checkIfContextExists when it exists and ids are the same', (done) => {
        mockAxios.onPost('/extjs/search/list').reply(200, {
            ExtResourceList: {
                Resource: {
                    id: 10
                },
                ResourceCount: 1
            }
        });
        const startActions = [changeAttribute('name', 'context')];
        testEpic(checkIfContextExists, 4, startActions, actions => {
            expect(actions.length).toBe(4);
            expect(actions[0].type).toBe(LOADING);
            expect(actions[0].name).toBe('contextNameCheck');
            expect(actions[0].value).toBe(true);
            expect(actions[1].type).toBe(IS_VALID_CONTEXT_NAME);
            expect(actions[1].valid).toBe(true);
            expect(actions[2].type).toBe(LOADING);
            expect(actions[2].name).toBe('contextNameCheck');
            expect(actions[2].value).toBe(false);
            expect(actions[3].type).toBe(CONTEXT_NAME_CHECKED);
            expect(actions[3].checked).toBe(true);
        }, {
            contextcreator: {
                resource: {
                    id: 10,
                    name: 'context'
                }
            }
        }, done);
    });
    it('checkIfContextExists when it does not exist', (done) => {
        mockAxios.onPost('/extjs/search/list').reply(200, {
            ExtResourceList: {
                ResourceCount: 0
            }
        });
        const startActions = [changeAttribute('name', 'context')];
        testEpic(checkIfContextExists, 4, startActions, actions => {
            expect(actions.length).toBe(4);
            expect(actions[0].type).toBe(LOADING);
            expect(actions[0].name).toBe('contextNameCheck');
            expect(actions[0].value).toBe(true);
            expect(actions[1].type).toBe(IS_VALID_CONTEXT_NAME);
            expect(actions[1].valid).toBe(true);
            expect(actions[2].type).toBe(LOADING);
            expect(actions[2].name).toBe('contextNameCheck');
            expect(actions[2].value).toBe(false);
            expect(actions[3].type).toBe(CONTEXT_NAME_CHECKED);
            expect(actions[3].checked).toBe(true);
        }, {
            contextcreator: {
                resource: {
                    name: 'context'
                }
            }
        }, done);
    });
    it('saveContextResource saves a context', (done) => {
        mockAxios.onPost().reply(200, "1");
        mockAxios.onGet().reply(200, {});
        const startActions = [saveNewContext("/")];
        testEpic(saveContextResource, 5, startActions, actions => {
            expect(actions.length).toBe(5);
            expect(actions[0].type).toBe(LOADING);
            expect(actions[1].type).toBe(CONTEXT_SAVED);
            expect(actions[1].id).toBe(1);
            expect(actions[2].type).toBe("@@router/CALL_HISTORY_METHOD");
            expect(actions[3].type).toBe(LOAD_EXTENSIONS);
            expect(actions[4].type).toBe(LOADING);
        }, {
            contextcreator: {
                resource: {
                    name: 'context'
                }
            },
            map: {}
        }, done);
    });
    it('saveContextResource with an error', (done) => {
        mockAxios.onPost().reply(404);
        const startActions = [saveNewContext("/")];
        testEpic(saveContextResource, 3, startActions, actions => {
            expect(actions.length).toBe(3);
            expect(actions[0].type).toBe(LOADING);
            expect(actions[1].type).toBe(SHOW_NOTIFICATION);
            expect(actions[1].level).toBe('error');
            expect(actions[2].type).toBe(LOADING);
        }, {
            contextcreator: {
                resource: {
                    name: 'context'
                }
            },
            map: {}
        }, done);
    });
    it('editTemplateEpic with id', (done) => {
        mockAxios.onGet().reply(200, 'data');
        const startActions = [editTemplate(1)];
        testEpic(editTemplateEpic, 6, startActions, actions => {
            expect(actions.length).toBe(6);
            expect(actions[0].type).toBe(LOADING);
            expect(actions[1].type).toBe(SET_EDITED_TEMPLATE);
            expect(actions[1].id).toBe(1);
            expect(actions[2].type).toBe(SET_PARSED_TEMPLATE);
            expect(actions[2].data).toBe('data');
            expect(actions[2].format).toBe('json');
            expect(actions[3].type).toBe(SET_FILE_DROP_STATUS);
            expect(actions[3].status).toBe('accepted');
            expect(actions[4].type).toBe(SHOW_DIALOG);
            expect(actions[4].dialogName).toBe('uploadTemplate');
            expect(actions[4].show).toBe(true);
            expect(actions[5].type).toBe(LOADING);
        }, {
            contextcreator: {
                newContext: {
                    templates: [{
                        id: 1,
                        format: 'json'
                    }]
                }
            }
        }, done);
    });
    it('editTemplateEpic without id', (done) => {
        const startActions = [editTemplate()];
        testEpic(editTemplateEpic, 4, startActions, actions => {
            expect(actions.length).toBe(4);
            expect(actions[0].type).toBe(LOADING);
            expect(actions[1].type).toBe(SET_EDITED_TEMPLATE);
            expect(actions[1].id).toNotExist();
            expect(actions[2].type).toBe(SHOW_DIALOG);
            expect(actions[2].dialogName).toBe('uploadTemplate');
            expect(actions[2].show).toBe(true);
            expect(actions[3].type).toBe(LOADING);
        }, {
            contextcreator: {
                newContext: {
                    templates: []
                }
            }
        }, done);
    });
});
