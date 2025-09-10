/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import castArray from "lodash/castArray";
import get from 'lodash/get';

export const rulesSelector = (state) => {
    if (!state.security || !state.security.rules) {
        return [];
    }
    const rules = state.security.rules;
    return rules.map(rule => {
        const formattedRule = {};
        Object.assign(formattedRule, {'id': rule.id});
        Object.assign(formattedRule, {'priority': rule.priority});
        Object.assign(formattedRule, {'roleName': rule.roleName ? rule.roleName : '*'});
        Object.assign(formattedRule, {'userName': rule.userName ? rule.userName : '*'});
        Object.assign(formattedRule, {'service': rule.service ? rule.service : '*'});
        Object.assign(formattedRule, {'request': rule.request ? rule.request : '*'});
        Object.assign(formattedRule, {'workspace': rule.workspace ? rule.workspace : '*'});
        Object.assign(formattedRule, {'layer': rule.layer ? rule.layer : '*'});
        Object.assign(formattedRule, {'access': rule.access});
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
 * Creates a selector that checks if user is allowed to edit
 * something based on the user's role and groups
 * by passing the authorized roles and groups as parameter for selector creation.
 * @param {string[]} allowedRoles array of roles allowed. Supports predefined ("ADMIN", "USER", "ALL") and custom roles
 * @param {string[]} allowedGroups array of user group names allowed
 * @returns {function(*): boolean}
 */
export const isUserAllowedSelectorCreator = ({
    allowedRoles,
    allowedGroups
})=> (state) => {
    const role = userRoleSelector(state);
    const groups = userGroupsEnabledSelector(state);
    return (
        castArray(allowedRoles).includes('ALL')
        || castArray(allowedRoles).includes(role)
        || castArray(allowedGroups)
            .some((group) => groups.includes(group))
    );
};

export const showModalSelector = state => {
    return state?.security?.showModalSecurityPopup;
};
export const protectedServicesSelector = state => {
    return state?.security?.protectedServices || [];
};

export const dashboardProtectedIdSelector = state => {
    return state?.dashboard?.protectedId;
};
