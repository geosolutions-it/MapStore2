/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { createStateMocker } from './reducersTestUtils';
import {
    setContext,
    setResource,
    loading
} from '../../actions/context';


import context from '../context';
import {
    currentContextSelector,
    resourceSelector,
    isLoadingSelector
} from '../../selectors/context';


describe('context reducer', () => {
    const stateMocker = createStateMocker({ context });
    it('loadContext', () => {
        const CONTEXT = {};
        const state = stateMocker(setContext(CONTEXT));
        expect(currentContextSelector(state)).toBe(CONTEXT);
    });
    it('setResource', () => {
        const RESOURCE = {};
        const state = stateMocker(setResource(RESOURCE));
        expect(resourceSelector(state)).toBe(RESOURCE);
    });
    it('loading', () => {
        const state = stateMocker(loading(true));
        expect(isLoadingSelector(state)).toBe(true);
    });

});
