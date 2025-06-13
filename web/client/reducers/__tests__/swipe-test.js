/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { SET_ACTIVE, SET_SPY_TOOL_RADIUS, SET_MODE, SET_SWIPE_TOOL_DIRECTION  } from '../../actions/swipe';
import swipe from '../swipe';

describe('Swipe tool REDUCERS', () => {
    it('should activate tool', () => {
        const action = {
            type: SET_ACTIVE,
            active: true,
            prop: "active"
        };
        const state = swipe({}, action);
        expect(state.active).toBe(true);
    });

    it('should deactivate tool', () => {
        const action = {
            type: SET_ACTIVE,
            active: false,
            prop: "active"
        };
        const state = swipe({}, action);
        expect(state.active).toBe(false);
    });

    it('should set tool mode', () => {
        const action = {
            type: SET_MODE,
            mode: "spy"
        };
        const state = swipe({}, action);
        expect(state.mode).toBe("spy");
    });

    it('should set swipe bar direction', () => {
        const action = {
            type: SET_SWIPE_TOOL_DIRECTION,
            direction: "cut-vertical"
        };
        const state = swipe({}, action);
        expect(state.swipe.direction).toBe("cut-vertical");
    });

    it('should set spy radius', () => {
        const action = {
            type: SET_SPY_TOOL_RADIUS,
            radius: 80
        };
        const state = swipe({}, action);
        expect(state.spy.radius).toBe(80);
    });
});
