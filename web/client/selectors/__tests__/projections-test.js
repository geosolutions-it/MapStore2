/**
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    staticProjectionDefsSelector,
    dynamicProjectionDefsSelector,
    allProjectionDefsSelector,
    projectionSearchResultsSelector,
    projectionSearchLoadingSelector,
    projectionSearchErrorSelector,
    projectionSearchTotalSelector,
    projectionSearchPageSelector,
    projectionSearchPageSizeSelector,
    projectionLoadingDefsSelector,
    projectionLoadFailedDefsSelector
} from '../projections';

describe('projections selectors', () => {
    it('staticProjectionDefsSelector / dynamicProjectionDefsSelector default to empty arrays', () => {
        expect(staticProjectionDefsSelector({})).toEqual([]);
        expect(dynamicProjectionDefsSelector({})).toEqual([]);
    });

    it('allProjectionDefsSelector merges static + dynamic, with dynamic overriding the same code', () => {
        // The override matters: when an admin re-fetches a built-in projection
        // from GeoServer at runtime, the dynamic def should win - it carries the
        // up-to-date extent / WKT.
        const state = {
            projections: {
                staticDefs: [
                    { code: 'EPSG:3003', def: 'STATIC-3003' },
                    { code: 'EPSG:25832', def: 'STATIC-25832' }
                ],
                dynamicDefs: [
                    { code: 'EPSG:3003', def: 'DYNAMIC-3003' },
                    { code: 'EPSG:4269', def: 'DYNAMIC-4269' }
                ]
            }
        };
        const merged = allProjectionDefsSelector(state);
        expect(merged.map(d => d.code)).toEqual(['EPSG:25832', 'EPSG:3003', 'EPSG:4269']);
        // The 3003 entry is the dynamic one
        expect(merged.find(d => d.code === 'EPSG:3003').def).toBe('DYNAMIC-3003');
    });

    it('allProjectionDefsSelector handles an empty store gracefully', () => {
        expect(allProjectionDefsSelector({})).toEqual([]);
    });

    it('search slice selectors return defaults when state is empty', () => {
        expect(projectionSearchResultsSelector({})).toEqual([]);
        expect(projectionSearchLoadingSelector({})).toBe(false);
        expect(projectionSearchErrorSelector({})).toBe(null);
        expect(projectionSearchTotalSelector({})).toBe(0);
        expect(projectionSearchPageSelector({})).toBe(1);
        expect(projectionSearchPageSizeSelector({})).toBe(10);
        expect(projectionLoadingDefsSelector({})).toEqual([]);
        expect(projectionLoadFailedDefsSelector({})).toEqual({});
    });

    it('search slice selectors read through to projections.search', () => {
        const state = {
            projections: {
                staticDefs: [],
                dynamicDefs: [],
                search: {
                    loading: true,
                    results: [{ id: 'A' }],
                    error: 'boom',
                    total: 7,
                    page: 2,
                    pageSize: 25,
                    loadingDefs: ['EPSG:3003'],
                    failedDefs: { 'EPSG:25832': 'parse error' }
                }
            }
        };
        expect(projectionSearchResultsSelector(state)).toEqual([{ id: 'A' }]);
        expect(projectionSearchLoadingSelector(state)).toBe(true);
        expect(projectionSearchErrorSelector(state)).toBe('boom');
        expect(projectionSearchTotalSelector(state)).toBe(7);
        expect(projectionSearchPageSelector(state)).toBe(2);
        expect(projectionSearchPageSizeSelector(state)).toBe(25);
        expect(projectionLoadingDefsSelector(state)).toEqual(['EPSG:3003']);
        expect(projectionLoadFailedDefsSelector(state)).toEqual({ 'EPSG:25832': 'parse error' });
    });
});
