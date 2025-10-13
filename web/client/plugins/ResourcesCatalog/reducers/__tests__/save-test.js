/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import save from '../save';
import { SET_PENDING_CHANGES } from '../../actions/save';

describe('save reducer', () => {
    it('should return initial state', () => {
        const result = save(undefined, {});

        expect(result).toExist();
        expect(result.pendingChanges).toEqual({});
    });

    it('should handle SET_PENDING_CHANGES action', () => {
        const pendingChanges = {
            name: 'Updated Map',
            description: 'Updated Description',
            data: true
        };

        const action = {
            type: SET_PENDING_CHANGES,
            pendingChanges
        };

        const result = save({}, action);

        expect(result).toExist();
        expect(result.pendingChanges).toEqual(pendingChanges);
    });

    it('should return current state for unknown action', () => {
        const currentState = {
            pendingChanges: { name: 'test' }
        };

        const action = {
            type: 'UNKNOWN_ACTION'
        };

        const result = save(currentState, action);

        expect(result).toEqual(currentState);
    });
});
