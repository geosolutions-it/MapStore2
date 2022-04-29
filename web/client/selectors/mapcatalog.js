/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { mapTypeSelector as mtSelector, isCesium, last2dMapTypeSelector } from '../selectors/maptype';
import {get} from "lodash";

export const isActiveSelector = (state) => get(state, "controls.mapCatalog.enabled");
export const triggerReloadValueSelector = state => state.mapcatalog?.triggerReloadValue;
export const filterReloadDelaySelector = state => state.mapcatalog?.filterReloadDelay;
export const mapTypeSelector = state => {
    if (isCesium(state)) {
        return last2dMapTypeSelector(state);
    }
    return mtSelector(state);
};

