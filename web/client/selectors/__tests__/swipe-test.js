/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';

import { layerSwipeSettingsSelector, spyModeSettingsSelector, swipeModeSettingsSelector} from '../swipe';

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
});
