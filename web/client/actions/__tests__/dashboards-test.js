/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    setDashboardsAvailable,
    SET_DASHBOARDS_AVAILABLE,
    searchDashboards,
    SEARCH_DASHBOARDS,
    dashboardsLoading,
    LOADING,
    dashboardListLoaded,
    DASHBOARDS_LIST_LOADED,
    deleteDashboard,
    DELETE_DASHBOARD,
    dashboardDeleted,
    DASHBOARD_DELETED,
    reloadDashboards,
    RELOAD,
    setControl,
    SET_CONTROL
} from '../dashboards';

describe('dashboards (browse) actions', () => {
    it('setDashboardsAvailable', () => {
        const retval = setDashboardsAvailable(true);
        expect(retval).toExist();
        expect(retval.type).toBe(SET_DASHBOARDS_AVAILABLE);
        expect(retval.available).toBe(true);

    });
    it('searchDashboards', () => {
        const retval = searchDashboards();
        expect(retval).toExist();
        expect(retval.type).toBe(SEARCH_DASHBOARDS);
    });
    it('dashboardLoading', () => {
        const retval = dashboardsLoading(true, "test");
        expect(retval).toExist();
        expect(retval.type).toBe(LOADING);
        expect(retval.value).toBe(true);
        expect(retval.name).toBe("test");
    });
    it('dashboardListLoaded', () => {
        const retval = dashboardListLoaded({
            results: [{id: 1}],
            success: true,
            totalCount: 1
        }, {
            searchText: "test",
            options: "someOptions"
        });
        expect(retval).toExist();
        expect(retval.type).toBe(DASHBOARDS_LIST_LOADED);
        expect(retval.results[0].id).toBe(1);
        expect(retval.totalCount).toBe(1);
        expect(retval.success).toBe(true);
        expect(retval.searchText).toBe("test");
        expect(retval.options).toBe("someOptions");
    });
    it('deleteDashboard', () => {
        const retval = deleteDashboard(1);
        expect(retval).toExist();
        expect(retval.type).toBe(DELETE_DASHBOARD);
        expect(retval.id).toBe(1);
    });
    it('dashboardDeleted', () => {
        const retval = dashboardDeleted();
        expect(retval).toExist();
        expect(retval.type).toBe(DASHBOARD_DELETED);
    });
    it('reloadDashboards', () => {
        const retval = reloadDashboards();
        expect(retval).toExist();
        expect(retval.type).toBe(RELOAD);
    });
    it('setControl', () => {
        const control = 'delete.show';
        const retval = setControl(control, true);
        expect(retval).toExist();
        expect(retval.type).toBe(SET_CONTROL);
        expect(retval.control).toBe(control);
        expect(retval.value).toBe(true);
    });
});
