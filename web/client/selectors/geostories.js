/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


export const searchTextSelector = state => state && state.geostories && state.geostories.searchText;
export const searchParamsSelector = state => state && state.geostories && state.geostories.options && state.geostories.options.params;
export const resultsSelector = state => state && state.geostories && state.geostories.results;
export const totalCountSelector = state => state && state.geostories && state.geostories.totalCount;
export const isLoadingSelector = state => state && state.geostories && state.geostories.loading;
export const areGeostoriesAvailable = state => state && state.geostories && state.geostories.available;
export const isEditDialogOpen = state => state && state.geostories && state.geostories.showModal && state.geostories.showModal.edit;
