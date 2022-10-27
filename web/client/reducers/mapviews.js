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

import { MAP_CONFIG_LOADED } from '../actions/config';

import { MAP_VIEWS_CONFIG_KEY } from '../utils/MapViewsUtils';

import uuid from 'uuid';

const defaultState = {};

const mapviews = (state = defaultState, action) => {
    switch (action.type) {
    case MAP_CONFIG_LOADED:
        return {
            initialized: true,
            hide: state?.hide,
            updateUUID: uuid(),
            ...action?.config?.[MAP_VIEWS_CONFIG_KEY] || {}
        };
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
        // do not update the state if initialized already
        if (state.initialized) {
            return state;
        }
        return {
            initialized: true,
            updateUUID: uuid(),
            ...(action.config ?? {})
        };
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
