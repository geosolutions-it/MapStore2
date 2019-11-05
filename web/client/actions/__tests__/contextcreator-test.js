/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

const {
    setCreationStep, SET_CREATION_STEP,
    clearContextCreator, CLEAR_CONTEXT_CREATOR,
    changeAttribute, CHANGE_ATTRIBUTE,
    contextSaved, CONTEXT_SAVED,
    saveNewContext, SAVE_CONTEXT
} = require('../contextcreator');

describe('contextcreator actions', () => {
    it('setCreationStep', () => {
        const retval = setCreationStep('test');
        expect(retval).toExist();
        expect(retval.stepId).toBe('test');
        expect(retval.type).toBe(SET_CREATION_STEP);
    });
    it('clearContextCreator', () => {
        const retval = clearContextCreator();
        expect(retval).toExist();
        expect(retval.type).toBe(CLEAR_CONTEXT_CREATOR);
    });
    it('changeAttribute', () => {
        const retval = changeAttribute('key', 0);
        expect(retval).toExist();
        expect(retval.key).toBe('key');
        expect(retval.value).toBe(0);
        expect(retval.type).toBe(CHANGE_ATTRIBUTE);
    });
    it('contextSaved', () => {
        const retval = contextSaved();
        expect(retval).toExist();
        expect(retval.type).toBe(CONTEXT_SAVED);
    });
    it('saveNewContext', () => {
        const retval = saveNewContext();
        expect(retval).toExist();
        expect(retval.type).toBe(SAVE_CONTEXT);
    });
});
