/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import {findIndex, flatten, omit} from 'lodash';

import { createStateMocker } from './reducersTestUtils';

import contextcreator from '../contextcreator';
import {
    enabledPluginsFilterTextSelector,
    newContextSelector,
    mapConfigSelector,
    resourceSelector,
    pluginsSelector,
    editedPluginSelector,
    editedCfgSelector
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
    changeAttribute
} from '../../actions/contextcreator';

const testContextResource = {
    data: {
        windowTitle: 'title',
        mapConfig: {},
        plugins: {
            desktop: [{
                name: 'Catalog',
                cfg: {
                    parameter: true,
                    anotherParameter: "someInterestingValue"
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
}];

const pluginsConfig = {plugins: defaultPlugins};

const findPlugins = (plugins = [], predicate = () => {}) =>
    [...plugins.filter(plugin => predicate(plugin)).map(plugin => omit(plugin, 'children')),
        ...flatten(plugins.filter(plugin => plugin.children !== undefined).map(plugin => findPlugins(plugin.children, predicate)))];

describe('contextcreator reducer', () => {
    const stateMocker = createStateMocker({contextcreator});
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
        const state = stateMocker(setResource(testContextResource, pluginsConfig));
        const {data, ...resource} = testContextResource;
        const newContext = newContextSelector(state);
        const plugins = pluginsSelector(state);
        expect(newContext).toExist();
        expect(newContext.windowTitle).toBe(data.windowTitle);
        expect(newContext.plugins).toNotExist();
        expect(newContext.userPlugins).toNotExist();
        expect(mapConfigSelector(state)).toEqual(data.mapConfig);
        expect(resourceSelector(state)).toEqual(resource);
        expect(plugins).toExist();
        expect(plugins.length).toBe(3);
        expect(plugins[0].name).toBe(defaultPlugins[0].name);
        expect(plugins[0].title).toBe(defaultPlugins[0].title);
        expect(plugins[0].enabled).toBe(false);
        expect(plugins[0].isUserPlugin).toBe(false);
        expect(plugins[0].active).toBe(false);
        expect(plugins[0].pluginConfig).toExist();
        expect(plugins[0].pluginConfig.name).toBe(defaultPlugins[0].name);
        expect(plugins[0].pluginConfig.cfg).toEqual(data.plugins.desktop[0].cfg);
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
        expect(plugins[2].name).toBe(defaultPlugins[2].name);
        expect(plugins[2].title).toBe(defaultPlugins[2].title);
        expect(plugins[2].enabled).toBe(false);
        expect(plugins[2].isUserPlugin).toBe(false);
        expect(plugins[2].active).toBe(false);
        expect(plugins[2].pluginConfig).toExist();
        expect(plugins[2].pluginConfig.name).toEqual(defaultPlugins[2].name);
        expect(plugins[2].pluginConfig.cfg).toEqual(defaultPlugins[2].defaultConfig);
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
        expect(editedCfgSelector(state)).toBe('{}');
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
});
