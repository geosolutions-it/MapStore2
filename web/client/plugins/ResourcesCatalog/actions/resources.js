/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const UPDATE_RESOURCES = 'RESOURCES:UPDATE_RESOURCES';
export const LOADING_RESOURCES = 'RESOURCES:LOADING_RESOURCES';
export const UPDATE_RESOURCES_METADATA = 'RESOURCES:UPDATE_RESOURCES_METADATA';
export const DECREASE_TOTAL_COUNT = 'RESOURCES:DECREASE_TOTAL_COUNT';
export const INCREASE_TOTAL_COUNT = 'RESOURCES:INCREASE_TOTAL_COUNT';
export const SET_SHOW_FILTERS_FORM = 'RESOURCES:SET_SHOW_FILTERS_FORM';
export const SET_SHOW_DETAILS = 'RESOURCES:SET_SHOW_DETAILS';
export const SET_SELECTED_RESOURCE = 'RESOURCES:SET_SELECTED_RESOURCE';
export const UPDATE_SELECTED_RESOURCE = 'RESOURCES:UPDATE_SELECTED_RESOURCE';
export const SEARCH_RESOURCES = 'RESOURCES:SEARCH_RESOURCES';
export const RESET_SEARCH_RESOURCES = 'RESOURCES:RESET_SEARCH_RESOURCES';
export const RESET_SELECTED_RESOURCE = 'RESOURCES:RESET_SELECTED_RESOURCE';

export function updateResources(resources, id) {
    return {
        type: UPDATE_RESOURCES,
        resources,
        id
    };
}

export function updateResourcesMetadata(metadata, id) {
    return {
        type: UPDATE_RESOURCES_METADATA,
        metadata,
        id
    };
}

export function loadingResources(loading, id) {
    return {
        type: LOADING_RESOURCES,
        loading,
        id
    };
}

export function decreaseTotalCount(id) {
    return {
        type: DECREASE_TOTAL_COUNT,
        id
    };
}

export function increaseTotalCount(id) {
    return {
        type: INCREASE_TOTAL_COUNT,
        id
    };
}

export function setShowFiltersForm(show, id) {
    return {
        type: SET_SHOW_FILTERS_FORM,
        show,
        id
    };
}

export function setSelectedResource(selectedResource, id) {
    return {
        type: SET_SELECTED_RESOURCE,
        selectedResource,
        id
    };
}

export function updateSelectedResource(properties, id) {
    return {
        type: UPDATE_SELECTED_RESOURCE,
        properties,
        id
    };
}

export function searchResources({ params, clear, refresh }) {
    return {
        type: SEARCH_RESOURCES,
        clear,
        params,
        refresh
    };
}

export function resetSearchResources() {
    return {
        type: RESET_SEARCH_RESOURCES
    };
}

export function resetSelectedResource(id) {
    return {
        type: RESET_SELECTED_RESOURCE,
        id
    };
}

export function setShowDetails(show, id) {
    return {
        type: SET_SHOW_DETAILS,
        show,
        id
    };
}
