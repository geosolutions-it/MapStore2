/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';

import { swipeToolStatusSelector } from '../swipe';

describe('SWIPE SELECTORS', () => {
    it('should test swipeToolStatusSelector', () => {
        const state = {
            swipe: {
                active: true,
                configuring: false
            }
        };

        expect(swipeToolStatusSelector(state)).toEqual(state.swipe);
    });
});
