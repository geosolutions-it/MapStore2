import {createSelector} from 'reselect';

import { createControlEnabledSelector } from '../../../selectors/controls';
import { additionalLayersSelector } from '../../../selectors/additionallayers';

import { CONTROL_NAME, MARKER_LAYER_ID } from '../constants';
import { localConfigSelector } from '../../../selectors/localConfig';

export const enabledSelector = createControlEnabledSelector(CONTROL_NAME);
export const streetViewStateSelector = state => state?.streetView ?? {};
export const apiLoadedSelector = state => streetViewStateSelector(state)?.apiLoaded;
export const locationSelector = createSelector(streetViewStateSelector, ({location} = {}) => location);
export const povSelector = createSelector(streetViewStateSelector, ({pov} = {}) => pov);
export function getStreetViewMarkerLayer(state) {
    const additionalLayers = additionalLayersSelector(state) ?? [];
    return additionalLayers.filter(({ id }) => id === MARKER_LAYER_ID)?.[0]?.options;
}
export function streetViewConfigurationSelector(state) {
    return streetViewStateSelector(state)?.configuration ?? {};
}

const DATA_LAYER_DEFAULTS = {
    provider: 'custom',
    type: "tileprovider",
    url: "https://mts1.googleapis.com/vt?hl=en-US&lyrs=svv|cb_client:apiv3&style=40,18&x={x}&y={y}&z={z}"
};
export function streetViewDataLayerSelector(state) {
    return streetViewConfigurationSelector(state)?.dataLayerConfig ?? DATA_LAYER_DEFAULTS;
}


/**
 * gets the API key for Google street view.
 * @returns the API key in cascade from plugin's `cfg.apiKey` property, `localConfig.json` properties (in this order of priority): `apiKeys.googleStreetViewAPIKey`, `apiKeys.googleAPIKey`, `googleAPIKey`.
 */
export function googleAPIKeySelector(state) {
    return streetViewConfigurationSelector(state)?.apiKey
        ?? localConfigSelector(state)?.apiKeys?.googleStreetViewAPIKey
        ?? localConfigSelector(state)?.apiKeys?.googleAPIKey
        ?? localConfigSelector(state)?.googleAPIKey;
}
/**
 * gets the useDataLayer flag actually loaded
 * @returns {boolean} the flag value
 */
export function useStreetViewDataLayerSelector(state) {
    return streetViewConfigurationSelector(state)?.useDataLayer ?? true;
}

/**
 * gets from the state the panorama options currently loaded
 * @param {object} state
 * @returns the panorama options configured
 */
export function panoramaOptionsSelector(state) {
    return streetViewConfigurationSelector(state)?.panoramaOptions;
}
