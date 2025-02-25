import { toggleControl } from "../../../actions/controls";
import { error } from '../../../actions/notifications';

import API from "../api";
import { CONTROL_NAME } from "../constants";
import {
    apiLoadedSelectorCreator,
    streetViewAPIKeySelector,
    streetViewProviderSelector,
    providerSettingsSelector
} from "../selectors/streetView";


export const TOGGLE_STREET_VIEW = "STREET_VIEW:TOGGLE";
export const API_LOADING = "STREET_VIEW:API_LOADING";
export const API_LOADED = "STREET_VIEW:API_LOADED";

export const SET_LOCATION = "STREET_VIEW:SET_LOCATION";
export const SET_POV = "STREET_VIEW:SET_POV";
export const CONFIGURE = "STREET_VIEW:CONFIGURE";
export const RESET = "STREET_VIEW:RESET";
export const RESET_STREET_VIEW_DATA = "STREET_VIEW:RESET_STREET_VIEW_DATA";
export const UPDATE_STREET_VIEW_LAYER = "STREET_VIEW:UPDATE_STREET_VIEW_LAYER";

export function setAPILoading(loading) {
    return {
        type: API_LOADING,
        loading
    };
}
export function streetViewAPILoaded(provider) {
    return {
        type: API_LOADED,
        provider
    };
}
export function toggleStreetView() {
    return (dispatch, getState) => {
        const provider = streetViewProviderSelector(getState());
        if (!apiLoadedSelectorCreator(provider)(getState())) {
            setAPILoading(true);
            const apiKey = streetViewAPIKeySelector(getState());
            const providerSettings = providerSettingsSelector(getState());
            if (!API[provider]) {
                console.error(`No API found for provider ${provider}`);
                dispatch(error({title: "streetView.title", message: `No API found for provider ${provider}`}));
            }
            API[provider].loadAPI({apiKey, providerSettings}).then(() => {
                setAPILoading(false);
                dispatch(streetViewAPILoaded(provider));
                dispatch(toggleControl(CONTROL_NAME, "enabled"));
            }).catch(e => {
                setAPILoading(false);
                    console.log(e); // eslint-disable-line
            });
        } else {
            dispatch(toggleControl(CONTROL_NAME, "enabled"));
        }

    };
}
/**
 * Updates the properties of the street view layer.
 * @param {object} updates properties to update
 * @returns {object}
 */
export function updateStreetViewLayer(updates) {
    return {
        type: UPDATE_STREET_VIEW_LAYER,
        updates
    };
}
export function setLocation(location) {
    return {
        type: SET_LOCATION,
        location
    };
}
/**
 *
 * @param {object} pov pov object. Can contain :
 * @param {number} pov.heading heading in degrees
 * @param {number} pov.pitch pitch in degrees
 */
export function setPov(pov) {
    return {
        type: SET_POV,
        pov
    };
}
/**
 * Sets the plugin configuration.
 * @param {object} configuration . Can contain :
 * @param {string} configuration.googleAPIKey the API key to use.
 */
export function configure(configuration) {
    return {
        type: CONFIGURE,
        configuration
    };
}
/**
 * Resets the plugin on unmount
 */
export function reset() {
    return {
        type: RESET
    };
}

/**
 * Resets the plugin on unmount
 */
export function resetViewerData() {
    return {
        type: RESET_STREET_VIEW_DATA
    };
}
