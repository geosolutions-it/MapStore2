/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

const plugins = require('../plugins');

describe('Test the plugins reducer', () => {
    it('load plugins', () => {
        const state = plugins({}, {type: 'LOAD_PLUGINS', plugins: {MyPlugin: {}}});
        expect(state.MyPlugin).toExist();
    });
});
