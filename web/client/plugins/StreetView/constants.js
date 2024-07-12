// ///////////////////////////////
// GENERAL CONSTANTS
// ///////////////////////////////

export const CONTROL_NAME = "street-view";
export const STREET_VIEW_OWNER = CONTROL_NAME;
// identifier of the street view position placeholder layer
export const MARKER_LAYER_ID = "street-view-marker";
export const STREET_VIEW_DATA_LAYER_ID = "street-view-data";
export const PROVIDERS = {
    GOOGLE: 'google',
    CYCLOMEDIA: 'cyclomedia',
    MAPILLARY: "mapillary"
};

// ///////////////////////////////
// CYCLOMEDIA SPECIFIC CONSTANTS
// ///////////////////////////////
/** This value has been chosen empirically.
 * 2 sometimes makes the server not return all the data
 */
export const CYCLOMEDIA_DEFAULT_MAX_RESOLUTION = 1;
/**
 * Unique key to find the credentials in the global state
 */
export const CYCLOMEDIA_CREDENTIALS_REFERENCE = "__cycloMedia_streetView_source_credential__";
