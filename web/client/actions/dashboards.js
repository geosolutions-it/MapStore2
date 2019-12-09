/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const SET_DASHBOARDS_AVAILABLE = "DASHBOARDS:SET_DASHBOARDS_AVAILABLE";
const SEARCH_DASHBOARDS = "DASHBOARDS:SEARCH_DASHBOARDS";
const DASHBOARDS_LIST_LOADED = "DASHBOARDS:DASHBOARDS_LIST_LOADED";
const DELETE_DASHBOARD = "DASHBOARDS:DELETE_DASHBOARD";
const DASHBOARD_DELETED = "DASHBOARDS:DASHBOARD_DELETED";
const RELOAD = "DASHBOARDS:RELOAD_DASHBOARDS";
const LOADING = "DASHBOARDS:LOADING";


module.exports = {
    SET_DASHBOARDS_AVAILABLE,
    setDashboardsAvailable: (available) => ({ type: SET_DASHBOARDS_AVAILABLE, available }),
    SEARCH_DASHBOARDS,
    searchDashboards: (searchText, params) => ({ type: SEARCH_DASHBOARDS, searchText, params }),
    LOADING,
    /**
     * @param {boolean} value the value of the flag
     * @param {string} [name] the name of the flag to set. loading is anyway always triggered
     */
    dashboardsLoading: (value, name = "loading") => ({
        type: LOADING,
        name,
        value
    }),
    DASHBOARDS_LIST_LOADED,
    dashboardListLoaded: ({ results, success, totalCount }, { searchText, options } = {}) => ({ type: DASHBOARDS_LIST_LOADED, results, success, totalCount, searchText, options }),
    DELETE_DASHBOARD,
    deleteDashboard: id => ({type: DELETE_DASHBOARD, id}),
    DASHBOARD_DELETED,
    RELOAD,
    reloadDashboards: () => ({ type: RELOAD}),
    dashboardDeleted: id => ({type: DASHBOARD_DELETED, id})
};
