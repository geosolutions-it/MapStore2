/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';

import { layerSwipeSettingsSelector, spyModeSettingsSelector, swipeModeSettingsSelector, swipeSettingsSelector, swipeSliderSettingsSelector} from '../swipe';

describe('SWIPE SELECTORS', () => {
    it('should test layerSwipeSettingsSelector', () => {
        const state = {
            swipe: {
                active: true
            }
        };

        expect(layerSwipeSettingsSelector(state)).toEqual(state.swipe);
    });
    it('should test spyModeSettingsSelector', () => {
        const state = {
            swipe: {
                active: true,
                spy: {
                    radius: 80
                }
            }
        };

        expect(spyModeSettingsSelector(state)).toEqual(state.swipe.spy);
    });
    it('should test swipeModeSettingsSelector', () => {
        const state = {
            swipe: {
                active: true,
                swipe: {
                    direction: "cut-vertical"
                }
            }
        };

        expect(swipeModeSettingsSelector(state)).toEqual(state.swipe.swipe);
    });
    it('should test swipeSettingsSelector', () => {
        const state = {
            swipe: {
                active: true,
                swipe: {
                    direction: "cut-vertical"
                }
            }
        };

        expect(swipeSettingsSelector(state)).toEqual(state.swipe);
    });
    it('should test swipeSliderSettingsSelector', () => {
        const state = {
            swipe: {
                active: true,
                sliderOptions: {
                    pos: {x: 1, y: 10}
                }
            }
        };

        expect(swipeSliderSettingsSelector(state)).toEqual(state.swipe.sliderOptions);
    });
});
