/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import { get } from 'lodash';

/**
 * Checks for an error when a map is accessed
 * @function
 * @memberof selectors.mapInitialConfig
 * @param  {object} state the state
 * @return {object} error object
 */
export const hasMapAccessLoadingError = (state) => get(state, "mapInitialConfig.loadingError");
export const mapIdSelector = (state) => state.mapInitialConfig?.mapId;
