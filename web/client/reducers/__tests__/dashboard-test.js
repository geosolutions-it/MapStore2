/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const { setEditorAvailable, setEditing, triggerShowConnections } = require('../../actions/dashboard');
const { insertWidget, updateWidget, deleteWidget } = require('../../actions/widgets');
const dashboard = require('../dashboard');
describe('Test the dashboard reducer', () => {
    it('setEditorAvailable action', () => {
        const state = dashboard({}, setEditorAvailable( true ));
        expect(state.editor.available).toBe(true);
    });
    it('setEditing', () => {
        const state = dashboard({}, setEditing(true));
        expect(state.editing).toBe(true);
    });
    it('disable editing on insert/update/delete', () => {
        expect(dashboard({ editing: true }, insertWidget({})).editing).toBeFalsy();
        expect(dashboard({ editing: true }, updateWidget({})).editing).toBeFalsy();
        expect(dashboard({ editing: true }, deleteWidget({})).editing).toBeFalsy();
    });
    it('triggerShowConnections', () => {
        const state = dashboard({}, triggerShowConnections(true));
        expect(state.showConnections).toBe(true);
    });

});
