/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SET_CREATION_STEP = 'CONTEXTCREATOR:SET_CREATION_STEP';
export const CLEAR_CONTEXT_CREATOR = 'CONTEXTCREATOR:CLEAR_CONTEXT_CREATOR';
export const CHANGE_ATTRIBUTE = 'CONTEXTCREATOR:CHANGE_ATTRIBUTE';
export const CONTEXT_SAVED = 'CONTEXTCREATOR:CONTEXT_SAVED';
export const SAVE_CONTEXT = 'CONTEXTCREATOR:SAVE_CONTEXT';

export const setCreationStep = (stepId) => ({
    type: SET_CREATION_STEP,
    stepId
});

export const changeAttribute = (key, value) => ({
    type: CHANGE_ATTRIBUTE,
    key,
    value
});

export const clearContextCreator = () => ({
    type: CLEAR_CONTEXT_CREATOR
});

export const contextSaved = (id) => ({
    type: CONTEXT_SAVED,
    id
});

export const saveNewContext = () => ({
    type: SAVE_CONTEXT
});
