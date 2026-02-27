/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { mapIsEditableSelector } from "./map";

export const crsInputValueSelector = state => state && state.crsselector && state.crsselector.value;
export const crsProjectionsConfigSelector = state => state && state.crsselector && state.crsselector.config;
export const crsCanEditSelector = state => state && state.crsselector && state.crsselector.canEdit;

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
