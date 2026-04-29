/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import crsselector from '../crsselector';

describe('Test the crsselector reducer', () => {
    it('change the filtered input projection', () => {
        const state = crsselector({}, {
            type: 'CHANGE_CRS_INPUT_VALUE',
            value: 'EPSG:4326'
        });
        expect(state).toExist();
        expect(state.value).toBe('EPSG:4326');
    });

    it('SET_CAN_EDIT_PROJECTION updates canEdit flag', () => {
        const enabled = crsselector({}, { type: 'SET_CAN_EDIT_PROJECTION', canEdit: true });
        expect(enabled.canEdit).toBe(true);
        const disabled = crsselector(enabled, { type: 'SET_CAN_EDIT_PROJECTION', canEdit: false });
        expect(disabled.canEdit).toBe(false);
    });

    it('SET_PROJECTIONS_CONFIG replaces config (does not merge) so undefined resets', () => {
        // First map: persisted projectionList lands in state.config
        const first = crsselector({}, {
            type: 'SET_PROJECTIONS_CONFIG',
            config: { projectionList: [{ value: 'EPSG:4326' }] }
        });
        expect(first.config).toEqual({ projectionList: [{ value: 'EPSG:4326' }] });

        // Navigating to a map with no crsSelector block: epic dispatches
        // SET_PROJECTIONS_CONFIG with undefined - prior list must be cleared
        // so it does not leak across maps.
        const cleared = crsselector(first, {
            type: 'SET_PROJECTIONS_CONFIG',
            config: undefined
        });
        expect(cleared.config).toEqual({});

        // A new map's config replaces (not merges) the prior config
        const second = crsselector(first, {
            type: 'SET_PROJECTIONS_CONFIG',
            config: { projectionList: [{ value: 'EPSG:3003' }] }
        });
        expect(second.config).toEqual({ projectionList: [{ value: 'EPSG:3003' }] });
    });

    it('returns the same state reference for unknown actions', () => {
        const initial = { value: 'EPSG:4326' };
        const next = crsselector(initial, { type: 'UNKNOWN' });
        expect(next).toBe(initial);
    });
});
