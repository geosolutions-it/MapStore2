/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import isNil from 'lodash/isNil';
import isFunction from 'lodash/isFunction';
import set from 'lodash/fp/set';
import uuid from 'uuid/v1';

import {
    UPDATE_RESOURCES,
    LOADING_RESOURCES,
    UPDATE_RESOURCES_METADATA,
    DECREASE_TOTAL_COUNT,
    INCREASE_TOTAL_COUNT,
    SET_SHOW_FILTERS_FORM,
    SET_SELECTED_RESOURCE,
    UPDATE_SELECTED_RESOURCE,
    SEARCH_RESOURCES,
    RESET_SEARCH_RESOURCES,
    RESET_SELECTED_RESOURCE,
    SET_SHOW_DETAILS
} from '../actions/resources';

import { parseResourceProperties } from '../utils/ResourcesUtils';

const defaultState = {};

const setStateById = (state, action, newState) => {
    if (action.id === undefined) {
        return isFunction(newState) ? newState(state) :  {
            ...state,
            ...newState
        };
    }
    return {
        ...state,
        sections: {
            ...state?.sections,
            [action.id]: isFunction(newState) ? newState(state?.sections?.[action.id]) :  {
                ...state?.sections?.[action.id],
                ...newState
            }
        }
    };
};

function resources(state = defaultState, action) {
    switch (action.type) {
    case UPDATE_RESOURCES: {
        return setStateById(state, action, {
            isFirstRequest: false,
            resources: action.resources
        });
    }
    case UPDATE_RESOURCES_METADATA: {
        return setStateById(state, action, (stateId) => ({
            ...stateId,
            total: action.metadata.total,
            isNextPageAvailable: action.metadata.isNextPageAvailable,
            error: action.metadata.error,
            ...(action.metadata.params &&
                {
                    params: action.metadata.params,
                    previousParams: stateId?.params,
                    nextParams: null
                }),
            ...(!isNil(action.metadata.locationSearch) &&
                {
                    locationSearch: action.metadata.locationSearch
                }),
            ...(!isNil(action.metadata.locationPathname) &&
                {
                    locationPathname: action.metadata.locationPathname
                })
        }));
    }
    case LOADING_RESOURCES: {
        return setStateById(state, action, {
            loading: action.loading,
            ...(action.loading && { error: false })
        });
    }
    case DECREASE_TOTAL_COUNT: {
        return setStateById(state, action, (stateId) => ({
            total: stateId.total - 1
        }));
    }
    case INCREASE_TOTAL_COUNT: {
        return setStateById(state, action, (stateId) => ({
            total: stateId.total + 1
        }));
    }
    case SET_SHOW_FILTERS_FORM:
        return setStateById(state, action, {
            showFiltersForm: !!action.show
        });
    case SET_SHOW_DETAILS: {
        return setStateById(state, action, {
            showDetails: !!action.show
        });
    }
    case SET_SELECTED_RESOURCE:
        const resource = action.selectedResource
            ? parseResourceProperties(action.selectedResource)
            : action.selectedResource;
        return setStateById(state, action, {
            initialSelectedResource: resource,
            selectedResource: resource
        });
    case UPDATE_SELECTED_RESOURCE:
        return setStateById(state, action, (stateId) => ({
            ...stateId,
            selectedResource: Object.keys(action.properties).reduce((selectedResource, path) => {
                return set(path, action.properties[path], selectedResource);
            }, stateId.selectedResource)
        }));
    case RESET_SELECTED_RESOURCE:
        return setStateById(state, action, (stateId) => ({
            ...stateId,
            selectedResource: stateId.initialSelectedResource
        }));
    case SEARCH_RESOURCES:
        return setStateById(state, action, {
            search: {
                id: uuid(),
                params: action.params,
                clear: action.clear,
                refresh: action.refresh
            }
        });
    case RESET_SEARCH_RESOURCES:
        return setStateById(state, action, {
            search: null
        });
    default:
        return state;
    }
}

export default resources;
