/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import resources from '../resources';
import {
    updateResources,
    updateResourcesMetadata,
    loadingResources,
    setShowFiltersForm,
    setSelectedResource,
    updateSelectedResource,
    searchResources,
    resetSearchResources,
    resetSelectedResource,
    setShowDetails,
    setDetailPanelTab
} from '../../actions/resources';
import expect from 'expect';

describe('resources reducer', () => {
    it('updateResources', () => {
        expect(resources({}, updateResources([], 'catalog'))).toEqual({ sections: { catalog: { isFirstRequest: false, resources: [] } } });
    });
    it('updateResourcesMetadata', () => {
        expect(resources({}, updateResourcesMetadata({
            isNextPageAvailable: false,
            params: {},
            locationSearch: '',
            locationPathname: '/',
            total: 0
        }, 'catalog'))).toEqual({ sections: { catalog: { total: 0, isNextPageAvailable: false, error: undefined, params: {}, previousParams: undefined, nextParams: null, locationSearch: '', locationPathname: '/' } } });
    });
    it('loadingResources', () => {
        expect(resources({}, loadingResources(true, 'catalog'))).toEqual({ sections: { catalog: { loading: true, error: false } } });
    });
    it('setShowFiltersForm', () => {
        expect(resources({}, setShowFiltersForm(true, 'catalog'))).toEqual({ sections: { catalog: { showFiltersForm: true } } });
    });
    it('setSelectedResource', () => {
        expect(resources({}, setSelectedResource({ id: 1, name: 'Resource' })))
            .toEqual({
                selectedResource: { id: 1, name: 'Resource', attributes: { detailsSettings: {} }, '@extras': { info: { title: 'Resource', icon: undefined, thumbnailUrl: undefined, viewerPath: undefined, viewerUrl: false }, status: { items: [] } } },
                initialSelectedResource: { id: 1, name: 'Resource', attributes: { detailsSettings: {} }, '@extras': { info: { title: 'Resource', icon: undefined, thumbnailUrl: undefined, viewerPath: undefined, viewerUrl: false }, status: { items: [] } } }
            });
        expect(resources({}, setSelectedResource(null))).toEqual({ selectedResource: null, initialSelectedResource: null });
        expect(resources({}, setSelectedResource({ id: 1, name: 'Resource', attributes: { detailsSettings: "{\"showAsModal\":false,\"showAtStartup\":false}" } })))
            .toEqual({
                selectedResource: { id: 1, name: 'Resource', attributes: { detailsSettings: { showAsModal: false, showAtStartup: false } }, '@extras': { info: { title: 'Resource', icon: undefined, thumbnailUrl: undefined, viewerPath: undefined, viewerUrl: false }, status: { items: [] } } },
                initialSelectedResource: { id: 1, name: 'Resource', attributes: { detailsSettings: { showAsModal: false, showAtStartup: false } }, '@extras': { info: { title: 'Resource', icon: undefined, thumbnailUrl: undefined, viewerPath: undefined, viewerUrl: false }, status: { items: [] } } } });
    });
    it('updateSelectedResource', () => {
        expect(resources({ selectedResource: { id: 1, name: 'Resource' }, initialSelectedResource: { id: 1, name: 'Resource' } }, updateSelectedResource({ name: 'New Resource' })))
            .toEqual({ selectedResource: { id: 1, name: 'New Resource' }, initialSelectedResource: { id: 1, name: 'Resource' } });
    });
    it('updateSelectedResource with initialize true', () => {
        expect(resources({ selectedResource: { id: 1, name: 'Resource' }, initialSelectedResource: { id: 1, name: 'Resource' } }, updateSelectedResource({ name: 'New Resource' }, true)))
            .toEqual({ selectedResource: { id: 1, name: 'New Resource' }, initialSelectedResource: { id: 1, name: 'New Resource' } });
    });
    it('searchResources', () => {
        const newState = resources({}, searchResources({ params: { page: 2 }, clear: false, refresh: false }));
        const { id, ...search } = newState?.search;
        expect(id).toBeTruthy();
        expect(search).toEqual({ params: { page: 2 }, clear: false, refresh: false });
    });
    it('resetSearchResources', () => {
        expect(resources({ search: { id: 'id', params: { page: 2 }, clear: false, refresh: false } }, resetSearchResources()))
            .toEqual({ search: null });
    });
    it('resetSelectedResource', () => {
        expect(resources({ selectedResource: { id: 1, name: 'Change Resource' }, initialSelectedResource: { id: 1, name: 'Resource' } }, resetSelectedResource()))
            .toEqual({ selectedResource: { id: 1, name: 'Resource' }, initialSelectedResource: { id: 1, name: 'Resource' } });
    });
    it('setShowDetails', () => {
        expect(resources({}, setShowDetails(true)))
            .toEqual({ showDetails: true });
    });
    it('setDetailPanelTab', () => {
        expect(resources({}, setDetailPanelTab('tab1')))
            .toEqual({ detailPanelTab: 'tab1' });
    });
});
