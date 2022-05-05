/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import sidebarmenu from '../sidebarmenu';
import {SET_LAST_ACTIVE_ITEM} from "../../actions/sidebarmenu";

describe('SidebarMenu REDUCERS', () => {
    it('should set last active item', () => {
        const action = {
            type: SET_LAST_ACTIVE_ITEM,
            value: 'annotations'
        };
        const state = sidebarmenu({}, action);
        expect(state.lastActiveItem).toBe('annotations');
    });
});
