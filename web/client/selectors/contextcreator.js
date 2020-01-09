/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {createSelector} from 'reselect';

export const newContextSelector = state => state.contextcreator && state.contextcreator.newContext;
export const mapConfigSelector = createSelector(newContextSelector, context => context && context.mapConfig);
export const creationStepSelector = state => state.contextcreator && state.contextcreator.stepId;
export const resourceSelector = state => state.contextcreator && state.contextcreator.resource;
export const mapViewerLoadedSelector = state => state.contextcreator && state.contextcreator.mapViewerLoaded;
export const reloadConfirmSelector = state => state.contextcreator && state.contextcreator.showReloadConfirm;
export const isLoadingSelector = state => state.contextcreator && state.contextcreator.loading;
export const isValidContextNameSelector = state => state.contextcreator && state.contextcreator.isValidContextName;
