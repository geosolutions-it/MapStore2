/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


export const searchTextSelector = state => state && state.dashboards && state.dashboards.searchText;
export const searchParamsSelector = state => state && state.dashboards && state.dashboards.options && state.dashboards.options.params;
export const resultsSelector = state => state && state.dashboards && state.dashboards.results;
export const totalCountSelector = state => state && state.dashboards && state.dashboards.totalCount;
export const isLoadingSelector = state => state && state.dashboards && state.dashboards.loading;
export const areDashboardsAvailable = state => state && state.dashboards && state.dashboards.available;
export const isEditDialogOpen = state => state && state.dashboards && state.dashboards.showModal && state.dashboards.showModal.edit;
