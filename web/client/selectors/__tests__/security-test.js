/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {
    userSelector,
    userRoleSelector,
    isAdminUserSelector,
    rulesSelector,
    securityTokenSelector,
    userGroupSecuritySelector,
    userParamsSelector
} = require('../security');
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
});
