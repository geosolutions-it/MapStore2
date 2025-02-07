/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    UPDATE_RESOURCES,
    updateResources,
    UPDATE_RESOURCES_METADATA,
    updateResourcesMetadata,
    LOADING_RESOURCES,
    loadingResources,
    DECREASE_TOTAL_COUNT,
    decreaseTotalCount,
    INCREASE_TOTAL_COUNT,
    increaseTotalCount,
    SET_SHOW_FILTERS_FORM,
    setShowFiltersForm,
    SET_SELECTED_RESOURCE,
    setSelectedResource,
    UPDATE_SELECTED_RESOURCE,
    updateSelectedResource,
    SEARCH_RESOURCES,
    searchResources,
    RESET_SEARCH_RESOURCES,
    resetSearchResources,
    RESET_SELECTED_RESOURCE,
    resetSelectedResource,
    SET_SHOW_DETAILS,
    setShowDetails
} from '../resources';
import expect from 'expect';

describe('resources actions', () => {
    it('updateResources', () => {
        expect(updateResources([], 'catalog')).toEqual({
            type: UPDATE_RESOURCES,
            resources: [],
            id: 'catalog'
        });
    });
    it('updateResourcesMetadata', () => {
        expect(updateResourcesMetadata({
            isNextPageAvailable: false,
            params: {},
            locationSearch: '',
            locationPathname: '/',
            total: 0
        }, 'catalog')).toEqual({
            type: UPDATE_RESOURCES_METADATA,
            metadata: {
                isNextPageAvailable: false,
                params: {},
                locationSearch: '',
                locationPathname: '/',
                total: 0
            },
            id: 'catalog'
        });
    });
    it('loadingResources', () => {
        expect(loadingResources(true, 'catalog')).toEqual({
            type: LOADING_RESOURCES,
            loading: true,
            id: 'catalog'
        });
    });
    it('decreaseTotalCount', () => {
        expect(decreaseTotalCount('catalog')).toEqual({
            type: DECREASE_TOTAL_COUNT,
            id: 'catalog'
        });
    });
    it('increaseTotalCount', () => {
        expect(increaseTotalCount('catalog')).toEqual({
            type: INCREASE_TOTAL_COUNT,
            id: 'catalog'
        });
    });
    it('setShowFiltersForm', () => {
        expect(setShowFiltersForm(true, 'catalog')).toEqual({
            type: SET_SHOW_FILTERS_FORM,
            show: true,
            id: 'catalog'
        });
    });
    it('setSelectedResource', () => {
        expect(setSelectedResource({ id: 1 }, 'catalog')).toEqual({
            type: SET_SELECTED_RESOURCE,
            selectedResource: { id: 1 },
            id: 'catalog'
        });
    });
    it('updateSelectedResource', () => {
        expect(updateSelectedResource({ name: 'Title' }, 'catalog')).toEqual({
            type: UPDATE_SELECTED_RESOURCE,
            properties: { name: 'Title' },
            id: 'catalog'
        });
    });
    it('searchResources', () => {
        expect(searchResources({ params: { page: 2 }, clear: false, refresh: false })).toEqual({
            type: SEARCH_RESOURCES,
            params: { page: 2 },
            clear: false,
            refresh: false
        });
    });
    it('resetSearchResources', () => {
        expect(resetSearchResources()).toEqual({
            type: RESET_SEARCH_RESOURCES
        });
    });
    it('resetSelectedResource', () => {
        expect(resetSelectedResource('catalog')).toEqual({
            type: RESET_SELECTED_RESOURCE,
            id: 'catalog'
        });
    });
    it('setShowDetails', () => {
        expect(setShowDetails(true, 'catalog')).toEqual({
            type: SET_SHOW_DETAILS,
            show: true,
            id: 'catalog'
        });
    });
});
