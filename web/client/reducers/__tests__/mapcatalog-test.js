/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    triggerReload
} from '../../actions/mapcatalog';

import mapcatalog from '../mapcatalog';

describe('mapcatalog reducer', () => {
    it('triggerReload', () => {
        const state = mapcatalog(undefined, triggerReload());
        expect(state).toExist();
        expect(state.triggerReloadValue).toBe(true);
        const newState = mapcatalog(state, triggerReload());
        expect(newState).toExist();
        expect(newState.triggerReloadValue).toBe(false);
    });
});
