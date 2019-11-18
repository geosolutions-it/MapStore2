/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSelector } from 'reselect';

export const searchTextSelector = state => state && state.contextmanager && state.contextmanager.searchText;
export const searchOptionsSelector = state => state && state.contextmanager && state.contextmanager.searchOptions;
export const searchParamsSelector = createSelector(searchOptionsSelector, options => options && options.params);
export const resultsSelector = state => state && state.contextmanager && state.contextmanager.results;
export const totalCountSelector = state => state && state.contextmanager && state.contextmanager.totalCount;
export const isLoadingSelector = state => state && state.contextmanager && state.contextmanager.loading;
