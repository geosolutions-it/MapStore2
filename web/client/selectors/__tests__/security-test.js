/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';

import {
    userSelector,
    userRoleSelector,
    isAdminUserSelector,
    rulesSelector,
    securityTokenSelector,
    userGroupSecuritySelector,
    userParamsSelector,
    userGroupsEnabledSelector,
    isUserAllowedSelectorCreator,
    showModalSelector,
    protectedServicesSelector,
    dashboardProtectedIdSelector
} from '../security';

const id = 1833;
const name = 'teo';
const role = 'ADMIN';
const user = {
    enabled: true,
    groups: {
        group: {
            description: 'description',
            enabled: true,
            groupName: 'everyone',
            id: 479
        }
    },
    id,
    name,
    role
};

let initialState = {
    security: {
        user,
        errorCause: null,
        token: 'c8cecaeb-0fac-43b9-9c50-8a1984d86c34',
        authHeader: 'Basic dGVvOnRlbw==',
        loginError: null,
        refresh_token: '5beb9639-8cff-48d1-8a41-023b692eaa42',
        expires: 1501145853,
        rules: []
    }
};

describe('Test security selectors', () => {
    it('test userSelector', () => {
        const userlogged = userSelector(initialState);
        expect(userlogged).toExist();
        expect(userlogged.id).toBe(id);
        expect(userlogged.name).toBe(name);
        initialState.security.user = null;
        const noLogged = userSelector(initialState);
        expect(noLogged).toBe(null);
        initialState.security.user = user;
    });
    it('test userRoleSelector', () => {
        const roleofuserlogged = userRoleSelector(initialState);
        expect(roleofuserlogged).toExist();
        expect(roleofuserlogged).toBe(role);
    });
    it('test isAdminUserSelector with logged admin user', () => {
        const idAdminLogged = isAdminUserSelector(initialState);
        expect(idAdminLogged).toExist();
        expect(idAdminLogged).toBe(true);
    });
    it('test isAdminUserSelector user not logged', () => {
        initialState.security.user = null;
        const idAdminLogged = isAdminUserSelector(initialState);
        expect(idAdminLogged).toBe(false);
        initialState.security.user = user;
    });
    it('test rulesSelector user ', () => {
        const rules = rulesSelector(initialState);
        expect(rules).toExist();
    });
    it('test securityTokenSelector', () => {
        expect(securityTokenSelector({ security: { token: '########-####-####-####-###########' }})).toBe('########-####-####-####-###########');
        expect(securityTokenSelector({})).toBe(undefined);
    });
    it('test userGroupSecuritySelector ', () => {
        const group = userGroupSecuritySelector(initialState);
        expect(group).toExist();
        expect(group.id).toBe(479);
    });
    it('test userParamsSelector ', () => {
        const userParams = userParamsSelector(initialState);
        expect(userParams).toExist();
        expect(userParams.id).toBe(id);
        expect(userParams.name).toBe(name);
    });
    it('test userGroupsEnabledSelector ', () => {
        const userGroups = userGroupsEnabledSelector(initialState);
        expect(userGroups).toBeTruthy();
        expect(userGroups).toEqual(['everyone']);
    });
    describe('isUserAllowedForEditingSelector', () => {
        const state = {
            security: {
                user: {
                    role: 'USER',
                    groups: {
                        group: {
                            enabled: true,
                            groupName: 'test'
                        }
                    }
                }
            }
        };
        it('test with allowedRole ALL', () => {
            expect(isUserAllowedSelectorCreator({
                allowedRoles: ["ALL"]
            })(state)).toBeTruthy();
        });
        it('test with both role and group matching both allowedRoles and allowedGroups', () => {
            expect(isUserAllowedSelectorCreator({
                allowedRoles: ["USER"],
                allowedGroups: ["test"]
            })(state)).toBeTruthy();
        });
        it('test with role ADMIN and allowedRoles', () => {
            expect(isUserAllowedSelectorCreator({
                allowedRoles: ['ADMIN']
            })({
                security: {
                    user: {
                        role: 'ADMIN',
                        groups: {
                            group: {
                                enabled: true,
                                groupName: 'test'
                            }
                        }
                    }
                }
            })).toBeTruthy();
        });
        it('test with role ADMIN and allowedGroups', () => {
            expect(isUserAllowedSelectorCreator({
                allowedGroups: ['test']
            })({
                security: {
                    user: {
                        role: 'ADMIN',
                        groups: {
                            group: {
                                enabled: true,
                                groupName: 'test'
                            }
                        }
                    }
                }
            })).toBeTruthy();
        });
        it('test with role non-admin and allowedgroups', () => {
            expect(isUserAllowedSelectorCreator({
                allowedGroups: ['test']
            })(state)).toBeTruthy();
        });
        it('test with role non-admin and allowedroles', () => {
            expect(isUserAllowedSelectorCreator({
                allowedRoles: ['USER']
            })(state)).toBeTruthy();
        });
        it('test not allowed for edit', () => {
            expect(isUserAllowedSelectorCreator({
                allowedRoles: ['USER1'],
                allowedGroups: ['some']
            })(state)).toBeFalsy();
        });
    });
    it('test showModalSelector ', () => {
        expect(showModalSelector({
            security: {
                showModalSecurityPopup: true
            }
        })).toBeTruthy();
    });
    it('test protectedServicesSelector  ', () => {
        expect(protectedServicesSelector({
            security: {
                protectedServices: [{id: "1"}]
            }
        })).toEqual([{id: "1"}]);
    });
    it('test dashboardProtectedIdSelector  ', () => {
        expect(dashboardProtectedIdSelector({
            dashboard: {
                protectedId: "1"
            }
        })).toEqual("1");
    });
});
