/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import assign from 'object-assign';

import { uniq } from 'lodash';
import { createSelector } from 'reselect';

export const rulesSelector = (state) => {
    if (!state.rulesmanager || !state.rulesmanager.rules) {
        return [];
    }
    const rules = state.rulesmanager.rules;
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

export const optionsSelector = (state) => {
    const stateOptions = state.rulesmanager && state.rulesmanager.options || {};
    const options = {};
    options.roles = stateOptions.roles;
    options.users = stateOptions.users && stateOptions.users.map(user => user.userName);
    options.workspaces = stateOptions.workspaces
        && stateOptions.workspaces.map(workspace => workspace.name);
    options.layers = stateOptions.layers && stateOptions.layers.records
        && uniq(stateOptions.layers.records.map(layer => layer.dc.identifier.replace(/^.*?:/g, '')));
    options.layersPage = stateOptions.layersPage || 1;
    options.layersCount = stateOptions.layersCount || 0;
    return options;
};
export const EMPTY_FILTERS = {};
export const filterSelector = (state) => state.rulesmanager && state.rulesmanager.filters || EMPTY_FILTERS;
export const selectedRules = (state) => state.rulesmanager && state.rulesmanager.selectedRules || [];
export const activeRuleSelector = (state) => state.rulesmanager && state.rulesmanager.activeRule;
export const servicesConfigSel = (state) => state.rulesmanager && state.rulesmanager.services;
export const servicesSelector = createSelector(servicesConfigSel, (services) => ( services && Object.keys(services).map(service => ({value: service, label: service}))
));
export const targetPositionSelector = (state) => state.rulesmanager && state.rulesmanager.targetPosition || EMPTY_FILTERS;
export const rulesEditorToolbarSelector = createSelector(selectedRules, targetPositionSelector, (sel, {offsetFromTop}) => {
    return {
        showAdd: sel.length === 0,
        showEdit: sel.length === 1,
        showInsertBefore: sel.length === 1 && offsetFromTop !== 0,
        showInsertAfter: sel.length === 1,
        showDel: sel.length > 0,
        showCache: sel.length === 0
    };
});
export const isRulesManagerConfigured = state => state.localConfig && state.localConfig.plugins && !!state.localConfig.plugins.rulesmanager;
export const isEditorActive = state => state.rulesmanager && !!state.rulesmanager.activeRule;
export const triggerLoadSel = state => state.rulesmanager && state.rulesmanager.triggerLoad;
export const isLoading = state => state.rulesmanager && state.rulesmanager.loading;
export const geometryStateSel = state => state.rulesmanager && state.rulesmanager.geometryState;
