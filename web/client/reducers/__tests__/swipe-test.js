/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { SET_ACTIVE } from '../../actions/swipe';
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
});
