/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const newContextSelector = state => state.contextcreator && state.contextcreator.newContext;
export const creationStepSelector = state => state.contextcreator && state.contextcreator.stepId;
export const sourceSelector = state => state.contextcreator && state.contextcreator.source;
export const resourceSelector = state => state.contextcreator && state.contextcreator.resource;
