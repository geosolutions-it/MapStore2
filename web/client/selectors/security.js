/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const assign = require('object-assign');
const {get} = require('lodash');

const rulesSelector = (state) => {
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

const userSelector = (state) => state && state.security && state.security.user;
const userGroupSecuritySelector = (state) => get(state, "security.user.groups.group");
const userRoleSelector = (state) => userSelector(state) && userSelector(state).role;
const userParamsSelector = (state) => {
    const user = userSelector(state);
    return {
        id: user.id,
        name: user.name
    };
};

module.exports = {
    rulesSelector,
    userSelector,
    userParamsSelector,
    isLoggedIn: state => state && state.security && state.security.user,
    userRoleSelector,
    securityTokenSelector: state => state.security && state.security.token,
    userGroupSecuritySelector,
    isAdminUserSelector: (state) => userRoleSelector(state) === "ADMIN",
    isUserSelector: (state) => userRoleSelector(state) === "USER"
};
