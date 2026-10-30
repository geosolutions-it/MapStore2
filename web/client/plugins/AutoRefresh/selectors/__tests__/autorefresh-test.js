/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    isPaused,
    isActiveRefresh,
    refreshableLayers,
    availableLayers
} from '../autorefresh';

describe('AutoRefresh selectors', () => {
    const layers = [
        { id: 'active', title: 'Active layer', group: 'overlay', autoRefreshInterval: 60 },
        { id: 'paused', title: 'Paused layer', group: 'overlay', autoRefreshInterval: 0 },
        { id: 'inactive', title: 'Inactive layer', group: 'overlay', autoRefreshInterval: -1 },
        { id: 'unconfigured', title: 'Unconfigured layer', group: 'overlay' },
        { id: 'background', title: 'Background layer', group: 'background', autoRefreshInterval: 60 }
    ];

    const state = {
        autorefresh: {
            enabled: true,
            paused: false
        },
        layers: {
            flat: layers
        }
    };

    describe('isPaused', () => {
        it('returns the paused state', () => {
            expect(isPaused(state)).toBe(false);
            expect(isPaused({ autorefresh: { paused: true } })).toBe(true);
        });

        it('returns undefined when the plugin state is unavailable', () => {
            expect(isPaused({})).toBe(undefined);
            expect(isPaused(undefined)).toBe(undefined);
        });
    });

    describe('isActiveRefresh', () => {
        it('returns the enabled state', () => {
            expect(isActiveRefresh(state)).toBe(true);
            expect(isActiveRefresh({ autorefresh: { enabled: false } })).toBe(false);
        });

        it('returns undefined when the plugin state is unavailable', () => {
            expect(isActiveRefresh({})).toBe(undefined);
            expect(isActiveRefresh(undefined)).toBe(undefined);
        });
    });

    describe('refreshableLayers', () => {
        it('returns non-background layers with an interval greater than -1', () => {
            expect(refreshableLayers(state)).toEqual([layers[0], layers[1]]);
        });

        it('returns an empty array when no layers can be refreshed', () => {
            expect(refreshableLayers({ layers: { flat: [{ id: 'background', group: 'background', autoRefreshInterval: 60 }] } })).toEqual([]);
        });
    });

    describe('availableLayers', () => {
        it('returns non-background layers with a missing, zero, or disabled interval', () => {
            expect(availableLayers(state)).toEqual([layers[1], layers[2], layers[3]]);
        });

        it('excludes layers already configured with a positive interval', () => {
            expect(availableLayers({ layers: { flat: [layers[0], layers[4]] } })).toEqual([]);
        });
    });
});
