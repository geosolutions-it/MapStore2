/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { showConfirmDeleteMapModalSelector } from '../../plugins/DeleteMap';

describe('deletemap selectors', () => {
    it('show confirm delete dialog selector', () => {
        const state = {
            controls: {
                mapDelete: {
                    "enabled": true
                }
            }
        };
        const showConfirmDelete = showConfirmDeleteMapModalSelector(state);
        expect(showConfirmDelete).toBe(true);
    });
});
