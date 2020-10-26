/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const RULES_SELECTED = 'RULES_SELECTED';
export const UPDATE_FILTERS_VALUES = 'UPDATE_FILTERS_VALUES';
export const OPTIONS_LOADED = 'OPTIONS_LOADED';
export const LOADING = 'RULES_MANAGER:LOADING';
export const SET_FILTER = "RULES_MANAGER:SET_FILTER";
export const EDIT_RULE = "RULES_MANAGER:EDIT_RULE";
export const CLEAN_EDITING = "RULES_MANAGER:CLEAN_EDITING";
export const SAVE_RULE = "RULES_MANAGER:SAVE_RULE";
export const RULE_SAVED = "RULES_MANAGER:RULE_SAVED";
export const DELETE_RULES = "RULES_MANAGER:DELETE_RULES";
export const CACHE_CLEAN = "RULES_MANAGER:CACHE_CLEAN";

export function onCacheClean() {
    return {
        type: CACHE_CLEAN
    };
}
export function delRules(ids) {
    return {
        type: DELETE_RULES,
        ids
    };
}

export function setFilter(key, value) {
    return {
        type: SET_FILTER,
        key,
        value
    };
}

export function onEditRule(targetPriority = 0, createNew = false) {
    return {
        type: EDIT_RULE,
        createNew,
        targetPriority
    };
}

export function cleanEditing() {
    return {
        type: CLEAN_EDITING
    };
}

export function setLoading(loading) {
    return {
        type: LOADING,
        loading
    };
}

export function rulesSelected(rules, merge, unselect, targetPosition) {
    return {
        type: RULES_SELECTED,
        rules,
        merge,
        unselect,
        targetPosition
    };
}

export function optionsLoaded(name, values, page, valuesCount) {
    return {
        type: OPTIONS_LOADED,
        name: name,
        values: values,
        page: page,
        valuesCount: valuesCount
    };
}

export function updateFiltersValues(filtersValues) {
    return {
        type: UPDATE_FILTERS_VALUES,
        filtersValues: filtersValues
    };
}

export const saveRule = (rule) => ({type: SAVE_RULE, rule});
