/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

const style = require('../users');
const {
    USERMANAGER_GETUSERS
} = require('../../actions/users');

describe('Test the users reducer', () => {
    it('default loading', () => {
        let oldState = {test: "test"};
        const state = style(oldState, {
            type: "TEST_UNKNOWN_ACTION",
            status: 'loading'
        });
        expect(state).toBe(oldState);
    });
    it('set loading', () => {
        const state = style(undefined, {
            type: USERMANAGER_GETUSERS,
            status: 'loading'
        });
        expect(state.status).toBe('loading');
    });
    it('set users', () => {
        const state = style(undefined, {
            type: USERMANAGER_GETUSERS,
            status: 'success',
            users: [],
            totalCount: 0
        });
        expect(state.users).toExist();
        expect(state.users.length).toBe(0);
    });

});
