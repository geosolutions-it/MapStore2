/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    UPDATE_VIEWS,
    SELECT_VIEW,
    ACTIVATE_VIEWS,
    HIDE_VIEWS,
    SETUP_VIEWS,
    UPDATE_RESOURCES,
    SET_PREVIOUS_VIEW
} from '../actions/mapviews';

const defaultState = {};

const mapviews = (state = defaultState, action) => {
    switch (action.type) {
    case SELECT_VIEW:
        return {
            ...state,
            selectedId: action.id
        };
    case UPDATE_VIEWS:
        return {
            ...state,
            views: [ ...action.views ]
        };
    case UPDATE_RESOURCES:
        return {
            ...state,
            resources: [ ...action.resources ]
        };
    case ACTIVATE_VIEWS:
        return {
            ...state,
            active: action.active
        };
    case HIDE_VIEWS:
        return {
            ...state,
            hide: action.hide
        };
    case SETUP_VIEWS:
        if (!action.config) {
            // reset state
            return {};
        }
        return action.config;
    case SET_PREVIOUS_VIEW:
        return {
            ...state,
            previousView: action.view
        };
    default:
        return state;
    }
};

export default mapviews;
