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
    CHANGE_PLUGINS_KEY,
    SET_EDITED_PLUGIN,
    SET_EDITED_CFG
} from '../../actions/contextcreator';

describe('contextcreator epics', () => {
    it('resetConfigOnPluginKeyChange', (done) => {
        const startActions = [changePluginsKey(['plugin', 'editedPlugin'], 'enabled', false)];
        testEpic(resetConfigOnPluginKeyChange, 1, startActions, actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe(SET_EDITED_PLUGIN);
            expect(actions[0].pluginName).toNotExist();
            done();
        }, {
            contextcreator: {
                editedPlugin: 'editedPlugin'
            }
        });
    });
    it('editPluginEpic', (done) => {
        const pluginName = 'pluginName';
        const startActions = [editPlugin(pluginName)];
        testEpic(editPluginEpic, 3, startActions, actions => {
            expect(actions.length).toBe(3);
            expect(actions[0].type).toBe(CHANGE_PLUGINS_KEY);
            expect(actions[0].ids).toEqual(["editedPlugin"]);
            expect(actions[0].key).toBe('pluginConfig.cfg');
            expect(actions[0].value).toEqual({});
            expect(actions[1].type).toBe(SET_EDITED_PLUGIN);
            expect(actions[1].pluginName).toBe(pluginName);
            expect(actions[2].type).toBe(SET_EDITED_CFG);
            expect(actions[2].pluginName).toBe(pluginName);
            done();
        }, {
            contextcreator: {
                editedPlugin: "editedPlugin",
                editedCfg: "{}"
            }
        });
    });
});
