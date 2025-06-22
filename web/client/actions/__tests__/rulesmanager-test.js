/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    RULES_SELECTED,
    OPTIONS_LOADED,
    UPDATE_FILTERS_VALUES,
    rulesSelected,
    optionsLoaded,
    updateFiltersValues,
    SET_FILTER,
    setFilter,
    SAVE_RULE,
    saveRule,
    cleanEditing,
    CLEAN_EDITING,
    onEditRule,
    EDIT_RULE,
    delRules,
    DELETE_RULES,
    // gs instances
    SWITCH_GRID,
    CLEAN_EDITING_GS_INSTANCE,
    DELETE_GS_INSTSANCES,
    EDIT_GS_INSTSANCES,
    GS_INSTANCES_SELECTED,
    SAVE_GS_INSTANCE,
    STORING_GS_INSTANCES_DD,
    cleanEditingGSInstance,
    delGSInstance,
    gsInstancesSelected,
    onEditGSInstance,
    saveGSInstance,
    updateActiveGrid,
    storeGSInstancesDDList
} from '../rulesmanager';

describe('test rules manager actions', () => {
    it('save rule', () => {
        const rule = {};
        const action = saveRule(rule);
        expect(action).toExist();
        expect(action.type).toBe(SAVE_RULE);
        expect(action.rule).toBe(rule);
    });
    it('clean editing', () => {
        const action = cleanEditing();
        expect(action).toExist();
        expect(action.type).toBe(CLEAN_EDITING);
    });
    it('on edit rule', () => {
        const action = onEditRule();
        expect(action).toExist();
        expect(action.type).toBe(EDIT_RULE);
        expect(action.createNew).toBe(false);
        expect(action.targetPriority).toBe(0);
    });
    it('delete rules', () => {
        const action = delRules();
        expect(action).toExist();
        expect(action.type).toBe(DELETE_RULES);
    });
    it('set Filter', () => {
        const action = setFilter("key", "value");
        expect(action).toExist();
        expect(action.type).toBe(SET_FILTER);
        expect(action.key).toBe("key");
        expect(action.value).toBe("value");
    });
    it('rules selected', () => {
        const rules = [
            { id: "rules1" },
            { id: "rules2" }
        ];
        var action = rulesSelected(rules, true, false);
        expect(action).toExist();
        expect(action.type).toBe(RULES_SELECTED);
        expect(action.rules.length).toBe(2);
        expect(action.rules).toInclude({ id: "rules1" });
        expect(action.rules).toInclude({ id: "rules2" });
        expect(action.merge).toBe(true);
        expect(action.unselect).toBe(false);
    });

    it('options loaded', () => {
        const groups = {
            groups: [
                { id: "group1" },
                { id: "group2" }
            ]
        };
        var action = optionsLoaded("groups", groups, 5, 25);
        expect(action).toExist();
        expect(action.type).toBe(OPTIONS_LOADED);
        expect(action.name).toBe("groups");
        expect(action.values.groups.length).toBe(2);
        expect(action.values.groups).toInclude({ id: "group1" });
        expect(action.values.groups).toInclude({ id: "group2" });
        expect(action.page).toBe(5);
        expect(action.valuesCount).toBe(25);
    });

    it('update filters values', () => {
        const filtersValues = {
            rules: [
                { group: "group1" },
                { user: "user2" }
            ]
        };
        var action = updateFiltersValues(filtersValues);
        expect(action).toExist();
        expect(action.type).toBe(UPDATE_FILTERS_VALUES);
        expect(action.filtersValues).toEqual(filtersValues);
    });
    // for gs instance
    it('test cleanEditingGSInstance', () => {
        var action = cleanEditingGSInstance();
        expect(action).toExist();
        expect(action.type).toBe(CLEAN_EDITING_GS_INSTANCE);
    });
    it('test delGSInstance', () => {
        const gsInstancesIds = [1, 2, 3];
        var action = delGSInstance(gsInstancesIds);
        expect(action).toExist();
        expect(action.type).toBe(DELETE_GS_INSTSANCES);
        expect(action.ids).toEqual(gsInstancesIds);
    });
    it('test gsInstancesSelected', () => {
        const gsInstances = [{id: 1}, {id: 2}, {id: 3}];
        var action = gsInstancesSelected(gsInstances);
        expect(action).toExist();
        expect(action.type).toEqual(GS_INSTANCES_SELECTED);
        expect(action.gsInstances).toEqual(gsInstances);
    });
    it('test onEditGSInstance', () => {
        var action = onEditGSInstance(true);
        expect(action).toExist();
        expect(action.type).toEqual(EDIT_GS_INSTSANCES);
        expect(action.createNew).toEqual(true);
    });
    it('test saveGSInstance', () => {
        const gsInstnace = {id: 1, name: "gs"};
        var action = saveGSInstance(gsInstnace);
        expect(action).toExist();
        expect(action.type).toEqual(SAVE_GS_INSTANCE);
        expect(action.instance).toEqual(gsInstnace);
    });
    it('test updateActiveGrid', () => {
        const activeGrid = 'gsInstance';
        var action = updateActiveGrid(activeGrid);
        expect(action).toExist();
        expect(action.type).toEqual(SWITCH_GRID);
        expect(action.activeGrid).toEqual(activeGrid);
    });
    it('test storeGSInstancesDDList', () => {
        const instances = [{id: 1}, {id: 2}];
        var action = storeGSInstancesDDList(instances);
        expect(action).toExist();
        expect(action.type).toEqual(STORING_GS_INSTANCES_DD);
        expect(action.instances).toEqual(instances);
    });
});
