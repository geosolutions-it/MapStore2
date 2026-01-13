/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { SET_ACTIVE, SET_SPY_TOOL_RADIUS, SET_MODE, SET_SWIPE_TOOL_DIRECTION, SET_SWIPE_SLIDER_OPTIONS  } from '../../actions/swipe';
import swipe from '../swipe';
import { MAP_CONFIG_LOADED } from '../../actions/config';

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
        // reset sliderOptions in case deacvtivate tool
        const state2 = swipe({
            sliderOptions: {pos: {x: 1, y: 10}}
        }, action);
        expect(state.active).toBe(false);
        expect(state2.sliderOptions).toEqual({});
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
        // reset sliderOptions in case change direction
        const state2 = swipe({
            sliderOptions: {pos: {x: 1, y: 10}}
        }, action);
        expect(state2.swipe.direction).toEqual("cut-vertical");
        expect(state2.sliderOptions).toEqual({});
    });

    it('should set spy radius', () => {
        const action = {
            type: SET_SPY_TOOL_RADIUS,
            radius: 80
        };
        const state = swipe({}, action);
        expect(state.spy.radius).toBe(80);
    });
    it('test setting swipe data if map config loaded and', () => {
        const action = {
            type: MAP_CONFIG_LOADED,
            config: {
                swipe: {
                    active: true,
                    mode: 'swipe',
                    layerId: "layer01"
                }
            }
        };
        const state = swipe({}, action);

        expect(state).toEqual(action.config.swipe);
        // check loading a new empty map from previous map with swipe tool activated
        const state2 = swipe(state, {type: 'MAP_CONFIG_LOADED'});
        expect(state2).toEqual({});
    });
    it('test seting swipe slider options', () => {
        const action = {
            type: SET_SWIPE_SLIDER_OPTIONS,
            options: {pos: {x: 1, y: 10}}
        };
        const state = swipe({}, action);
        expect(state.sliderOptions).toEqual({pos: {x: 1, y: 10}});
    });
});
