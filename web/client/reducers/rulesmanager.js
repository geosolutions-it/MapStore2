/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const assign = require('object-assign');

const { RULES_SELECTED, RULES_LOADED, UPDATE_ACTIVE_RULE,
        ACTION_ERROR, OPTIONS_LOADED, UPDATE_FILTERS_VALUES,
        LOADING, EDIT_RULE, SET_FILTER, CLEAN_EDITING, RULE_SAVED} = require('../actions/rulesmanager');
const _ = require('lodash');
const defaultState = {
    services: {
        WFS: [
            "DescribeFeatureType",
            "GetCapabilities",
            "GetFeature",
            "GetFeatureWithLock",
            "LockFeature",
            "Transaction"
        ],
        WMS: [
            "DescribeLayer",
            "GetCapabilities",
            "GetFeatureInfo",
            "GetLegendGraphic",
            "GetMap",
            "GetStyles"
        ]
    },
    triggerLoad: 0
};

const getPosition = ({targetPosition = {}}, priority) => {
    switch (priority) {
        case -1:
            return targetPosition.offsetFromTop;
        case +1:
            return targetPosition.offsetFromTop + 1;
        default:
            return 0;
    }
};

function rulesmanager(state = defaultState, action) {
    switch (action.type) {
    case RULES_SELECTED: {
        if (!action.merge) {
            return assign({}, state, {
                selectedRules: action.rules,
                targetPosition: action.targetPosition
            });
        }
        const newRules = action.rules || [];
        const existingRules = state.selectedRules || [];
        if (action.unselect) {
            return assign({}, state, {
                selectedRules: _(existingRules).filter(
                        rule => !_.head(newRules.filter(unselected => unselected.id === rule.id))).value()
            });
        }
        return assign({}, state, {
            selectedRules: _(existingRules).concat(newRules).uniq(rule => rule.id).value()});
    }
    case RULES_LOADED: {
        return assign({}, state, {
            rules: action.rules,
            rulesCount: action.count,
            rulesPage: action.page,
            selectedRules: action.keepSelected ? state.selectedRules : [],
            activeRule: {},
            error: {}
        });
    }
    case UPDATE_ACTIVE_RULE: {
        if (!action.merge) {
            return assign({}, state, {
                error: {},
                activeRule: {
                    rule: action.rule,
                    status: action.status
                }
            });
        }
        const rule = state.activeRule || {};
        return assign({}, state, {
            error: {},
            activeRule: {
                rule: assign({}, rule.rule, action.rule),
                status: action.status
            }
        });
    }
    case UPDATE_FILTERS_VALUES: {
        const filtersValues = state.filtersValues || {};
        return assign({}, state, {
            filtersValues: assign({}, filtersValues, action.filtersValues)
        });
    }
    case ACTION_ERROR: {
        return assign({}, state, {
            error: {
                msgId: action.msgId,
                context: action.context
            }
        });
    }
    case OPTIONS_LOADED: {
        return assign({}, state, {
            options: assign({}, state.options, {
                [action.name]: action.values || [],
                [action.name + "Page"]: action.page,
                [action.name + "Count"]: action.valuesCount
            })
        });
    }
    case LOADING:
        return assign({}, state, {loading: action.loading});
    case SET_FILTER: {
        const {key, value} = action;
        if (value) {
            return assign({}, state, {filters: {...state.filters, [key]: value}});
        }
        const {[key]: omit, ...newFilters} = state.filters;
        return assign({}, state, {filters: newFilters});
    }
    case EDIT_RULE: {
        const {createNew, targetPriority} = action;
        if (createNew) {
            return assign({}, state, {activeRule: {position: {value: getPosition(state, targetPriority), position: "offsetFromTop"}}});
        }
        return assign({}, state, {activeRule: {...(state.selectedRules[0] || {}), position: {value: state.targetPosition.offsetFromTop, position: "offsetFromTop"}}});
    }
    case RULE_SAVED: {
        return assign({}, state, {triggerLoad: (state.triggerLoad || 0) + 1, activeRule: undefined, selectedRules: [], targetPosition: undefined });
    }
    case CLEAN_EDITING: {
        return assign({}, state, {activeRule: undefined});
    }
    default:
        return state;
    }
}

module.exports = rulesmanager;
