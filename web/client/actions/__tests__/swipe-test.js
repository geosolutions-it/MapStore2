/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { setActive, SET_ACTIVE } from '../swipe';

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
});
