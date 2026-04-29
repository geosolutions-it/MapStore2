/**
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import projections from '../projections';
import {
    registerStaticProjectionDefs,
    addProjectionDef,
    removeProjectionDef,
    searchProjections,
    searchProjectionsSuccess,
    searchProjectionsError,
    clearProjectionSearch,
    loadProjectionDef,
    loadProjectionDefError
} from '../../actions/projections';

const baseSearch = { loading: false, results: [], total: 0, page: 1, pageSize: 10, loadingDefs: [], failedDefs: {}, error: null };

describe('projections reducer', () => {
    it('returns the initial state for unknown actions', () => {
        const state = projections(undefined, { type: 'UNKNOWN' });
        expect(state).toEqual({ staticDefs: [], dynamicDefs: [], search: baseSearch });
    });

    it('REGISTER_STATIC_PROJECTION_DEFS replaces staticDefs', () => {
        const defs = [{ code: 'EPSG:3003' }, { code: 'EPSG:25832' }];
        const state = projections(undefined, registerStaticProjectionDefs(defs));
        expect(state.staticDefs).toBe(defs);
        // Subsequent dispatches replace, not merge
        const next = projections(state, registerStaticProjectionDefs([{ code: 'EPSG:4269' }]));
        expect(next.staticDefs).toEqual([{ code: 'EPSG:4269' }]);
    });

    it('ADD_PROJECTION_DEF appends to dynamicDefs and clears the loading marker', () => {
        const initial = { staticDefs: [], dynamicDefs: [], search: { ...baseSearch, loadingDefs: ['EPSG:3003'] } };
        const def = { code: 'EPSG:3003', def: '+proj=tmerc' };
        const state = projections(initial, addProjectionDef(def));
        expect(state.dynamicDefs).toEqual([def]);
        expect(state.search.loadingDefs).toEqual([]);
    });

    it('ADD_PROJECTION_DEF is a no-op when the code already exists', () => {
        const def = { code: 'EPSG:3003', def: '+proj=tmerc' };
        const initial = { staticDefs: [], dynamicDefs: [def], search: baseSearch };
        const next = projections(initial, addProjectionDef({ code: 'EPSG:3003', def: 'OTHER' }));
        // Same reference - reducer bails before constructing a new state
        expect(next).toBe(initial);
        expect(next.dynamicDefs.length).toBe(1);
    });

    it('REMOVE_PROJECTION_DEF removes only the matching dynamic def', () => {
        const initial = {
            staticDefs: [],
            dynamicDefs: [{ code: 'EPSG:3003' }, { code: 'EPSG:25832' }],
            search: baseSearch
        };
        const state = projections(initial, removeProjectionDef('EPSG:3003'));
        expect(state.dynamicDefs).toEqual([{ code: 'EPSG:25832' }]);
    });

    it('SEARCH_PROJECTIONS page 1 clears prior results and resets to page 1', () => {
        const initial = { ...projections(undefined, {}), search: { ...baseSearch, results: [{ id: 'A' }], page: 3 } };
        const state = projections(initial, searchProjections('/crs-endpoint', 'q', 1));
        expect(state.search.loading).toBe(true);
        expect(state.search.error).toBe(null);
        expect(state.search.results).toEqual([]);
        expect(state.search.page).toBe(1);
    });

    it('SEARCH_PROJECTIONS page > 1 keeps prior results (load-more)', () => {
        const initial = { ...projections(undefined, {}), search: { ...baseSearch, results: [{ id: 'A' }], page: 1 } };
        const state = projections(initial, searchProjections('/crs-endpoint', 'q', 2));
        expect(state.search.loading).toBe(true);
        expect(state.search.results).toEqual([{ id: 'A' }]);
    });

    it('SEARCH_PROJECTIONS_SUCCESS replaces on page 1 and appends on later pages', () => {
        const page1 = projections(undefined, searchProjectionsSuccess([{ id: 'A' }, { id: 'B' }], 5, 1));
        expect(page1.search.results).toEqual([{ id: 'A' }, { id: 'B' }]);
        expect(page1.search.total).toBe(5);
        expect(page1.search.page).toBe(1);
        expect(page1.search.loading).toBe(false);

        const page2 = projections(page1, searchProjectionsSuccess([{ id: 'C' }], 5, 2));
        expect(page2.search.results).toEqual([{ id: 'A' }, { id: 'B' }, { id: 'C' }]);
        expect(page2.search.page).toBe(2);
    });

    it('SEARCH_PROJECTIONS_ERROR clears results when the failure was on page 1', () => {
        const initial = {
            ...projections(undefined, {}),
            search: { ...baseSearch, results: [{ id: 'A' }], total: 3, page: 1 }
        };
        const state = projections(initial, searchProjectionsError('boom'));
        expect(state.search.loading).toBe(false);
        expect(state.search.results).toEqual([]);
        expect(state.search.total).toBe(0);
        expect(state.search.error).toBe('boom');
    });

    it('SEARCH_PROJECTIONS_ERROR keeps prior results when the failure was on page > 1', () => {
        const initial = {
            ...projections(undefined, {}),
            search: { ...baseSearch, results: [{ id: 'A' }], total: 5, page: 2 }
        };
        const state = projections(initial, searchProjectionsError('boom'));
        // Previously-loaded pages survive a load-more failure
        expect(state.search.results).toEqual([{ id: 'A' }]);
        expect(state.search.total).toBe(5);
        expect(state.search.error).toBe('boom');
    });

    it('CLEAR_PROJECTION_SEARCH resets search to the default sub-state', () => {
        const initial = {
            staticDefs: [{ code: 'EPSG:3003' }],
            dynamicDefs: [{ code: 'EPSG:25832' }],
            search: { ...baseSearch, results: [{ id: 'A' }], loading: true, error: 'old', page: 4 }
        };
        const state = projections(initial, clearProjectionSearch());
        expect(state.search).toEqual(baseSearch);
        // Unrelated slices are preserved
        expect(state.staticDefs).toEqual([{ code: 'EPSG:3003' }]);
        expect(state.dynamicDefs).toEqual([{ code: 'EPSG:25832' }]);
    });

    it('LOAD_PROJECTION_DEF tracks the in-flight id and clears any prior failure', () => {
        const initial = {
            ...projections(undefined, {}),
            search: { ...baseSearch, failedDefs: { 'EPSG:3003': 'previous error' } }
        };
        const state = projections(initial, loadProjectionDef('/crs-endpoint', 'EPSG:3003'));
        expect(state.search.loadingDefs).toEqual(['EPSG:3003']);
        // Prior failure for the same id is cleared on retry
        expect(state.search.failedDefs).toEqual({});
    });

    it('LOAD_PROJECTION_DEF_ERROR drops the loading marker and records the error', () => {
        const initial = {
            ...projections(undefined, {}),
            search: { ...baseSearch, loadingDefs: ['EPSG:3003', 'EPSG:25832'] }
        };
        const state = projections(initial, loadProjectionDefError('EPSG:3003', 'failed'));
        expect(state.search.loadingDefs).toEqual(['EPSG:25832']);
        expect(state.search.failedDefs).toEqual({ 'EPSG:3003': 'failed' });
    });
});
