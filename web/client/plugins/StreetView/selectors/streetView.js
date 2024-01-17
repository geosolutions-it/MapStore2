import {createSelector} from 'reselect';
import { ServerTypes } from '../../../utils/LayersUtils';

import { PROVIDERS, CONTROL_NAME, MARKER_LAYER_ID, CYCLOMEDIA_CREDENTIALS_REFERENCE, CYCLOMEDIA_DEFAULT_MAX_RESOLUTION } from '../constants';
import { createControlEnabledSelector } from '../../../selectors/controls';
import { additionalLayersSelector } from '../../../selectors/additionallayers';
import { localConfigSelector } from '../../../selectors/localConfig';

export const enabledSelector = createControlEnabledSelector(CONTROL_NAME);
export const streetViewStateSelector = state => state?.streetView ?? {};
export const apiLoadedSelectorCreator = (provider) => state => streetViewStateSelector(state)?.apiLoaded?.[provider] ?? false;

/**
 * Gets the current street view location
 * @memberof selectors.streetview
 * @param {object} state
 * @returns {object} the current street view location ( minimal is `{latLng: {lat, lng, }}`. The rest of the properties are provider specific )
 */
export const locationSelector = createSelector(streetViewStateSelector, ({location} = {}) => location);
/**
 * Gets the current street view point of view
 * @memberof selectors.streetview
 * @param {object} state
 * @returns {object} the current street view point of view ( minimal is `{heading, pitch}`. The rest of the properties are provider specific )
 */
export const povSelector = createSelector(streetViewStateSelector, ({pov} = {}) => pov);

export function getStreetViewMarkerLayer(state) {
    const additionalLayers = additionalLayersSelector(state) ?? [];
    return additionalLayers.filter(({ id }) => id === MARKER_LAYER_ID)?.[0]?.options;
}
export function streetViewConfigurationSelector(state) {
    return streetViewStateSelector(state)?.configuration ?? {};
}

/**
 * Returns the current street-view provider selected for the plugin
 */
export function streetViewProviderSelector(state) {
    return streetViewConfigurationSelector( state)?.provider ?? 'google';
}
/**
 * Gets the current provider API loaded flag.
 * @memberof selectors.streetview
 * @param {object} state
 * @returns {boolean} the current provider API loaded flag
 */
export const currentProviderApiLoadedSelector = state => apiLoadedSelectorCreator(streetViewProviderSelector(state))(state);
/**
 * Gets the configuration for the current provider.
 * @memberof selectors.streetview
 * @param {object} state
 * @returns {object} the configuration for the current provider
 */
export const providerSettingsSelector = state => streetViewConfigurationSelector(state)?.providerSettings ?? {};
const GOOGLE_DATA_LAYER_DEFAULTS = {
    provider: 'custom',
    type: "tileprovider",
    url: "https://mts1.googleapis.com/vt?hl=en-US&lyrs=svv|cb_client:apiv3&style=40,18&x={x}&y={y}&z={z}"
};
const CYCLOMEDIA_DATA_LAYER_DEFAULTS = {
    type: "wfs",
    security: {
        type: 'Basic',
        sourceType: 'sessionStorage',
        sourceId: CYCLOMEDIA_CREDENTIALS_REFERENCE
    },
    strategy: 'bbox', // loads data only in the current extent
    maxResolution: CYCLOMEDIA_DEFAULT_MAX_RESOLUTION,
    serverType: ServerTypes.NO_VENDOR, // do not support CQL filters
    url: "https://atlasapi.cyclomedia.com/api/Recordings/wfs",
    name: "atlas:Recording",
    style: {
        format: "geostyler",
        body: {
            name: "My Style",
            rules: [
                {
                    name: "",
                    symbolizers: [
                        {
                            kind: "Mark",
                            color: "#0000ff",
                            fillOpacity: 1,
                            strokeColor: "#000000",
                            strokeOpacity: 1,
                            strokeWidth: 1,
                            radius: 5,
                            wellKnownName: "Circle",
                            msHeightReference: "none",
                            msBringToFront: true,
                            symbolizerId: "d2c4dab1-a0e7-11ee-a734-df08d0913056"
                        }
                    ],
                    ruleId: "d2c4dab0-a0e7-11ee-a734-df08d0913056"
                }
            ]
        }
    }
};
/**
 * Gets the default data layer configuration for the current provider.
 * @memberof selectors.streetview
 * @param {object} state
 * @returns {object} the data layer configuration for the current provider, or the default one if not configured
 */
const providerDataLayerDefaultsSelector = createSelector(
    streetViewProviderSelector,
    (provider) => {
        switch (provider) {
        case PROVIDERS.GOOGLE:
            return GOOGLE_DATA_LAYER_DEFAULTS;
        case PROVIDERS.CYCLOMEDIA:
            return CYCLOMEDIA_DATA_LAYER_DEFAULTS;
        default:
            return {};
        }
    }
);
/**
 * Gets the data layer configuration for the current provider.
 * @param {object} state
 * @memberof selectors.streetview
 * @returns {object} the data layer configuration for the current provider, or the default one if not configured
 */
export function streetViewDataLayerSelector(state) {
    return providerDataLayerDefaultsSelector(state);
}


/**
 * gets the API key for Google street view.
 * @memberof selectors.streetview
 * @returns the API key in cascade from plugin's `cfg.apiKey` property, `localConfig.json` properties (in this order of priority): `apiKeys.googleStreetViewAPIKey`, `apiKeys.googleAPIKey`, `googleAPIKey`.
 */
export function googleAPIKeySelector(state) {
    return streetViewConfigurationSelector(state)?.apiKey
        ?? localConfigSelector(state)?.apiKeys?.googleStreetViewAPIKey
        ?? localConfigSelector(state)?.apiKeys?.googleAPIKey
        ?? localConfigSelector(state)?.googleAPIKey;
}
/**
 * Selector for the cyclomedia API key
 * @memberof selectors.streetview
 * @param {object} state the state
 * @returns the API key in cascade from plugin's `cfg.apiKey` property, `localConfig.json` properties (in this order of priority): `apiKeys.cyclomediaAPIKey`.
 */
export function cyclomediaAPIKeySelector(state) {
    return streetViewConfigurationSelector(state)?.apiKey
        ?? localConfigSelector(state)?.apiKeys?.cyclomediaAPIKey;
}
/**
 * Selector for the API key for the current provider
 * @memberof selectors.streetview
 * @param {object} state the state
 * @returns the API key for the current provider
 */
export function streetViewAPIKeySelector(state) {
    switch (streetViewProviderSelector(state)) {
    case PROVIDERS.GOOGLE:
        return googleAPIKeySelector(state);
    case PROVIDERS.CYCLOMEDIA:
        return cyclomediaAPIKeySelector(state);
    default:
        return null;
    }
}
/**
 * gets the useDataLayer flag actually loaded
 * @memberof selectors.streetview
 * @param {object} state
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
