/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import users from '../users';

import {
    USERMANAGER_EDIT_USER,
    USERMANAGER_EDIT_USER_DATA,
    USERMANAGER_UPDATE_USER,
    USERMANAGER_DELETE_USER,
    USERMANAGER_GETGROUPS,
    updateUsers,
    updateUsersMetadata,
    loadingUsers,
    searchUsers,
    resetSearchUsers
} from '../../actions/users';

import { UPDATEGROUP, STATUS_CREATED, DELETEGROUP, STATUS_DELETED } from '../../actions/usergroups';

describe('Test the users reducer', () => {

    it('updateUsers', () => {
        const userItems = [{ id: '01' }];
        const state = users({}, updateUsers(userItems));
        expect(state).toEqual({
            grid: {
                isFirstRequest: false,
                users: userItems
            }
        });
    });

    it('updateUsersMetadata', () => {
        const metadata = { total: 1, isNextPageAvailable: false, params: { q: 'a' }, locationSearch: '?q=a', locationPathname: '/'  };
        const state = users({ grid: { params: { q: 'ab' } } }, updateUsersMetadata(metadata));
        expect(state).toEqual({
            grid: {
                total: 1,
                isNextPageAvailable: false,
                error: undefined,
                params: { q: 'a' },
                previousParams: { q: 'ab' },
                locationSearch: '?q=a',
                locationPathname: '/'
            }
        });
    });

    it('loadingUsers', () => {
        const state = users({}, loadingUsers(true));
        expect(state).toEqual({
            grid: {
                loading: true,
                error: false
            }
        });
    });

    it('searchUsers', () => {
        let state = users({}, searchUsers({ params: { q: 'a' } }));
        expect(state.grid.search.id).toBeTruthy();
        expect(state.grid.search.params).toEqual({ q: 'a' });
        state = users({}, searchUsers({ refresh: true }));
        expect(state.grid.search.id).toBeTruthy();
        expect(state.grid.search.refresh).toBe(true);
        state = users({}, searchUsers({ clear: true }));
        expect(state.grid.search.id).toBeTruthy();
        expect(state.grid.search.clear).toBe(true);
    });

    it('resetSearchUsers', () => {
        const state = users({ grid: { search: { refresh: true } } }, resetSearchUsers());
        expect(state).toEqual({
            grid: {
                search: null
            }
        });
    });

    it('default loading', () => {
        let oldState = {test: "test"};
        const state = users(oldState, {
            type: "TEST_UNKNOWN_ACTION",
            status: 'loading'
        });
        expect(state).toBe(oldState);
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

        // action for a user not related with current.
        let newState = users(stateMerge, {
            type: USERMANAGER_EDIT_USER,
            status: "success",
            user: {
                id: 2,
                name: "NOT_THE_CURRENT_USER",
                attribute: [{ name: "attr1", value: "value1"}]
            },
            totalCount: 0
        });
        expect(newState).toBe(stateMerge);

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
            key: "attribute",
            newValue: [{name: "attr1", value: "value2"}]
        }
        );
        expect(stateMerge.currentUser).toExist();
        expect(stateMerge.currentUser.id).toBe(1);
        expect(stateMerge.currentUser.attribute).toExist();
        expect(stateMerge.currentUser.attribute.length).toBe(1);
        expect(stateMerge.currentUser.attribute[0].value).toBe("value2");
    });
    it('update user data', () => {
        const state = users({currentUser: {
            id: 1,
            name: "userName",
            groups: [{id: 10, groupName: "group"}]
        }}, {
            id: 1,
            name: "userName",
            groups: [{id: 10, groupName: "group"}],
            type: USERMANAGER_UPDATE_USER,
            status: "saved"
        });
        expect(state.currentUser).toExist();
        expect(state.currentUser.id).toBe(1);
    });

    it('delete user', () => {
        const state = users({users: [{
            id: 1,
            name: "userName",
            groups: []
        }]}, {
            type: USERMANAGER_DELETE_USER,
            id: 1,
            status: "delete"
        });
        expect(state.deletingUser).toExist();
        const cancelledState = users(state, {
            type: USERMANAGER_DELETE_USER,
            id: 1,
            status: "cancelled"
        });
        expect(cancelledState.deletingUser).toBe(null);
    });

    it('getGroups', () => {
        const state = users({}, {
            type: USERMANAGER_GETGROUPS,
            groups: [{groupName: "group1", id: 10, description: "test"}],
            status: "success"
        });
        expect(state.groups).toExist();
        expect(state.groupsStatus).toBe("success");
    });
    it('test group cache clean after group creation', () => {
        const state = users({}, {
            type: USERMANAGER_GETGROUPS,
            groups: [{groupName: "group1", id: 10, description: "test"}],
            status: "success"
        });
        expect(state.groups).toExist();
        expect(state.groupsStatus).toBe("success");
        let stateWOutgroups = users(state, {
            type: UPDATEGROUP,
            status: STATUS_CREATED
        });
        expect(stateWOutgroups.group).toBe(undefined);
    });
    it('test group cache clean after group delete', () => {
        const state = users({}, {
            type: USERMANAGER_GETGROUPS,
            groups: [{groupName: "group1", id: 10, description: "test"}],
            status: "success"
        });
        expect(state.groups).toExist();
        expect(state.groupsStatus).toBe("success");
        let stateWOutgroups = users(state, {
            type: DELETEGROUP,
            status: STATUS_DELETED
        });
        expect(stateWOutgroups.group).toBe(undefined);
    });

});
