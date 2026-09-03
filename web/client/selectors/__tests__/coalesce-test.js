/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { coalesceExcludeIdsSelector } from '../coalesce';

describe('COALESCE SELECTORS', () => {
    it('should collect the ids of the tools that need a dedicated renderer layer', () => {
        expect(coalesceExcludeIdsSelector({})).toEqual([]);
        expect(coalesceExcludeIdsSelector({ swipe: { layerId: 'layer01' } })).toEqual(['layer01']);
        expect(coalesceExcludeIdsSelector({ draw: { snappingLayer: 'layer02' } })).toEqual(['layer02']);
        expect(coalesceExcludeIdsSelector({
            swipe: { layerId: 'layer01' },
            draw: { snappingLayer: 'layer02' }
        })).toEqual(['layer01', 'layer02']);
    });
    it('should return a stable reference for unchanged state', () => {
        // the Map plugin compares the memo dependencies by reference, a new array on every call would regroup on every render
        const state = { swipe: { layerId: 'layer01' } };
        expect(coalesceExcludeIdsSelector(state)).toBe(coalesceExcludeIdsSelector(state));
        const emptyState = {};
        expect(coalesceExcludeIdsSelector(emptyState)).toBe(coalesceExcludeIdsSelector(emptyState));
    });
});
