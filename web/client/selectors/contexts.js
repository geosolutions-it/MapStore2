/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const searchTextSelector = state => state && state.contexts && state.contexts.searchText;
export const searchParamsSelector = state => state && state.contexts && state.contexts.options && state.contexts.options.params;
export const resultsSelector = state => state && state.contexts && state.contexts.results;
export const totalCountSelector = state => state && state.contexts && state.contexts.totalCount;
export const isLoadingSelector = state => state && state.contexts && state.contexts.loading;
export const areGeostoriesAvailable = state => state && state.contexts && state.contexts.available;
export const isEditDialogOpen = state => state && state.contexts && state.contexts.showModal && state.contexts.showModal.edit;
