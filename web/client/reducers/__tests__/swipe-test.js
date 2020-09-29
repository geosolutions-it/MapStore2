/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { SET_ACTIVE  } from '../../actions/swipe';
import swipe from '../swipe';

it('should make swipe active', () => {
    const action = {
        type: SET_ACTIVE,
        active: true
    };
    const state = swipe({}, action);
    expect(state).toExist();
    expect(state.active).toExist();
    expect(state.active).toBe(true);
});

it('should deactivate swipe', () => {
    const action = {
        type: SET_ACTIVE,
        active: false
    };
    const state = swipe({}, action);
    expect(state).toExist();
    expect(state.active).toExist();
    expect(state.active).toBe(false);
});
