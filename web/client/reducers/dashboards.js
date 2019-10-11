/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { MAPS_LIST_LOADING } = require('../actions/maps');
const { LOCATION_CHANGE } = require('connected-react-router');

const { DASHBOARDS_LIST_LOADED, SET_DASHBOARDS_AVAILABLE, LOADING } = require('../actions/dashboards');
const {set} = require('../utils/ImmutableUtils');
const { castArray } = require('lodash');

function dashboards(state = {
    enabled: false,
    start: 0,
    limit: 12,
    errors: [],
    searchText: ""
}, action) {
    switch (action.type) {
    case SET_DASHBOARDS_AVAILABLE: {
        return set("available", action.available, state);
    }
    case LOCATION_CHANGE: {
        return set('showModal', {}, state);
    }
    case DASHBOARDS_LIST_LOADED:
        return {
            ...state,
            results: action.results !== "" ? castArray(action.results) : [],
            success: action.success,
            totalCount: action.totalCount,
            start: action.params && action.params.start,
            limit: action.params && action.params.limit,
            searchText: action.searchText,
            options: action.options
        };
    case MAPS_LIST_LOADING:
        return {
            ...state,
            start: action.params && action.params.start,
            limit: action.params && action.params.limit,
            searchText: action.searchText
        };
    case LOADING: {
        // anyway sets loading to true
        return set(action.name === "loading" ? "loading" : `loadFlags.${action.name}`, action.value, set(
            "loading", action.value, state
        ));
    }
    default:
        return state;
    }
}

module.exports = dashboards;
