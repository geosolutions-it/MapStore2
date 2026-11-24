/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import autorefresh from '../autorefresh';
import { autoRefreshStart, autoRefreshStop, autoRefreshPause, autoRefreshUpdated, autoRefreshInit } from '../../actions/autorefresh';
import { MAP_CONFIG_LOADED } from '../../../../actions/config';
import { DASHBOARD_LOADED, DASHBOARD_RESET, LOAD_DASHBOARD } from '../../../../actions/dashboard';
import { LOCATION_CHANGE } from 'connected-react-router';

describe('AutoRefresh reducer', () => {
    it('starts disabled with transient status', () => {
        expect(autorefresh(undefined, {}).enabled).toBe(false);
        expect(autorefresh(undefined, {}).lastRefresh).toBe(null);
    });
    it('does not bypass a pause when activated', () => {
        expect(autorefresh({ enabled: false, paused: true }, autoRefreshStart())).toEqual({ enabled: true, paused: true });
    });
    it('can stop, pause and resume', () => {
        expect(autorefresh({ enabled: true, paused: true }, autoRefreshStop())).toEqual({ enabled: false, paused: false });
        expect(autorefresh({ enabled: true }, autoRefreshPause(true)).paused).toBe(true);
        expect(autorefresh({ enabled: true, paused: true }, autoRefreshPause(false)).paused).toBe(false);
    });
    it('resets on map/dashboard loading, reset and navigation while retaining configuration', () => {
        [MAP_CONFIG_LOADED, DASHBOARD_LOADED, DASHBOARD_RESET, LOAD_DASHBOARD, LOCATION_CHANGE].forEach(type => {
            const next = autorefresh({ enabled: true, paused: true, lastRefresh: 123, minimumRefreshInterval: 1000 }, { type });
            expect(next).toEqual({ enabled: false, paused: false, lastRefresh: null, minimumRefreshInterval: 1000 });
        });
    });
    it('records a refresh without enabling automatic timers', () => {
        const initial = autorefresh(undefined, autoRefreshInit(1000));
        expect(autorefresh(initial, autoRefreshUpdated(123))).toEqual({ ...initial, lastRefresh: 123 });
    });
});
