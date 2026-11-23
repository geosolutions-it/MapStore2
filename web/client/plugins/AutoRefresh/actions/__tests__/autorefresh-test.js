/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { changeLayerProperties, refreshLayerVersion } from '../../../../actions/layers';
import {
    AUTOREFRESH_START,
    AUTOREFRESH_STOP,
    AUTOREFRESH_PAUSE,
    autoRefreshStart,
    autoRefreshStop,
    autoRefreshPause,
    withWidgetLayerUpdates
} from '../autorefresh';

describe('AutoRefresh actions', () => {
    [
        { name: 'property changes', action: changeLayerProperties(['map'], { autoRefreshInterval: 60000 }) },
        { name: 'version refreshes', action: refreshLayerVersion(['map'], 123) }
    ].forEach(({ name, action }) => {
        it(`adds widget updates to ${name} without mutating the layer action`, () => {
            const updates = [{ widgetId: 'table', path: ['layer'], properties: action.newProperties }];
            Object.freeze(action);
            const wrapped = withWidgetLayerUpdates(action, updates);
            expect(wrapped).toNotBe(action);
            expect(wrapped).toEqual({ ...action, widgetUpdates: updates });
            expect(action.widgetUpdates).toBe(undefined);
        });

        it(`leaves ${name} unchanged when widget updates are empty or omitted`, () => {
            expect(withWidgetLayerUpdates(action)).toBe(action);
            expect(withWidgetLayerUpdates(action, [])).toBe(action);
        });
    });

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
