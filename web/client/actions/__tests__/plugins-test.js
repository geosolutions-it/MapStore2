/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {loadPlugins, LOAD_PLUGINS} = require('../plugins');

describe('Test plugins related actions', () => {
    it('test load plugins action', () => {
        const action = loadPlugins([{}]);

        expect(action).toExist();
        expect(action.type).toBe(LOAD_PLUGINS);
        expect(action.plugins).toExist();
        expect(action.plugins.length).toBe(1);
    });
});
