/**
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    REGISTER_STATIC_PROJECTION_DEFS,
    ADD_PROJECTION_DEF,
    REMOVE_PROJECTION_DEF,
    SEARCH_PROJECTIONS,
    SEARCH_PROJECTIONS_SUCCESS,
    SEARCH_PROJECTIONS_ERROR,
    CLEAR_PROJECTION_SEARCH,
    LOAD_PROJECTION_DEF,
    LOAD_PROJECTION_DEF_ERROR,
    registerStaticProjectionDefs,
    addProjectionDef,
    removeProjectionDef,
    searchProjections,
    searchProjectionsSuccess,
    searchProjectionsError,
    clearProjectionSearch,
    loadProjectionDef,
    loadProjectionDefError
} from '../projections';

describe('projections actions', () => {
    it('registerStaticProjectionDefs', () => {
        const defs = [{ code: 'EPSG:3003' }];
        expect(registerStaticProjectionDefs(defs)).toEqual({ type: REGISTER_STATIC_PROJECTION_DEFS, defs });
    });

    it('addProjectionDef / removeProjectionDef', () => {
        const def = { code: 'EPSG:3003', def: '+proj=tmerc' };
        expect(addProjectionDef(def)).toEqual({ type: ADD_PROJECTION_DEF, def });
        expect(removeProjectionDef('EPSG:3003')).toEqual({ type: REMOVE_PROJECTION_DEF, code: 'EPSG:3003' });
    });

    it('searchProjections defaults page to 1', () => {
        expect(searchProjections('http://x', 'utm')).toEqual({
            type: SEARCH_PROJECTIONS, endpointUrl: 'http://x', query: 'utm', page: 1
        });
        expect(searchProjections('http://x', 'utm', 3)).toEqual({
            type: SEARCH_PROJECTIONS, endpointUrl: 'http://x', query: 'utm', page: 3
        });
    });

    it('searchProjectionsSuccess / searchProjectionsError', () => {
        expect(searchProjectionsSuccess([{ id: 'A' }], 5, 2)).toEqual({
            type: SEARCH_PROJECTIONS_SUCCESS, results: [{ id: 'A' }], total: 5, page: 2
        });
        expect(searchProjectionsError('boom')).toEqual({
            type: SEARCH_PROJECTIONS_ERROR, error: 'boom'
        });
    });

    it('clearProjectionSearch', () => {
        expect(clearProjectionSearch()).toEqual({ type: CLEAR_PROJECTION_SEARCH });
    });

    it('loadProjectionDef / loadProjectionDefError', () => {
        expect(loadProjectionDef('http://x', 'EPSG:3003')).toEqual({
            type: LOAD_PROJECTION_DEF, endpointUrl: 'http://x', id: 'EPSG:3003'
        });
        expect(loadProjectionDefError('EPSG:3003', 'failed')).toEqual({
            type: LOAD_PROJECTION_DEF_ERROR, id: 'EPSG:3003', error: 'failed'
        });
    });
});
