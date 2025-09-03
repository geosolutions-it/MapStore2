/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    setEditorAvailable,
    setEditing,
    triggerShowConnections,
    triggerSave,
    triggerSaveAs,
    dashboardLoaded,
    dashboardSaved,
    dashboardSaveError,
    dashboardLoading,
    dashboardSetSelectedService,
    dashboardUpdateServices,
    setDashboardCatalogMode,
    setDashboardServiceSaveLoading,
    dashboardDeleteService,
    updateDashboardService,
    initPlugin
} from '../../actions/dashboard';
import {
    setCredentialsAction,
    clearSecurity
} from '../../actions/security';

import { insertWidget, updateWidget, deleteWidget } from '../../actions/widgets';
import dashboard from '../dashboard';
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
        const data = {
            catalogs: {"service": {name: "ws", ur: "url"}}
        };
        const action = dashboardLoaded("TEST", data);
        const state = dashboard( undefined, action);
        expect(state).toExist();
        expect(state.resource).toBe("TEST");
        expect(state.originalData).toBe(data);
        expect(state.services).toBe(data.catalogs);
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

    it('dashboard dashboardSetSelectedService', () => {
        const selectedService = {name: "ws", url: "url", title: 'test', key: 'gs_ws'};
        const action = dashboardSetSelectedService(selectedService, {});
        const state = dashboard(undefined, action);
        expect(state).toExist();
        expect(state.selectedService).toBe(selectedService.key);
    });

    it('dashboard dashboardUpdateServices', () => {
        const services = {ws: {name: "ws", url: "url", key: 'ws'}};
        const action = dashboardUpdateServices(services);
        const state = dashboard(undefined, action);
        expect(state).toExist();
        expect(state.services).toBe(services);

    });

    it('dashboard setDashboardCatalogMode', () => {
        const action = setDashboardCatalogMode("edit", false);
        const state = dashboard(undefined, action);
        expect(state).toExist();
        expect(state.mode).toBe("edit");
        expect(state.isNew).toBe(false);

    });

    it('dashboard setDashboardServiceSaveLoading', () => {
        const action = setDashboardServiceSaveLoading(false);
        const state = dashboard(undefined, action);
        expect(state).toExist();
        expect(state.saveServiceLoading).toBe(false);

    });

    it('dashboard dashboardDeleteService', () => {
        const services = {test: {title: 'test'}};
        const action = dashboardDeleteService({title: 'deleted'}, services);
        const state = dashboard(undefined, action);
        expect(state).toExist();
        expect(state.mode).toBe('view');
        expect(state.services).toBe(services);
        expect(state.selectedService).toBe(services.test.title);


    });


    it('dashboard updateDashboardService', () => {
        const services = {test: {title: 'test', key: 'test'}};
        const service = {title: 'deleted', key: 'test'};
        const action = updateDashboardService(service, services, true);
        const state = dashboard(undefined, action);
        expect(state).toExist();
        expect(state.mode).toBe('view');
        expect(state.services.test).toBe(service);
        expect(state.selectedService).toBe('test');

    });
    it('dashboard onInitPlugin', () => {
        let action = initPlugin({option: "test"});
        let state = dashboard({}, action);
        expect(state.option).toBeTruthy();
        expect(state.option).toBe("test");

        action = initPlugin();
        state = dashboard({serviceStarted: false}, action);
        expect(state).toEqual({serviceStarted: false});
    });
    it('dashboard setCredentials', () => {
        let action = setCredentialsAction({protectedId: "protectedId"}, {username: "test", password: "pwd"});
        let state = dashboard({}, action);
        expect(state.protectedId).toBe("protectedId");
    });
    it('dashboard clearSecurity', () => {
        let action = clearSecurity();
        let state = dashboard({}, action);
        expect(state.protectedId).toBe(undefined);
    });
});
