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
    setEditorAvailable, SET_EDITOR_AVAILABLE,
    triggerShowConnections, SHOW_CONNECTIONS,
    triggerSave, TRIGGER_SAVE_MODAL,
    saveDashboard, SAVE_DASHBOARD,
    dashboardSaveError, SAVE_ERROR,
    dashboardSaved, DASHBOARD_SAVED,
    loadDashboard, LOAD_DASHBOARD,
    resetDashboard, DASHBOARD_RESET,
    dashboardLoaded, DASHBOARD_LOADED,
    dashboardLoading, DASHBOARD_LOADING,
    dashboardLoadError, DASHBOARD_LOAD_ERROR
} = require('../dashboard');

describe('Test correctness of the dashboard actions', () => {
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
    it('triggerShowConnections', () => {
        const retval = triggerShowConnections(true);
        expect(retval).toExist();
        expect(retval.type).toBe(SHOW_CONNECTIONS);
        expect(retval.show).toBe(true);
    });
    it('triggerShowConnections', () => {
        const retval = triggerShowConnections();
        expect(retval).toExist();
        expect(retval.type).toBe(SHOW_CONNECTIONS);
    });
    it('triggerSave', () => {
        const retval = triggerSave();
        expect(retval).toExist();
        expect(retval.type).toBe(TRIGGER_SAVE_MODAL);
    });
    it('saveDashboard', () => {
        const retval = saveDashboard({TEST: "TEST"});
        expect(retval).toExist();
        expect(retval.type).toBe(SAVE_DASHBOARD);
        expect(retval.resource.TEST).toBe("TEST");
    });
    it('dashboardSaveError', () => {
        const retval = dashboardSaveError("ERROR");
        expect(retval).toExist();
        expect(retval.type).toBe(SAVE_ERROR);
        expect(retval.error).toBe("ERROR");
    });
    it('dashboardSaved', () => {
        const retval = dashboardSaved();
        expect(retval).toExist();
        expect(retval.type).toBe(DASHBOARD_SAVED);
    });
    it('loadDashboard', () => {
        const retval = loadDashboard(1);
        expect(retval).toExist();
        expect(retval.type).toBe(LOAD_DASHBOARD);
        expect(retval.id).toBe(1);
    });
    it('resetDashboard', () => {
        const retval = resetDashboard();
        expect(retval).toExist();
        expect(retval.type).toBe(DASHBOARD_RESET);
    });
    it('dashboardLoaded', () => {
        const retval = dashboardLoaded("RES", "DATA");
        expect(retval).toExist();
        expect(retval.type).toBe(DASHBOARD_LOADED);
        expect(retval.resource).toBe("RES");
        expect(retval.data).toBe("DATA");
    });
    it('dashboardLoading default', () => {
        const retval = dashboardLoading(false);
        expect(retval).toExist();
        expect(retval.type).toBe(DASHBOARD_LOADING);
        expect(retval.name).toBe("loading");
        expect(retval.value).toBe(false);
    });
    it('dashboardLoading', () => {
        const retval = dashboardLoading(true, "saving");
        expect(retval).toExist();
        expect(retval.type).toBe(DASHBOARD_LOADING);
        expect(retval.name).toBe("saving");
        expect(retval.value).toBe(true);
    });
    it('dashboardLoadError', () => {
        const error = {status: 404};
        const retval = dashboardLoadError(error);
        expect(retval).toExist();
        expect(retval.type).toBe(DASHBOARD_LOAD_ERROR);
        expect(retval.error).toBe(error);
    });
});
