/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import assign from 'object-assign';

import get from 'lodash/get';
import castArray from "lodash/castArray";

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
export const userGroupsEnabledSelector = (state) => {
    const securityGroup = userGroupSecuritySelector(state);
    return securityGroup
        ? castArray(securityGroup)
            ?.filter(group => group.enabled)
            ?.map(group => group.groupName)
        : [];
};
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
export const authProviderSelector = state => state.security && state.security.authProvider;

/**
 * Check if user is allowed to edit based on the user's permission
 * and plugin configuration with respect to allowed roles and groups
 * Allow user edit based on the following hierarchy
 * 1.`canEdit` is configured to be `true`
 * 2. User role is `ADMIN`
 * 3. User roles is non-admin and falls in one of the allowed groups configured
 * @param {string[]} editingAllowedRoles
 * @param {string[]} editingAllowedGroups
 * @param {boolean} canEdit
 * @returns {function(*): boolean}
 */
export const isUserAllowedForEditingSelector = ({
    editingAllowedRoles,
    editingAllowedGroups,
    canEdit
})=> (state) => {
    const role = userRoleSelector(state);
    const groups = userGroupsEnabledSelector(state);
    let allowEdit = false;
    if (canEdit) {
        allowEdit = true;
    } else if (castArray(editingAllowedRoles).includes(role)) {
        allowEdit = role === "ADMIN" || (role !== "ADMIN"
            && castArray(editingAllowedGroups)
                .some((group) => groups.includes(group)));
    }
    return allowEdit;
};
