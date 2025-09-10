/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    editGroup,
    EDITGROUP,
    changeGroupMetadata,
    EDITGROUPDATA,
    saveGroup,
    UPDATEGROUP,
    deleteGroup,
    DELETEGROUP,
    STATUS_DELETED,
    searchUsers,
    SEARCHUSERS,
    updateUserGroups,
    UPDATE_USER_GROUPS,
    updateUserGroupsMetadata,
    UPDATE_USER_GROUPS_METADATA,
    loadingUserGroups,
    LOADING_USER_GROUPS,
    searchUserGroups,
    SEARCH_USER_GROUPS,
    resetSearchUserGroups,
    RESET_SEARCH_USER_GROUPS
} from '../usergroups';

import GeoStoreDAO from '../../api/GeoStoreDAO';
let oldAddBaseUri = GeoStoreDAO.addBaseUrl;

describe('Test correctness of the usergroups actions', () => {
    beforeEach(() => {
        GeoStoreDAO.addBaseUrl = (options) => {
            return Object.assign(options, {baseURL: 'base/web/client/test-resources/geostore/'});
        };
    });

    afterEach(() => {
        GeoStoreDAO.addBaseUrl = oldAddBaseUri;
    });

    it('updateUserGroups', () => {
        const userGroups = [{ id: '01' }];
        const action = updateUserGroups(userGroups);
        expect(action.type).toBe(UPDATE_USER_GROUPS);
        expect(action.userGroups).toBe(userGroups);
    });

    it('updateUserGroupsMetadata', () => {
        const metadata = {};
        const action = updateUserGroupsMetadata(metadata);
        expect(action.type).toBe(UPDATE_USER_GROUPS_METADATA);
        expect(action.metadata).toBe(metadata);
    });

    it('loadingUserGroups', () => {
        const action = loadingUserGroups(true);
        expect(action.type).toBe(LOADING_USER_GROUPS);
        expect(action.loading).toBe(true);
    });

    it('searchUserGroups', () => {
        const params = { q: '' };
        let action = searchUserGroups({ params });
        expect(action.type).toBe(SEARCH_USER_GROUPS);
        expect(action.params).toBe(params);
        action = searchUserGroups({ refresh: true });
        expect(action.refresh).toBe(true);
        action = searchUserGroups({ clear: true });
        expect(action.clear).toBe(true);
    });

    it('resetSearchUserGroups', () => {
        const action = resetSearchUserGroups();
        expect(action.type).toBe(RESET_SEARCH_USER_GROUPS);
    });

    it('edit UserGroup', (done) => {
        const retFun = editGroup({id: 1});
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            expect(action.type).toBe(EDITGROUP);
            count++;
            if (count === 2) {
                expect(action.group).toExist();
                expect(action.status).toBe("success");
                done();
            }
        });
    }, {security: {user: {role: "ADMIN"}}});

    it('edit UserGroup new', (done) => {
        let template = {groupName: "hello"};
        const retFun = editGroup(template);
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            expect(action.type).toBe(EDITGROUP);
            count++;
            if (count === 1) {
                expect(action.group).toExist();
                expect(action.group).toBe(template);
                done();
            }
        });
    });

    it('close UserGroup edit', (done) => {
        const retFun = editGroup();
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            expect(action.type).toBe(EDITGROUP);
            count++;
            if (count === 1) {
                expect(action.group).toNotExist();
                expect(action.status).toNotExist();
                done();
            }
        });
    });

    it('edit UserGroup error', (done) => {
        const retFun = editGroup({id: 99999});
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            expect(action.type).toBe(EDITGROUP);
            count++;
            if (count === 2) {
                expect(action.error).toExist();
                expect(action.status).toBe("error");
                done();
            }
        });
    });

    it('change usergroup metadata', () => {
        const action = changeGroupMetadata("groupName", "New Group Name");
        expect(action).toExist();
        expect(action.type).toBe(EDITGROUPDATA);
        expect(action.key).toBe("groupName");
        expect(action.newValue).toBe("New Group Name");

    });

    it('update usergroup', (done) => {
        // 1# is a workaround to skip the trailing slash of the request
        // that can not be managed by the test-resources
        const retFun = saveGroup({id: "1#", newUsers: [{id: 100, name: "name1"}]});
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            if (action.type) {
                expect(action.type).toBe(UPDATEGROUP);
            }
            count++;
            if (count === 2) {
                expect(action.group).toExist();
                expect(action.status).toBe("saved");
            }
            if (count === 3) {
                // the third call is for update list
                done();
            }
        });
    });
    it('create usergroup', (done) => {
        GeoStoreDAO.addBaseUrl = (options) => {
            return Object.assign(options, {baseURL: 'base/web/client/test-resources/geostore/usergroups/newGroup.txt#'});
        };
        const retFun = saveGroup({groupName: "TEST"});
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            if (action.type) {
                expect(action.type).toBe(UPDATEGROUP);
            }
            count++;
            if (count === 2) {
                expect(action.group).toExist();
                expect(action.group.id).toExist();
                expect(action.group.id).toBe(1);
                expect(action.status).toBe("created");
            }
            if (count === 3) {
                // the third call is for update list
                done();
            }
        });
    });
    it('create usergroup with groups', (done) => {
        GeoStoreDAO.addBaseUrl = (options) => {
            return Object.assign(options, {baseURL: 'base/web/client/test-resources/geostore/usergroups/newGroup.txt#'});
        };
        const retFun = saveGroup({groupName: "TEST", newUsers: [{id: 100, name: "name1"}]});
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            if (action.type) {
                expect(action.type).toBe(UPDATEGROUP);
            }
            count++;
            if (count === 2) {
                expect(action.group).toExist();
                expect(action.group.id).toExist();
                expect(action.group.id).toBe(1);
                expect(action.status).toBe("created");
            }
            if (count === 3) {
                // the third call is for update list
                done();
            }
        });
    });

    it('delete Group', (done) => {
        let confirm = deleteGroup(1);
        expect(confirm).toExist();
        expect(confirm.status).toBe("confirm");
        const retFun = deleteGroup(1, "delete");
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            if (action.type) {
                expect(action.type).toBe(DELETEGROUP);
            }
            count++;
            if (count === 2) {
                expect(action.status).toExist();
                expect(action.status).toBe(STATUS_DELETED);
                expect(action.id).toBe(1);
                done();
            }
            if (count === 3) {
                // the third call is for update list
                done();
            }
        });
    });
    it('search users', (done) => {
        const retFun = searchUsers('users.json', 0, 10, {params: {start: 0, limit: 10}}, "");
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            expect(action.type).toBe(SEARCHUSERS);
            count++;
            if (count === 2) {
                expect(action.users).toExist();
                expect(action.users[0]).toExist();
                expect(action.users[0].groups).toExist();
                done();
            }
        });
    });
    it('search users', (done) => {
        const retFun = searchUsers('MISSING_LINK', {params: {start: 0, limit: 10}});
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            expect(action.type).toBe(SEARCHUSERS);
            count++;
            if (count === 2) {
                expect(action.error).toExist();
                done();
            }
        });
    });
});
