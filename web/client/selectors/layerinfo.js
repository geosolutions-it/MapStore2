/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const layerInfoControlEnabledSelector = state => state.controls?.layerinfo?.enabled;
export const layersSelector = state => state.layerinfo?.layers;
export const loadingSelector = state => state.layerinfo?.loading;
export const loadFlagsSelector = state => state.layerinfo?.loadFlags;
export const syncStatusSelector = state => state.layerinfo?.syncStatus;
export const errorSelector = state => state.layerinfo?.error;
