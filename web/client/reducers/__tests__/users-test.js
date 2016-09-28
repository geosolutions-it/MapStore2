/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

const users = require('../users');
const {
    USERMANAGER_GETUSERS, USERMANAGER_EDIT_USER, USERMANAGER_EDIT_USER_DATA
} = require('../../actions/users');

describe('Test the users reducer', () => {
    it('default loading', () => {
        let oldState = {test: "test"};
        const state = users(oldState, {
            type: "TEST_UNKNOWN_ACTION",
            status: 'loading'
        });
        expect(state).toBe(oldState);
    });
    it('set loading', () => {
        const state = users(undefined, {
            type: USERMANAGER_GETUSERS,
            status: 'loading'
        });
        expect(state.status).toBe('loading');
    });
    it('set users', () => {
        const state = users(undefined, {
            type: USERMANAGER_GETUSERS,
            status: 'success',
            users: [],
            totalCount: 0
        });
        expect(state.users).toExist();
        expect(state.users.length).toBe(0);
    });
    it('edit user', () => {
        const state = users(undefined, {
            type: USERMANAGER_EDIT_USER,
            user: {
                name: "user",
                attribute: [{ name: "attr1", value: "value1"}]
            },
            totalCount: 0
        });
        expect(state.currentUser).toExist();
        expect(state.currentUser.name).toBe("user");
        const stateMerge = users({currentUser: {
            id: 1,
            groups: []
        }}, {
            type: USERMANAGER_EDIT_USER,
            status: "success",
            user: {
                id: 1,
                name: "user",
                attribute: [{ name: "attr1", value: "value1"}]
            },
            totalCount: 0
        });
        expect(stateMerge.currentUser).toExist();
        expect(stateMerge.currentUser.id).toBe(1);
        expect(stateMerge.currentUser.name).toBe("user");
        expect(stateMerge.currentUser.groups).toExist();

    });
    it('edit user data', () => {
        const state = users({currentUser: {
            id: 1,
            name: "userName",
            groups: []
        }}, {
            type: USERMANAGER_EDIT_USER_DATA,
            key: "name",
            newValue: "newName"
        });
        expect(state.currentUser).toExist();
        expect(state.currentUser.id).toBe(1);
        expect(state.currentUser.name).toBe("newName");
        const stateMerge = users({currentUser: {
            id: 1,
            name: "userName",
            groups: []
        }}, {
            type: USERMANAGER_EDIT_USER_DATA,
            key: "attribute.attr1",
            newValue: "value2"
        });
        expect(stateMerge.currentUser).toExist();
        expect(stateMerge.currentUser.id).toBe(1);
        expect(stateMerge.currentUser.attribute).toExist();
        expect(stateMerge.currentUser.attribute.length).toBe(1);
        expect(stateMerge.currentUser.attribute[0].value).toBe("value2");
    });

});
