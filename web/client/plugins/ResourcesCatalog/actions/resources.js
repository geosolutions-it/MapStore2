/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const UPDATE_RESOURCES = 'RESOURCES:UPDATE_RESOURCES';
export const UPDATE_RESOURCE = 'RESOURCES:UPDATE_RESOURCE';
export const LOADING_RESOURCES = 'RESOURCES:LOADING_RESOURCES';
export const UNLOAD_RESOURCES = 'RESOURCES:UNLOAD_RESOURCES';

export const UPDATE_RESOURCES_METADATA = 'RESOURCES:UPDATE_RESOURCES_METADATA';
export const SET_SHOW_FILTERS_FORM = 'RESOURCES:SET_SHOW_FILTERS_FORM';
export const SET_SHOW_DETAILS = 'RESOURCES:SET_SHOW_DETAILS';
export const SET_SELECTED_RESOURCE = 'RESOURCES:SET_SELECTED_RESOURCE';
export const UPDATE_SELECTED_RESOURCE = 'RESOURCES:UPDATE_SELECTED_RESOURCE';
export const SEARCH_RESOURCES = 'RESOURCES:SEARCH_RESOURCES';
export const RESET_SEARCH_RESOURCES = 'RESOURCES:RESET_SEARCH_RESOURCES';
export const RESET_SELECTED_RESOURCE = 'RESOURCES:RESET_SELECTED_RESOURCE';
export const SET_DETAIL_PANEL_TAB = 'RESOURCES:SET_DETAIL_PANEL_TAB';
export const SET_RESOURCE_TYPES = 'RESOURCES:SET_RESOURCES_TYPES';

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

export function updateResource(resource) {
    return {
        type: UPDATE_RESOURCE,
        resource
    };
}

export function loadingResources(loading, id) {
    return {
        type: LOADING_RESOURCES,
        loading,
        id
    };
}

export function unloadResources() {
    return {
        type: UNLOAD_RESOURCES
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

export function updateSelectedResource(properties, initialize, id) {
    return {
        type: UPDATE_SELECTED_RESOURCE,
        properties,
        initialize,
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

export function setDetailPanelTab(tab) {
    return {
        type: SET_DETAIL_PANEL_TAB,
        tab
    };
}
export function setResourceTypes(resourceTypes) {
    return {
        type: SET_RESOURCE_TYPES,
        resourceTypes
    };
}
