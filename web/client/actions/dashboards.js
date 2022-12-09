/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SET_DASHBOARDS_AVAILABLE = "DASHBOARDS:SET_DASHBOARDS_AVAILABLE";
export const SEARCH_DASHBOARDS = "DASHBOARDS:SEARCH_DASHBOARDS";
export const DASHBOARDS_LIST_LOADED = "DASHBOARDS:DASHBOARDS_LIST_LOADED";
export const DELETE_DASHBOARD = "DASHBOARDS:DELETE_DASHBOARD";
export const DASHBOARD_DELETED = "DASHBOARDS:DASHBOARD_DELETED";
export const RELOAD = "DASHBOARDS:RELOAD_DASHBOARDS";
export const LOADING = "DASHBOARDS:LOADING";
export const SET_CONTROL = "DASHBOARDS:SET_CONTROL";


export const setDashboardsAvailable = (available) => ({ type: SET_DASHBOARDS_AVAILABLE, available });
export const searchDashboards = (searchText, params) => ({ type: SEARCH_DASHBOARDS, searchText, params });
/**
 * @param {boolean} value the value of the flag
 * @param {string} [name] the name of the flag to set. loading is anyway always triggered
 */
export const dashboardsLoading = (value, name = "loading") => ({
    type: LOADING,
    name,
    value
});
export const dashboardListLoaded = ({ results, success, totalCount }, { searchText, options } = {}) => ({ type: DASHBOARDS_LIST_LOADED, results, success, totalCount, searchText, options });
export const deleteDashboard = id => ({type: DELETE_DASHBOARD, id});
export const reloadDashboards = () => ({ type: RELOAD});
export const dashboardDeleted = id => ({type: DASHBOARD_DELETED, id});

/**
 * Sets the variables for the controls of Dashboard. Can be used for dialogs or other tools
 * specific of Dashboard.
 * @param {string} control path to the control or control value to set
 * @param {object} value any value you want to set for the control
 */
export const setControl = (control, value) => ({ type: SET_CONTROL, control, value });
