/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import get from "lodash/get";
import { createControlEnabledSelector } from "../../../selectors/controls";
import { CONTROL_NAME, DEFAULT_PROVIDER_CONFIG, ISOCHRONE_ROUTE_LAYER } from "../constants";
import { additionalLayersSelector } from "../../../selectors/additionallayers";

export const enabledSelector = createControlEnabledSelector(CONTROL_NAME);

export const searchLoadingSelector = (state) => get(state, 'isochrone.searchLoading', false);
export const searchResultsSelector = (state) => get(state, 'isochrone.searchResults', []);
export const searchErrorSelector = (state) => get(state, 'isochrone.searchError', null);

export const isochroneLocationSelector = (state) => get(state, 'isochrone.location', null);
export const isochroneLoadingSelector = (state) => get(state, 'isochrone.loading', false);
export const isochroneDataSelector = (state) =>  {
    const data = get(state, 'isochrone.data', []);
    const additionalLayers = additionalLayersSelector(state);
    return data.map((item) => ({
        ...item,
        layer: additionalLayers.find(layer => layer.id === ISOCHRONE_ROUTE_LAYER + `_run_${item.id}`)?.options || {}
    }));
};
export const isochroneLayersSelector = (state) => {
    const additionalLayers = additionalLayersSelector(state);
    return additionalLayers
        ?.filter(layer => layer?.owner?.includes(CONTROL_NAME));
};
export const isochroneLayersOwnerSelector = (state) => {
    return isochroneLayersSelector(state)
        ?.map(layer => layer.owner) || [];
};
export const isochroneSearchConfigSelector = (state) => get(state, 'isochrone.searchConfig', {});
export const isochroneCurrentRunParametersSelector = (state) => get(state, 'isochrone.currentRunParameters', DEFAULT_PROVIDER_CONFIG);
