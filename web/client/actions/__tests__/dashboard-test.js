/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

const {
    setEditing, SET_EDITING,
    setEditorAvailable, SET_EDITOR_AVAILABLE
} = require('../dashboard');

it('setEditing', () => {
    const retval = setEditing();
    expect(retval).toExist();
    expect(retval.type).toBe(SET_EDITING);
});
it('setEditorAvailable', () => {
    const retval = setEditorAvailable();
    expect(retval).toExist();
    expect(retval.type).toBe(SET_EDITOR_AVAILABLE);
});
