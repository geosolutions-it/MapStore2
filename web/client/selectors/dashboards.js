/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
    searchTextSelector: state => state && state.dashboards && state.dashboards.searchText,
    searchParamsSelector: state => state && state.dashboards && state.dashboards.options && state.dashboards.options.params,
    resultsSelector: state => state && state.dashboards && state.dashboards.results,
    totalCountSelector: state => state && state.dashboards && state.dashboards.totalCount,
    isLoadingSelector: state => state && state.dashboards && state.dashboards.loading,
    areDashboardsAvailable: state => state && state.dashboards && state.dashboards.available,
    isEditDialogOpen: state => state && state.dashboards && state.dashboards.showModal && state.dashboards.showModal.edit
};
