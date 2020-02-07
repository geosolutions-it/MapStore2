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
    uploadPluginEpic
} from '../contextcreator';
import {
    editPlugin,
    enablePlugins,
    disablePlugins,
    changePluginsKey,
    uploadPlugin,
    SET_EDITED_PLUGIN,
    SET_EDITED_CFG,
    SET_CFG_ERROR,
    CHANGE_PLUGINS_KEY,
    ENABLE_MANDATORY_PLUGINS,
    PLUGIN_UPLOADED,
    UPLOADING_PLUGIN
} from '../../actions/contextcreator';

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
});
