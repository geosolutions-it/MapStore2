/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const {
    setEditorAvailable,
    setEditing,
    triggerShowConnections,
    triggerSave,
    triggerSaveAs,
    dashboardLoaded,
    dashboardSaved,
    dashboardSaveError,
    dashboardLoading } = require('../../actions/dashboard');
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
    it('dashboard triggerSave', () => {
        const action = triggerSave(true);
        const state = dashboard( undefined, action);
        expect(state).toExist();
        expect(state.showSaveModal).toBe(true);
    });
    it('dashboard triggerSaveAs', () => {
        const action = triggerSaveAs(true);
        const state = dashboard( undefined, action);
        expect(state).toExist();
        expect(state.showSaveAsModal).toBe(true);
    });
    it('dashboard dashboardLoaded', () => {
        const action = dashboardLoaded("TEST");
        const state = dashboard( undefined, action);
        expect(state).toExist();
        expect(state.resource).toBe("TEST");
    });
    it('dashboard dashboardSaveError', () => {
        const action = dashboardSaveError(["error1"]);
        const state = dashboard( undefined, action);
        expect(state).toExist();
        expect(state.saveErrors.length).toBe(1);
    });
    it('dashboard dashboardSaved', () => {
        const action = dashboardSaved();
        const state = dashboard( {saveErrors: ["error"]}, action);
        expect(state.saveErrors).toNotExist();
        expect(state).toExist();
    });
    it('dashboard dashboardLoading', () => {
        const action = dashboardLoading(true, "saving");
        const state = dashboard( undefined, action);
        expect(state).toExist();
        expect(state.loading).toBe(true);
        expect(state.loadFlags.saving).toBe(true);
    });


});
