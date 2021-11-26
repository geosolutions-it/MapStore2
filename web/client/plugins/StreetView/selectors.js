import {createSelector} from 'reselect';

import { createControlEnabledSelector } from '../../selectors/controls';
import { mapLayoutValuesSelector } from '../../selectors/maplayout';
import { additionalLayersSelector } from '../../selectors/additionallayers';

import { CONTROL_NAME, MARKER_LAYER_ID } from './constants';

export const enabledSelector = createControlEnabledSelector(CONTROL_NAME);
export const layoutSelector = state => mapLayoutValuesSelector(state, {left: true, bottom: true, right: true});
export const streetViewStateSelector = state => state?.streetView ?? {};
export const apiLoadedSelector = state => streetViewStateSelector(state)?.apiLoaded;
export const locationSelector = createSelector(streetViewStateSelector, ({location} = {}) => location);
export const povSelector = createSelector(streetViewStateSelector, ({pov} = {}) => pov);
export function getStreetViewMarkerLayer(state) {
    const additionalLayers = additionalLayersSelector(state) ?? [];
    return additionalLayers.filter(({ id }) => id === MARKER_LAYER_ID)?.[0]?.options;
}

export function useStreetViewDataLayerSelector() { return true; } // TODO: get from plugin options
const DATA_LAYER_DEFAULTS = {
    provider: 'custom',
    type: "tileprovider",
    url: "https://mts1.googleapis.com/vt?hl=en-US&lyrs=svv|cb_client:apiv3&style=40,18&x={x}&y={y}&z={z}"
};
export function streetViewDataLayerSelector() {
    return DATA_LAYER_DEFAULTS;
}
