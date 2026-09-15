/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import autorefresh from '../autorefresh';
import {
    autoRefreshStart,
    autoRefreshStop,
    autoRefreshPause
} from '../../actions/autorefresh';

describe('AutoRefresh reducer', () => {
    const initialState = {
        enabled: false,
        paused: false
    };

    it('returns the initial state when state is undefined', () => {
        expect(autorefresh(undefined, { type: 'UNKNOWN_ACTION' })).toEqual(initialState);
    });

    it('returns the original state for an unknown action', () => {
        const state = {
            enabled: true,
            paused: true
        };

        expect(autorefresh(state, { type: 'UNKNOWN_ACTION' })).toBe(state);
    });

    it('enables refresh and clears the paused state when started', () => {
        expect(autorefresh({ enabled: false, paused: true }, autoRefreshStart())).toEqual({
            enabled: true,
            paused: false
        });
    });

    it('disables refresh and clears the paused state when stopped', () => {
        expect(autorefresh({ enabled: true, paused: true }, autoRefreshStop())).toEqual({
            enabled: false,
            paused: false
        });
    });

    it('pauses refresh without changing its enabled state', () => {
        expect(autorefresh({ enabled: true, paused: false }, autoRefreshPause(true))).toEqual({
            enabled: true,
            paused: true
        });
    });

    it('resumes refresh without changing its enabled state', () => {
        expect(autorefresh({ enabled: true, paused: true }, autoRefreshPause(false))).toEqual({
            enabled: true,
            paused: false
        });
    });
});
