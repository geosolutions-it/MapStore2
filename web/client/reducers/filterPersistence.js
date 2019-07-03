/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


const { APPLIED_FILTER, STORE_CURRENT_APPLIED_FILTER, INIT_FILTER_PERSISTENCE, DISCARD_CURRENT_FILTER} = require("../actions/filterPersistence");
const { QUERY_FORM_RESET} = require('../actions/queryform');
const initialState = {};

function filterPersistence(state = initialState, action) {
    switch (action.type) {
        case INIT_FILTER_PERSISTENCE: {
            return { ...initialState, persisted: action.filter, applied: action.filter};
        }
        case DISCARD_CURRENT_FILTER: {
            return {...state, applied: state.persisted};
        }
        case APPLIED_FILTER: {
            return { ...state, applied: action.filter};
        }
        case STORE_CURRENT_APPLIED_FILTER: {
            return {...state, persisted: state.applied};
        }
        case QUERY_FORM_RESET: {
            return initialState;
        }
        default:
            return state;
    }
}

module.exports = filterPersistence;
