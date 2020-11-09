/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { boxSelectionStatus } from '../box';

const state = {
    box: {
        status: 'start'
    }
};

describe('Test box selectors', () => {
    it('should get status of box selection tool', () => {
        const status = boxSelectionStatus(state);
        expect(status).toEqual('start');
    });
});
