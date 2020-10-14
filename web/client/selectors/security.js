/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import assign from 'object-assign';

import { get } from 'lodash';

export const rulesSelector = (state) => {
    if (!state.security || !state.security.rules) {
        return [];
    }
    const rules = state.security.rules;
    return rules.map(rule => {
        const formattedRule = {};
        assign(formattedRule, {'id': rule.id});
        assign(formattedRule, {'priority': rule.priority});
        assign(formattedRule, {'roleName': rule.roleName ? rule.roleName : '*'});
        assign(formattedRule, {'userName': rule.userName ? rule.userName : '*'});
        assign(formattedRule, {'service': rule.service ? rule.service : '*'});
        assign(formattedRule, {'request': rule.request ? rule.request : '*'});
        assign(formattedRule, {'workspace': rule.workspace ? rule.workspace : '*'});
        assign(formattedRule, {'layer': rule.layer ? rule.layer : '*'});
        assign(formattedRule, {'access': rule.access});
        return formattedRule;
    });
};

export const userSelector = (state) => state && state.security && state.security.user;
export const userGroupSecuritySelector = (state) => get(state, "security.user.groups.group");
export const userRoleSelector = (state) => userSelector(state) && userSelector(state).role;
export const userParamsSelector = (state) => {
    const user = userSelector(state);
    return {
        id: user.id,
        name: user.name
    };
};

export const isLoggedIn = state => state && state.security && state.security.user;
export const securityTokenSelector = state => state.security && state.security.token;
export const isAdminUserSelector = (state) => userRoleSelector(state) === "ADMIN";
export const isUserSelector = (state) => userRoleSelector(state) === "USER";
