/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';


import {
    editUser,
    USERMANAGER_EDIT_USER,
    changeUserMetadata,
    USERMANAGER_EDIT_USER_DATA,
    saveUser,
    USERMANAGER_UPDATE_USER,
    deleteUser,
    USERMANAGER_DELETE_USER,
    updateUsers,
    UPDATE_USERS,
    updateUsersMetadata,
    UPDATE_USERS_METADATA,
    loadingUsers,
    LOADING_USERS,
    searchUsers,
    SEARCH_USERS,
    resetSearchUsers,
    RESET_SEARCH_USERS
} from '../users';

import GeoStoreDAO from '../../api/GeoStoreDAO';
let oldAddBaseUri = GeoStoreDAO.addBaseUrl;

describe('Test correctness of the users actions', () => {
    beforeEach(() => {
        GeoStoreDAO.addBaseUrl = (options) => {
            return Object.assign(options, {baseURL: 'base/web/client/test-resources/geostore/'});
        };
    });

    afterEach(() => {
        GeoStoreDAO.addBaseUrl = oldAddBaseUri;
    });

    it('updateUsers', () => {
        const users = [{ id: '01' }];
        const action = updateUsers(users);
        expect(action.type).toBe(UPDATE_USERS);
        expect(action.users).toBe(users);
    });

    it('updateUsersMetadata', () => {
        const metadata = {};
        const action = updateUsersMetadata(metadata);
        expect(action.type).toBe(UPDATE_USERS_METADATA);
        expect(action.metadata).toBe(metadata);
    });

    it('loadingUsers', () => {
        const action = loadingUsers(true);
        expect(action.type).toBe(LOADING_USERS);
        expect(action.loading).toBe(true);
    });

    it('searchUsers', () => {
        const params = { q: '' };
        let action = searchUsers({ params });
        expect(action.type).toBe(SEARCH_USERS);
        expect(action.params).toBe(params);
        action = searchUsers({ refresh: true });
        expect(action.refresh).toBe(true);
        action = searchUsers({ clear: true });
        expect(action.clear).toBe(true);
    });

    it('resetSearchUsers', () => {
        const action = resetSearchUsers();
        expect(action.type).toBe(RESET_SEARCH_USERS);
    });

    it('editUser', (done) => {
        const retFun = editUser({id: 1});
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            expect(action.type).toBe(USERMANAGER_EDIT_USER);
            count++;
            if (count === 2) {
                expect(action.user).toExist();
                expect(action.status).toBe("success");
                done();
            }
        });
    }, {security: {user: {role: "ADMIN"}}});
    it('editUser with empty string groups', (done) => {
        const retFun = editUser({id: 2});
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            expect(action.type).toBe(USERMANAGER_EDIT_USER);
            count++;
            if (count === 2) {
                expect(action.user).toExist();
                expect(action.status).toBe("success");
                done();
            }
        });
    });

    it('editUser new', (done) => {
        let template = {name: "hello"};
        const retFun = editUser(template);
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            expect(action.type).toBe(USERMANAGER_EDIT_USER);
            count++;
            if (count === 1) {
                expect(action.user).toExist();
                expect(action.user).toBe(template);
                done();
            }
        });
    });

    it('editUser error', (done) => {
        const retFun = editUser({id: 99999});
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            expect(action.type).toBe(USERMANAGER_EDIT_USER);
            count++;
            if (count === 2) {
                expect(action.error).toExist();
                expect(action.status).toBe("error");
                done();
            }
        });
    });
    it('change user metadata', () => {
        const action = changeUserMetadata("name", "newName");
        expect(action).toExist();
        expect(action.type).toBe(USERMANAGER_EDIT_USER_DATA);
        expect(action.key).toBe("name");
        expect(action.newValue).toBe("newName");

    });
    it('saveUser update', (done) => {
        const retFun = saveUser({id: 1});
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            expect(action.type).toBe(USERMANAGER_UPDATE_USER);
            count++;
            if (count === 2) {
                expect(action.user).toExist();
                expect(action.status).toBe("saved");
                done();
            }
        });
    });
    it('saveUser create', (done) => {
        GeoStoreDAO.addBaseUrl = (options) => {
            return Object.assign(options, {baseURL: 'base/web/client/test-resources/geostore/users/newUser.txt#'});
        };
        const retFun = saveUser({name: "test", role: "USER", password: "password"});
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            expect(action.type).toBe(USERMANAGER_UPDATE_USER);
            count++;
            if (count === 2) {
                expect(action.user).toExist();
                expect(action.user.id).toExist();
                expect(action.status).toBe("created");
                done();
            }
        });
    });
    it('saveUser create with groups', (done) => {
        GeoStoreDAO.addBaseUrl = (options) => {
            return Object.assign(options, {baseURL: 'base/web/client/test-resources/geostore/users/newUser.txt#'});
        };
        const retFun = saveUser({name: "test", groups: [{groupName: "everyone"}, {groupName: "testers"}], role: "USER", password: "password"});
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            expect(action.type).toBe(USERMANAGER_UPDATE_USER);
            count++;
            if (count === 2) {
                expect(action.user).toExist();
                expect(action.user.id).toExist();
                expect(action.user.groups).toExist();
                expect(action.user.groups.length).toBe(2);
                done();
            }
        });
    });
    it('saveUser error', (done) => {
        const retFun = saveUser({id: 3});
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            expect(action.type).toBe(USERMANAGER_UPDATE_USER);
            count++;
            if (count === 2) {
                expect(action.user).toExist();
                expect(action.status).toBe("error");
                done();
            }
        });
    });
    it('deleteUser', (done) => {
        let confirm = deleteUser(1);
        expect(confirm).toExist();
        expect(confirm.status).toBe("confirm");
        const retFun = deleteUser(1, "delete");
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            expect(action.type).toBe(USERMANAGER_DELETE_USER);
            count++;
            if (count === 2) {
                expect(action.status).toExist();
                expect(action.id).toBe(1);
                done();
            }
        });
    });

});
