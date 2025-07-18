/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    setActive,
    setMode,
    setSpyToolRadius,
    setSwipeToolDirection,
    SET_ACTIVE,
    SET_MODE,
    SET_SWIPE_TOOL_DIRECTION,
    SET_SPY_TOOL_RADIUS,
    SET_SWIPE_SLIDER_OPTIONS,
    setSwipeSliderOps
} from '../swipe';

describe('Test correctness of the swipe actions', () => {
    it('toggle layer swipe active settings', () => {
        const actionOn = setActive(true);
        expect(actionOn).toExist();
        expect(actionOn.type).toBe(SET_ACTIVE);
        expect(actionOn.active).toBe(true);

        const actionOff = setActive(false);
        expect(actionOff).toExist();
        expect(actionOff.type).toBe(SET_ACTIVE);
        expect(actionOff.active).toBe(false);
    });
    it('should set mode with default being swipe', () => {
        const defaultAction = setMode();
        expect(defaultAction).toExist();
        expect(defaultAction.type).toBe(SET_MODE);
        expect(defaultAction.mode).toBe("swipe");

        const action = setMode("spy");
        expect(action).toExist();
        expect(action.type).toBe(SET_MODE);
        expect(action.mode).toBe("spy");
    });
    it('should set swipe direction', () => {
        const action = setSwipeToolDirection("cut-vertical");
        expect(action).toExist();
        expect(action.type).toBe(SET_SWIPE_TOOL_DIRECTION);
        expect(action.direction).toBe("cut-vertical");
    });
    it('should set spy tool radius', () => {
        const action = setSpyToolRadius(80);
        expect(action).toExist();
        expect(action.type).toBe(SET_SPY_TOOL_RADIUS);
        expect(action.radius).toBe(80);
    });
    it('should set swipe slider options', () => {
        const action1 = setSwipeSliderOps({pos: {x: 0, y: 0}});
        expect(action1).toExist();
        expect(action1.type).toEqual(SET_SWIPE_SLIDER_OPTIONS);
        expect(action1.options).toEqual({pos: {x: 0, y: 0}});
        // in reset
        const action2 = setSwipeSliderOps({});
        expect(action2).toExist();
        expect(action2.type).toEqual(SET_SWIPE_SLIDER_OPTIONS);
        expect(action2.options).toEqual({});
    });
});
