/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const showNewMapDialogSelector = (state) => state.createnewmap && state.createnewmap.showNewMapDialog;
export const newMapContextSelector = (state) => state.createnewmap && state.createnewmap.newMapContext;
export const hasContextsSelector = (state) => state.createnewmap && state.createnewmap.hasContexts;
export const loadingSelector = (state) => state.createnewmap && state.createnewmap.loading;
export const loadFlagsSelector = (state) => state.createnewmap && state.createnewmap.loadFlags;
