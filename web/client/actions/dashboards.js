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
module.exports = {
    SET_DASHBOARDS_AVAILABLE,
    setDashboardsAvailable: (available) => ({ type: SET_DASHBOARDS_AVAILABLE, available }),
    SEARCH_DASHBOARDS,
    searchDashboards: (searchText) => ({ type: SEARCH_DASHBOARDS, searchText }),
    DASHBOARDS_LIST_LOADED,
    dashboardListLoaded: ({ results, success, totalCount }) => ({ type: DASHBOARDS_LIST_LOADED, results, success, totalCount })
};
