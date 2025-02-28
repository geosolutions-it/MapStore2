/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    getResources,
    getResourcesLoading,
    getResourcesError,
    getIsFirstRequest,
    getTotalResources,
    getShowFiltersForm,
    getInitialSelectedResource,
    getSelectedResource,
    getShowDetails,
    getCurrentPage,
    getSearch,
    getCurrentParams
} from '../resources';
import expect from 'expect';

describe('resources selectors', () => {
    it('getResources', () => {
        expect(getResources()).toEqual([]);
        expect(getResources({ resources: { sections: { catalog: { resources: [{ id: '01' }] } } } }, { id: 'catalog' })).toEqual([{ id: '01' }]);
        expect(getResources({ resources: { sections: { catalog: { resources: [{ id: '01' }] } } } }, { resourcesGridId: 'catalog' })).toEqual([{ id: '01' }]);
    });
    it('getResourcesLoading', () => {
        expect(getResourcesLoading()).toBe(undefined);
        expect(getResourcesLoading({ resources: { sections: { catalog: { loading: false } } } }, { id: 'catalog' })).toBe(false);
        expect(getResourcesLoading({ resources: { sections: { catalog: { loading: true } } } }, { resourcesGridId: 'catalog' })).toBe(true);
    });
    it('getResourcesError', () => {
        expect(getResourcesError()).toBe(undefined);
        expect(getResourcesError({ resources: { sections: { catalog: { error: false } } } }, { id: 'catalog' })).toBe(false);
        expect(getResourcesError({ resources: { sections: { catalog: { error: true } } } }, { resourcesGridId: 'catalog' })).toBe(true);
    });
    it('getIsFirstRequest', () => {
        expect(getIsFirstRequest()).toBe(true);
        expect(getIsFirstRequest({ resources: { sections: { catalog: { isFirstRequest: false } } } }, { id: 'catalog' })).toBe(false);
        expect(getIsFirstRequest({ resources: { sections: { catalog: { isFirstRequest: true } } } }, { resourcesGridId: 'catalog' })).toBe(true);
    });
    it('getTotalResources', () => {
        expect(getTotalResources()).toBe(0);
        expect(getTotalResources({ resources: { sections: { catalog: { total: 10 } } } }, { id: 'catalog' })).toBe(10);
        expect(getTotalResources({ resources: { sections: { catalog: { total: 1 } } } }, { resourcesGridId: 'catalog' })).toBe(1);
    });
    it('getShowFiltersForm', () => {
        expect(getShowFiltersForm()).toBe(undefined);
        expect(getShowFiltersForm({ resources: { sections: { catalog: { showFiltersForm: false } } } }, { id: 'catalog' })).toBe(false);
        expect(getShowFiltersForm({ resources: { sections: { catalog: { showFiltersForm: true } } } }, { resourcesGridId: 'catalog' })).toBe(true);
    });
    it('getInitialSelectedResource', () => {
        expect(getInitialSelectedResource()).toBe(undefined);
        expect(getInitialSelectedResource({ resources: { initialSelectedResource: { id: '01' } } })).toEqual({ id: '01' });
    });
    it('getSelectedResource', () => {
        expect(getSelectedResource()).toBe(undefined);
        expect(getSelectedResource({ resources: { selectedResource: { id: '01' } } })).toEqual({ id: '01' });
    });
    it('getShowDetails', () => {
        expect(getShowDetails()).toBe(false);
        expect(getShowDetails({ resources: { showDetails: true } })).toBe(true);
    });
    it('getCurrentPage', () => {
        expect(getCurrentPage()).toBe(1);
        expect(getCurrentPage({ resources: { sections: { catalog: { params: { page: 2 } } } } }, { id: 'catalog' })).toBe(2);
        expect(getCurrentPage({ resources: { sections: { catalog: { params: { page: 3 } } } } }, { resourcesGridId: 'catalog' })).toBe(3);
    });
    it('getSearch', () => {
        expect(getSearch()).toBe(null);
        expect(getSearch({ resources: { search: { q: 'a' }  } }, { id: 'catalog' })).toEqual({ q: 'a' });
    });
    it('getCurrentParams', () => {
        expect(getCurrentParams()).toBe(undefined);
        expect(getCurrentParams({ resources: { sections: { catalog: { params: { page: 2 } } } } }, { id: 'catalog' })).toEqual({ page: 2 });
        expect(getCurrentParams({ resources: { sections: { catalog: { params: { page: 3 } } } } }, { resourcesGridId: 'catalog' })).toEqual({ page: 3 });
    });
});
