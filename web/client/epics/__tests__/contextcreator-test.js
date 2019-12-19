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
    editPluginEpic
} from '../contextcreator';
import {
    editPlugin,
    changePluginsKey,
    SET_EDITED_PLUGIN,
    SET_EDITED_CFG,
    SET_CFG_ERROR
} from '../../actions/contextcreator';

describe('contextcreator epics', () => {
    it('resetConfigOnPluginKeyChange', (done) => {
        const startActions = [changePluginsKey(['plugin', 'editedPlugin'], 'enabled', false)];
        testEpic(resetConfigOnPluginKeyChange, 2, startActions, actions => {
            expect(actions.length).toBe(2);
            expect(actions[0].type).toBe(SET_CFG_ERROR);
            expect(actions[0].error).toNotExist();
            expect(actions[1].type).toBe(SET_EDITED_PLUGIN);
            expect(actions[1].pluginName).toNotExist();
            done();
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
        });
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
            done();
        }, {
            contextcreator: {
                editedPlugin: "editedPlugin",
                validationStatus: true
            }
        });
    });
});
