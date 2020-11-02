/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import box from '../box';
import { CHANGE_BOX_SELECTION_STATUS } from '../../actions/box';

describe('Test the box reducer', () => {
    it('should update state with box selection status', () => {

        const initialState = {
            status: null
        };

        const action = {
            status: 'start',
            type: CHANGE_BOX_SELECTION_STATUS
        };

        const state = box(initialState, action);
        expect(state.status).toBe("start");
    });

});
