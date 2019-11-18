/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import contextcreator from '../contextcreator';
import {
    setCreationStep,
    clearContextCreator,
    changeAttribute
} from '../../actions/contextcreator';

describe('contextcreator reducer', () => {
    it('setCreationStep', () => {
        const state = contextcreator(undefined, setCreationStep('step'));
        expect(state).toExist();
        expect(state.stepId).toBe('step');
    });
    it('clearContextCreator', () => {
        const state = contextcreator(undefined, clearContextCreator());
        expect(state).toEqual({});
    });
    it('changeAttribute', () => {
        const state = contextcreator(undefined, changeAttribute('key', 1));
        expect(state).toExist();
        expect(state.newContext).toExist();
        expect(state.newContext.key).toBe(1);
    });
});
