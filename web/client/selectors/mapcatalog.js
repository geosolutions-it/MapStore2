/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { mapTypeSelector as mtSelector, is3DMode } from '../selectors/maptype';
import { get } from "lodash";
import { getMapLibraryFromVisualizationMode, VisualizationModes } from '../utils/MapTypeUtils';

export const isActiveSelector = (state) => get(state, "controls.mapCatalog.enabled");
export const triggerReloadValueSelector = state => state.mapcatalog?.triggerReloadValue;
export const filterReloadDelaySelector = state => state.mapcatalog?.filterReloadDelay;
export const mapTypeSelector = state => {
    if (is3DMode(state)) {
        return getMapLibraryFromVisualizationMode(VisualizationModes._2D);
    }
    return mtSelector(state);
};
