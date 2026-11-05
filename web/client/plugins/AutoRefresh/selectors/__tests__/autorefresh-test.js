/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    isPausedSelector,
    isActiveRefreshSelector,
    refreshableLayersSelector,
    availableLayersSelector
} from '../autorefresh';

describe('AutoRefresh selectors', () => {
    const layers = [
        { id: 'active', title: 'Active layer', group: 'overlay', type: 'wms', autoRefreshInterval: 60 },
        { id: 'paused', title: 'Paused layer', group: 'overlay', type: 'wms', autoRefreshInterval: 0 },
        { id: 'inactive', title: 'Inactive layer', group: 'overlay', type: 'wms', autoRefreshInterval: -1 },
        { id: 'unconfigured', title: 'Unconfigured layer', group: 'overlay', type: 'wfs' },
        { id: 'background', title: 'Background layer', group: 'background', autoRefreshInterval: 60 },
        { id: 'imported_vector', title: 'Imported vector layer', group: 'overlay', autoRefreshInterval: -1, type: 'vector' }
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

    describe('isPausedSelector', () => {
        it('returns the paused state', () => {
            expect(isPausedSelector(state)).toBe(false);
            expect(isPausedSelector({ autorefresh: { paused: true } })).toBe(true);
        });

        it('returns undefined when the plugin state is unavailable', () => {
            expect(isPausedSelector({})).toBe(undefined);
            expect(isPausedSelector(undefined)).toBe(undefined);
        });
    });

    describe('isActiveRefreshSelector', () => {
        it('returns the enabled state', () => {
            expect(isActiveRefreshSelector(state)).toBe(true);
            expect(isActiveRefreshSelector({ autorefresh: { enabled: false } })).toBe(false);
        });

        it('returns undefined when the plugin state is unavailable', () => {
            expect(isActiveRefreshSelector({})).toBe(undefined);
            expect(isActiveRefreshSelector(undefined)).toBe(undefined);
        });
    });

    describe('refreshableLayersSelector', () => {
        it('returns non-background layers with an interval greater than -1', () => {
            expect(refreshableLayersSelector(state)).toEqual([layers[0], layers[1]]);
        });

        it('returns an empty array when no layers can be refreshed', () => {
            expect(refreshableLayersSelector({ layers: { flat: [{ id: 'background', group: 'background', autoRefreshInterval: 60 }] } })).toEqual([]);
        });
    });

    describe('availableLayersSelector', () => {
        it('returns layers that are available for auto-refresh', () => {
            expect(availableLayersSelector(state)).toEqual([layers[1], layers[2], layers[3]]);
        });

        it('excludes layers already configured with a positive interval', () => {
            expect(availableLayersSelector({ layers: { flat: [layers[0], layers[4]] } })).toEqual([]);
        });
    });
});
