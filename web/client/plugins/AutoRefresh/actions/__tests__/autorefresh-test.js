/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    AUTOREFRESH_START,
    AUTOREFRESH_STOP,
    AUTOREFRESH_PAUSE,
    autoRefreshStart,
    autoRefreshStop,
    autoRefreshPause
} from '../autorefresh';

describe('AutoRefresh actions', () => {
    it('creates the start action', () => {
        expect(autoRefreshStart()).toEqual({
            type: AUTOREFRESH_START,
            enabled: true
        });
    });

    it('creates the stop action', () => {
        expect(autoRefreshStop()).toEqual({
            type: AUTOREFRESH_STOP,
            enabled: false
        });
    });

    it('creates the pause action', () => {
        expect(autoRefreshPause(true)).toEqual({
            type: AUTOREFRESH_PAUSE,
            paused: true
        });
    });

    it('creates the resume action', () => {
        expect(autoRefreshPause(false)).toEqual({
            type: AUTOREFRESH_PAUSE,
            paused: false
        });
    });
});
