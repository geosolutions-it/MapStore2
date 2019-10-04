/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const RULES_SELECTED = 'RULES_SELECTED';
const UPDATE_FILTERS_VALUES = 'UPDATE_FILTERS_VALUES';
const OPTIONS_LOADED = 'OPTIONS_LOADED';
const LOADING = 'RULES_MANAGER:LOADING';
const SET_FILTER = "RULES_MANAGER:SET_FILTER";
const EDIT_RULE = "RULES_MANAGER:EDIT_RULE";
const CLEAN_EDITING = "RULES_MANAGER:CLEAN_EDITING";
const SAVE_RULE = "RULES_MANAGER:SAVE_RULE";
const RULE_SAVED = "RULES_MANAGER:RULE_SAVED";
const DELETE_RULES = "RULES_MANAGER:DELETE_RULES";
const CACHE_CLEAN = "RULES_MANAGER:CACHE_CLEAN";

function onCacheClean() {
    return {
        type: CACHE_CLEAN
    };
}
function delRules(ids) {
    return {
        type: DELETE_RULES,
        ids
    };
}

function setFilter(key, value) {
    return {
        type: SET_FILTER,
        key,
        value
    };
}

function onEditRule(targetPriority = 0, createNew = false) {
    return {
        type: EDIT_RULE,
        createNew,
        targetPriority
    };
}

function cleanEditing() {
    return {
        type: CLEAN_EDITING
    };
}

function setLoading(loading) {
    return {
        type: LOADING,
        loading
    };
}

function rulesSelected(rules, merge, unselect, targetPosition) {
    return {
        type: RULES_SELECTED,
        rules,
        merge,
        unselect,
        targetPosition
    };
}

function optionsLoaded(name, values, page, valuesCount) {
    return {
        type: OPTIONS_LOADED,
        name: name,
        values: values,
        page: page,
        valuesCount: valuesCount
    };
}

function updateFiltersValues(filtersValues) {
    return {
        type: UPDATE_FILTERS_VALUES,
        filtersValues: filtersValues
    };
}

const saveRule = (rule) => ({type: SAVE_RULE, rule});

module.exports = {
    RULES_SELECTED,
    UPDATE_FILTERS_VALUES,
    OPTIONS_LOADED,
    rulesSelected,
    updateFiltersValues,
    optionsLoaded,
    LOADING, setLoading,
    SET_FILTER, setFilter,
    EDIT_RULE, onEditRule,
    CLEAN_EDITING, cleanEditing,
    SAVE_RULE, saveRule, RULE_SAVED,
    DELETE_RULES, delRules,
    CACHE_CLEAN, onCacheClean
};
