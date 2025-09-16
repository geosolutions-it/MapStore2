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
    UNLOAD_RESOURCES,
    UPDATE_RESOURCE,
    UPDATE_RESOURCES_METADATA,
    SET_SHOW_FILTERS_FORM,
    SET_SELECTED_RESOURCE,
    UPDATE_SELECTED_RESOURCE,
    SEARCH_RESOURCES,
    RESET_SEARCH_RESOURCES,
    RESET_SELECTED_RESOURCE,
    SET_SHOW_DETAILS,
    SET_DETAIL_PANEL_TAB,
    SET_RESOURCE_TYPES
} from '../actions/resources';

import { parseResourceProperties } from '../../../utils/GeostoreUtils';

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
    case UPDATE_RESOURCE: {
        if (isNil(state.sections)) return state;
        return {
            ...state,
            sections: Object.fromEntries(Object.keys(state.sections).map((key) => {
                const section = state.sections[key];
                return [key, {
                    ...section,
                    resources: section.resources.map((resource) => resource.id === action.resource.id
                        ? { ...resource, ...action.resource }
                        : resource
                    )
                }];
            }))
        };
    }
    case LOADING_RESOURCES: {
        return setStateById(state, action, {
            loading: action.loading,
            ...(action.loading && { error: false })
        });
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
            }, stateId.selectedResource),
            ...(action.initialize && {
                initialSelectedResource: Object.keys(action.properties).reduce((initialSelectedResource, path) => {
                    return set(path, action.properties[path], initialSelectedResource);
                }, stateId.initialSelectedResource)
            })
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
    case SET_DETAIL_PANEL_TAB:
        return setStateById(state, action, {
            detailPanelTab: action.tab
        });
    case SET_RESOURCE_TYPES:
        return {
            ...state,
            resourceTypes: action.resourceTypes
        };
    case UNLOAD_RESOURCES:
        return {
            ...state,
            initialSelectedResource: undefined,
            selectedResource: undefined
        };

    default:
        return state;
    }
}

export default resources;
