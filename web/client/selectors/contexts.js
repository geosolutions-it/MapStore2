/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSelector } from 'reselect';

export const searchTextSelector = state => state && state.contexts && state.contexts.searchText;
export const searchOptionsSelector = state => state && state.contexts && state.contexts.options;
export const searchParamsSelector = createSelector(searchOptionsSelector, options => options && options.params);
export const resultsSelector = state => state && state.contexts && state.contexts.results;
export const totalCountSelector = state => state && state.contexts && state.contexts.totalCount;
export const isLoadingSelector = state => state && state.contexts && state.contexts.loading;
export const isAvailableSelector = state => state && state.contexts && state.contexts.available;
