import { toggleControl } from "../../../actions/controls";

import { loadGoogleMapsAPI } from "../api/gMaps";
import { CONTROL_NAME } from "../constants";
import { apiLoadedSelector, googleAPIKeySelector } from "../selectors/streetView";


export const TOGGLE_STREET_VIEW = "STREET_VIEW:TOGGLE";
export const API_LOADING = "STREET_VIEW:API_LOADING";
export const API_LOADED = "STREET_VIEW:API_LOADED";

export const SET_LOCATION = "STREET_VIEW:SET_LOCATION";
export const SET_POV = "STREET_VIEW:SET_POV";
export const CONFIGURE = "STREET_VIEW:CONFIGURE";
export const RESET = "STREET_VIEW:RESET";

export function setAPILoading(loading) {
    return {
        type: API_LOADING,
        loading
    };
}
export function gMapsAPILoaded() {
    return {
        type: API_LOADED
    };
}
export function toggleStreetView() {
    return (dispatch, getState) => {
        if (!apiLoadedSelector(getState())) {
            setAPILoading(true);
            const apiKey = googleAPIKeySelector(getState());
            loadGoogleMapsAPI({apiKey}).then(() => {
                setAPILoading(false);
                dispatch(gMapsAPILoaded());
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

export function setLocation(location) {
    return {
        type: SET_LOCATION,
        location
    };
}
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
