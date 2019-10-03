/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const assign = require('object-assign');
const wk = require('wellknown');
const {isEmpty} = require("lodash");

const { RULES_SELECTED, OPTIONS_LOADED, UPDATE_FILTERS_VALUES,
    LOADING, EDIT_RULE, SET_FILTER, CLEAN_EDITING, RULE_SAVED} = require('../actions/rulesmanager');
const {
    CHANGE_DRAWING_STATUS
} = require('../actions/draw');

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
    triggerLoad: 0,
    grantDefault: "ALLOW"
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
// GEOFENCE ACCEPTS ONLY MULTYPOLYGON
const fixGeometry = (g, method = "") => {
    if (method === "" || isEmpty(g) || !g.coordinates || g.coordinates.length === 0) {
        return g;
    }
    const c = g.coordinates[0];
    if (method === "Polygon") {
        return {...g, type: "MultiPolygon", coordinates: [[[...c, c[0]]]]};
    }
    return {...g, type: "MultiPolygon", coordinates: [[c]]};
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
    case UPDATE_FILTERS_VALUES: {
        const filtersValues = state.filtersValues || {};
        return assign({}, state, {
            filtersValues: assign({}, filtersValues, action.filtersValues)
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
            return assign({}, state, {activeRule: {grant: state.grantDefault, position: {value: getPosition(state, targetPriority), position: "offsetFromTop"}}});
        }
        const activeRule = state.selectedRules[0] || {};
        const geometryState = activeRule.constraints && activeRule.constraints.restrictedAreaWkt && {
            wkt: activeRule.constraints.restrictedAreaWkt,
            geometry: wk.parse(activeRule.constraints.restrictedAreaWkt)} || {};
        return assign({}, state, {activeRule,
            position: {value: state.targetPosition.offsetFromTop, position: "offsetFromTop"},
            geometryState});
    }
    case RULE_SAVED: {
        return assign({}, state, {triggerLoad: (state.triggerLoad || 0) + 1, geometryState: undefined, activeRule: undefined, selectedRules: [], targetPosition: undefined });
    }
    case CLEAN_EDITING: {
        return assign({}, state, {activeRule: undefined, geometryState: undefined});
    }
    case CHANGE_DRAWING_STATUS: {
        let newState;
        if (action.owner === "rulesmanager" && (action.status === "stop" || action.status === "start" || action.status === "clean")) {
            const geometry = fixGeometry(((action.features || [])[0] || {}), action.method);
            newState = assign({}, state, {geometryState: assign({}, {
                geometry,
                wkt: !isEmpty(geometry) && wk.stringify(geometry) || undefined
            })});
        } else {
            newState = state;
        }

        return newState;
    }

    default:
        return state;
    }
}

module.exports = rulesmanager;
