/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const { RULES_SELECTED, OPTIONS_LOADED, UPDATE_FILTERS_VALUES,
    rulesSelected,
    optionsLoaded, updateFiltersValues,
    SET_FILTER, setFilter,
    SAVE_RULE, saveRule, cleanEditing, CLEAN_EDITING,
    onEditRule, EDIT_RULE, delRules, DELETE_RULES} = require('../rulesmanager');

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
});
