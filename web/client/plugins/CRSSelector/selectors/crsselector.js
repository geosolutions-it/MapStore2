/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { mapIsEditableSelector } from "../../../selectors/map";

export const crsInputValueSelector = state => state && state.crsselector && state.crsselector.value;
export const crsProjectionsConfigSelector = state => state && state.crsselector && state.crsselector.config;
export const crsCanEditSelector = state => state && state.crsselector && state.crsselector.canEdit;

/**
 * Returns the configured per-CRS resolutions, keyed by SRS code.
 * Returns an empty object when no custom resolutions are configured.
 * @memberof selectors.crsselector
 * @param {object} state the application state
 * @returns {object}
 */
export const customResolutionsByCrsSelector = (state) =>
    state?.crsselector?.config?.customResolutions || {};

/**
 * Returns the array of custom resolutions configured for the given CRS, or `undefined` when no custom resolutions are configured for it.
 * @memberof selectors.crsselector
 * @param {object} state the application state
 * @param {string} crs the target SRS code (e.g. "EPSG:4326")
 * @returns {number[]|undefined}
 */
export const customResolutionsForCrsSelector = (state, crs) =>
    crs ? customResolutionsByCrsSelector(state)[crs] : undefined;

/**
 * Selects canEdit projection configuration value if any
 * @memberof selectors.crsselector
 * @param  {object} state the state
 * @returns {object}
 */
export const canEditProjectionSelector = state => {
    const canEdit = crsCanEditSelector(state);
    const canEditMap = mapIsEditableSelector(state);
    if (canEdit === undefined) {
        return canEditMap;
    }
    return canEdit;
};
